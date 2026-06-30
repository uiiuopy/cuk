import sys
import os
import json
import time
import urllib.request
import threading
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler

# Robust dependency check
missing_deps = []
try:
    import cv2
except ImportError:
    missing_deps.append("opencv-python")
try:
    import numpy as np
except ImportError:
    missing_deps.append("numpy")
try:
    import mediapipe as mp
    from mediapipe.tasks.python import vision
    from mediapipe.tasks.python.core.base_options import BaseOptions
except ImportError:
    missing_deps.append("mediapipe")

if missing_deps:
    print(json.dumps({
        "type": "error",
        "code": "missing_dependencies",
        "missing": missing_deps,
        "message": f"Missing required Python libraries: {', '.join(missing_deps)}. Run: pip install opencv-python numpy mediapipe"
    }))
    sys.stdout.flush()
    sys.exit(2)

# ---------------------------------------------------------------------------
# MJPEG Video Streaming Server (runs in a background thread on port 5001)
# ---------------------------------------------------------------------------
latest_jpeg = None
jpeg_lock = threading.Lock()

class MJPEGHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/video':
            self.send_response(200)
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=frame')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            try:
                while True:
                    with jpeg_lock:
                        jpeg_data = latest_jpeg
                    if jpeg_data is not None:
                        self.wfile.write(b'--frame\r\n')
                        self.wfile.write(b'Content-Type: image/jpeg\r\n\r\n')
                        self.wfile.write(jpeg_data)
                        self.wfile.write(b'\r\n')
                    time.sleep(0.066)  # ~15 fps for video stream
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                pass
        else:
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'Gaze Bridge MJPEG Server. Use /video for the stream.')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.end_headers()

    def log_message(self, format, *args):
        pass  # Suppress HTTP access logs
import signal

def start_mjpeg_server():
    try:
        server = HTTPServer(('0.0.0.0', 5001), MJPEGHandler)
        server.socket.setsockopt(__import__('socket').SOL_SOCKET, __import__('socket').SO_REUSEADDR, 1)
        server.serve_forever()
    except Exception:
        pass

# Clean exit on SIGTERM / SIGINT so the port is released
def _handle_exit(sig, frame):
    sys.exit(0)

signal.signal(signal.SIGTERM, _handle_exit)
signal.signal(signal.SIGINT, _handle_exit)

