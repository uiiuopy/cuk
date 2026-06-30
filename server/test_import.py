import sys

try:
    import mediapipe as mp
    print("Base mediapipe imported.")
except Exception as e:
    print(f"Base import failed: {e}")

try:
    from mediapipe.python.solutions import face_mesh as mp_face_mesh
    print("face_mesh imported via mediapipe.python.solutions.")
    mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
    print("FaceMesh initialized successfully.")
except Exception as e:
    print(f"mediapipe.python.solutions failed: {e}")

try:
    import mediapipe.solutions.face_mesh as mp_face_mesh
    print("face_mesh imported via mediapipe.solutions.face_mesh.")
    mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
    print("FaceMesh initialized successfully.")
except Exception as e:
    print(f"mediapipe.solutions.face_mesh failed: {e}")
