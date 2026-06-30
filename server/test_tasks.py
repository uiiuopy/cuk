import urllib.request
from pathlib import Path
import os
import sys

url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
dst = Path("server/face_landmarker.task")

if not dst.exists():
    print("Downloading FaceLandmarker task...")
    try:
        urllib.request.urlretrieve(url, dst)
        print("Downloaded successfully.")
    except Exception as e:
        print(f"Download failed: {e}")
        sys.exit(1)

try:
    import mediapipe as mp
    from mediapipe.tasks.python import vision
    from mediapipe.tasks.python.core.base_options import BaseOptions

    options = vision.FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(dst)),
        running_mode=vision.RunningMode.VIDEO,
        num_faces=1,
        min_face_detection_confidence=0.5,
        min_face_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )
    landmarker = vision.FaceLandmarker.create_from_options(options)
    print("FaceLandmarker initialized successfully using modern tasks API!")
except Exception as e:
    print(f"Initialization failed: {e}")