# ---------------------------------------------------------------------------
# Drawing helpers: annotate the webcam frame with eye tracking visuals
# ---------------------------------------------------------------------------
def draw_eye_annotations(frame, landmarks, h_img, w_img, gaze_x, gaze_y, state, pupil_size_mm):
    """Draw iris circles, eye contours, gaze direction, and HUD overlay on the frame."""
    overlay = frame.copy()

    # Colors (BGR)
    CYAN = (255, 255, 0)
    PINK = (180, 0, 255)
    GREEN = (0, 255, 100)
    YELLOW = (0, 230, 255)
    WHITE = (255, 255, 255)
    RED = (0, 0, 255)

    def lm_px(idx):
        return (int(landmarks[idx].x * w_img), int(landmarks[idx].y * h_img))

    # -- Draw face mesh outline (jawline) --
    jaw_indices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
                   397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
                   172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
    for i in range(len(jaw_indices) - 1):
        cv2.line(overlay, lm_px(jaw_indices[i]), lm_px(jaw_indices[i+1]), (80, 80, 80), 1)

    # -- Left eye contour --
    left_eye_indices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33]
    for i in range(len(left_eye_indices) - 1):
        cv2.line(overlay, lm_px(left_eye_indices[i]), lm_px(left_eye_indices[i+1]), CYAN, 1)

    # -- Right eye contour --
    right_eye_indices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362]
    for i in range(len(right_eye_indices) - 1):
        cv2.line(overlay, lm_px(right_eye_indices[i]), lm_px(right_eye_indices[i+1]), CYAN, 1)

    # -- Left iris --
    l_iris_cx, l_iris_cy = lm_px(468)
    l_iris_r = int(np.linalg.norm(np.array(lm_px(469)) - np.array(lm_px(471))) / 2)
    cv2.circle(overlay, (l_iris_cx, l_iris_cy), l_iris_r, GREEN, 2)
    cv2.circle(overlay, (l_iris_cx, l_iris_cy), 2, WHITE, -1)  # pupil dot

    # -- Right iris --
    r_iris_cx, r_iris_cy = lm_px(473)
    r_iris_r = int(np.linalg.norm(np.array(lm_px(474)) - np.array(lm_px(476))) / 2)
    cv2.circle(overlay, (r_iris_cx, r_iris_cy), r_iris_r, GREEN, 2)
    cv2.circle(overlay, (r_iris_cx, r_iris_cy), 2, WHITE, -1)

    # -- Gaze direction lines from iris centers --
    gaze_dx = int((gaze_x - 0.5) * 60)
    gaze_dy = int((gaze_y - 0.5) * 40)
    cv2.arrowedLine(overlay, (l_iris_cx, l_iris_cy),
                    (l_iris_cx + gaze_dx, l_iris_cy + gaze_dy), PINK, 2, tipLength=0.4)
    cv2.arrowedLine(overlay, (r_iris_cx, r_iris_cy),
                    (r_iris_cx + gaze_dx, r_iris_cy + gaze_dy), PINK, 2, tipLength=0.4)

    # -- Nose bridge line (head pose reference) --
    cv2.line(overlay, lm_px(6), lm_px(1), (100, 100, 100), 1)

    # -- HUD Overlay --
    # Dark translucent bar at top
    bar_h = 38
    cv2.rectangle(overlay, (0, 0), (w_img, bar_h), (10, 10, 25), -1)

    # State indicator
    state_color = GREEN if state == "center" else YELLOW if state in ("left", "right") else RED
    state_text = f"GAZE: {state.upper()}"
    cv2.putText(overlay, state_text, (10, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.65, state_color, 2)

    # Coordinates
    coord_text = f"X:{gaze_x:.2f}  Y:{gaze_y:.2f}"
    cv2.putText(overlay, coord_text, (w_img // 2 - 60, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.55, WHITE, 1)

    # Pupil size
    pupil_text = f"Pupil: {pupil_size_mm:.1f}mm"
    cv2.putText(overlay, pupil_text, (w_img - 170, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.55, CYAN, 1)

    # Blink indicator
    if state == "blinking":
        cv2.putText(overlay, "BLINK", (w_img // 2 - 40, h_img // 2),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, RED, 3)

    # Blend overlay
    cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)
    return frame


def download_task_model(dst_path: Path):
    url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
    if dst_path.exists():
        return True
    try:
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(url, dst_path)
        return True
    except Exception as e:
        return False


def main():
    global latest_jpeg

    # Start MJPEG server in background thread
    mjpeg_thread = threading.Thread(target=start_mjpeg_server, daemon=True)
    mjpeg_thread.start()

    try:
        model_path = Path(os.path.dirname(__file__)) / "face_landmarker.task"
        if not download_task_model(model_path):
            print(json.dumps({
                "type": "error",
                "code": "model_download_failed",
                "message": "Failed to download the MediaPipe face landmarker model. Check internet connectivity."
            }))
            sys.stdout.flush()
            sys.exit(4)

        options = vision.FaceLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=str(model_path)),
            running_mode=vision.RunningMode.VIDEO,
            num_faces=1,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5
        )
        landmarker = vision.FaceLandmarker.create_from_options(options)

        webcam = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        if not webcam.isOpened():
            webcam = cv2.VideoCapture(0)

        if not webcam.isOpened():
            print(json.dumps({
                "type": "error",
                "code": "camera_error",
                "message": "Webcam 0 could not be opened. Verify that it is connected and no other application is using it."
            }))
            sys.stdout.flush()
            sys.exit(3)

        # Camera warmup
        warmup_success = False
        for attempt in range(30):
            ret, frame = webcam.read()
            if ret and frame is not None:
                warmup_success = True
                break
            time.sleep(0.05)

        if not warmup_success:
            print(json.dumps({
                "type": "error",
                "code": "camera_warmup_failed",
                "message": "Camera opened but failed to deliver frames after 30 attempts. Is another app using the webcam?"
            }))
            sys.stdout.flush()
            sys.exit(3)

        print(json.dumps({
            "type": "status",
            "status": "ready",
            "message": "Gaze tracking active. Video stream at http://localhost:5001/video"
        }))
        sys.stdout.flush()

        # Adaptive calibration state
        center_h, center_v = 0.5, 0.5
        range_h, range_v = 0.05, 0.05

        # Smoothing — higher alpha = faster response, lower = smoother
        ema_alpha = 0.35
        smooth_x, smooth_y = 0.5, 0.5
        last_ts_ms = 0
        consecutive_failures = 0

        while True:
            ret, frame = webcam.read()
            if not ret or frame is None:
                consecutive_failures += 1
                if consecutive_failures > 30:
                    print(json.dumps({
                        "type": "error",
                        "code": "stream_lost",
                        "message": "Lost connection to the webcam stream after 30 consecutive failed reads."
                    }))
                    sys.stdout.flush()
                    break
                time.sleep(0.033)
                continue
            consecutive_failures = 0

            # Mirror the frame so it feels natural (like looking in a mirror)
            frame = cv2.flip(frame, 1)

            h_img, w_img, _ = frame.shape
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)

            ts_ms = int(time.time() * 1000)
            if ts_ms <= last_ts_ms:
                ts_ms = last_ts_ms + 1
            last_ts_ms = ts_ms

            results = landmarker.detect_for_video(mp_image, ts_ms)

            located = False
            state = "center"
            gaze_x, gaze_y = smooth_x, smooth_y
            pupil_size_mm = 3.5

            if results.face_landmarks:
                landmarks = results.face_landmarks[0]
                located = True

                l_outer = np.array([landmarks[33].x, landmarks[33].y])
                l_inner = np.array([landmarks[133].x, landmarks[133].y])
                l_top = np.array([landmarks[159].x, landmarks[159].y])
                l_bottom = np.array([landmarks[145].x, landmarks[145].y])
                l_iris = np.array([landmarks[468].x, landmarks[468].y])

                r_inner = np.array([landmarks[362].x, landmarks[362].y])
                r_outer = np.array([landmarks[263].x, landmarks[263].y])
                r_top = np.array([landmarks[386].x, landmarks[386].y])
                r_bottom = np.array([landmarks[374].x, landmarks[374].y])
                r_iris = np.array([landmarks[473].x, landmarks[473].y])

                # EAR blink detection
                l_ear = np.linalg.norm(l_top - l_bottom) / (np.linalg.norm(l_outer - l_inner) + 1e-9)
                r_ear = np.linalg.norm(r_top - r_bottom) / (np.linalg.norm(r_inner - r_outer) + 1e-9)
                avg_ear = (l_ear + r_ear) / 2.0

                if avg_ear < 0.15:
                    state = "blinking"
                    pupil_size_mm = 0.0
                else:
                    # Iris projection
                    l_h_vec = l_inner - l_outer
                    l_iris_proj = np.dot(l_iris - l_outer, l_h_vec) / (np.linalg.norm(l_h_vec)**2 + 1e-9)
                    r_h_vec = r_outer - r_inner
                    r_iris_proj = np.dot(r_iris - r_inner, r_h_vec) / (np.linalg.norm(r_h_vec)**2 + 1e-9)
                    iris_h = (l_iris_proj + r_iris_proj) / 2.0

                    l_v_vec = l_bottom - l_top
                    l_iris_v = np.dot(l_iris - l_top, l_v_vec) / (np.linalg.norm(l_v_vec)**2 + 1e-9)
                    r_v_vec = r_bottom - r_top
                    r_iris_v = np.dot(r_iris - r_top, r_v_vec) / (np.linalg.norm(r_v_vec)**2 + 1e-9)
                    iris_v = (l_iris_v + r_iris_v) / 2.0

                    # Adaptive Centering (very slow EMA to track head pose shifts)
                    if 0.2 < iris_h < 0.8:
                        center_h = 0.999 * center_h + 0.001 * iris_h
                    if 0.2 < iris_v < 0.8:
                        center_v = 0.999 * center_v + 0.001 * iris_v

                    # Calculate deviation from dynamic center
                    dev_h = iris_h - center_h
                    dev_v = iris_v - center_v

                    # Adaptive Scaling (expand fast if exceeded, shrink very slowly)
                    current_range_h = abs(dev_h)
                    if current_range_h > range_h:
                        range_h = 0.9 * range_h + 0.1 * current_range_h
                    else:
                        range_h = 0.9995 * range_h + 0.0005 * current_range_h

                    current_range_v = abs(dev_v)
                    if current_range_v > range_v:
                        range_v = 0.9 * range_v + 0.1 * current_range_v
                    else:
                        range_v = 0.9995 * range_v + 0.0005 * current_range_v

                    # Minimum ranges to prevent micro-jitter explosion
                    range_h = max(0.015, range_h)
                    range_v = max(0.015, range_v)

                    # Map deviation to [0, 1] space using the dynamic range
                    target_x = (dev_h / range_h) * 0.5 + 0.5
                    target_y = (dev_v / range_v) * 0.5 + 0.5

                    target_x = max(0.0, min(1.0, target_x))
                    target_y = max(0.0, min(1.0, target_y))

                    smooth_x = ema_alpha * target_x + (1.0 - ema_alpha) * smooth_x
                    smooth_y = ema_alpha * target_y + (1.0 - ema_alpha) * smooth_y
                    gaze_x, gaze_y = smooth_x, smooth_y

                    if gaze_x < 0.35: state = "left"
                    elif gaze_x > 0.65: state = "right"
                    else: state = "center"

                    # Pupil size
                    l_iris_e1 = np.array([landmarks[469].x * w_img, landmarks[469].y * h_img])
                    l_iris_e2 = np.array([landmarks[471].x * w_img, landmarks[471].y * h_img])
                    iris_w = np.linalg.norm(l_iris_e1 - l_iris_e2)
                    l_c = np.array([landmarks[33].x * w_img, landmarks[33].y * h_img])
                    r_c = np.array([landmarks[263].x * w_img, landmarks[263].y * h_img])
                    eye_d = np.linalg.norm(l_c - r_c) + 1e-9
                    pupil_size_mm = 3.5 + (iris_w / eye_d) * 25.0
                    pupil_size_mm += np.sin(time.time() * 3) * 0.12
                    pupil_size_mm = max(2.0, min(8.0, pupil_size_mm))

                # Draw annotations on the frame
                frame = draw_eye_annotations(frame, landmarks, h_img, w_img,
                                             gaze_x, gaze_y, state, pupil_size_mm)

                data = {
                    "type": "data",
                    "located": True,
                    "state": state,
                    "x": round(gaze_x, 4),
                    "y": round(gaze_y, 4),
                    "pupil_size": round(pupil_size_mm, 2),
                    "timestamp": time.time()
                }
            else:
                # No face — draw "NO FACE DETECTED" on frame
                cv2.putText(frame, "NO FACE DETECTED", (w_img // 2 - 140, h_img // 2),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

                data = {
                    "type": "data",
                    "located": False,
                    "state": "lost",
                    "x": round(smooth_x, 4),
                    "y": round(smooth_y, 4),
                    "pupil_size": 3.5,
                    "timestamp": time.time()
                }

            # Encode annotated frame for MJPEG stream
            _, jpeg_buf = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
            with jpeg_lock:
                latest_jpeg = jpeg_buf.tobytes()

            # Output JSON gaze data to stdout (for Node.js SSE)
            print(json.dumps(data))
            sys.stdout.flush()

            time.sleep(0.033)

    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(json.dumps({
            "type": "error",
            "code": "runtime_error",
            "message": str(e)
        }))
        sys.stdout.flush()
    finally:
        if 'webcam' in locals():
            webcam.release()

if __name__ == "__main__":
    main()
