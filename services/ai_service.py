"""
AyurTrust — ai_service.py (Member 2)
Real MobileNetV2 species classifier, replacing the placeholder stub.

Called from api/routes.py as: ai_service.verify_herb_image(image_bytes)
Expects: species_classifier.keras and class_names.txt to be present in ai_models/
"""

import io

import numpy as np
import tensorflow as tf
from PIL import Image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

MODEL_PATH = "ai_models/species_classifier.keras"
CLASS_NAMES_PATH = "ai_models/class_names.txt"
IMG_SIZE = (224, 224)

_model = None
_class_names = None


def _load_model_and_classes():
    """Loads the model once, reuses across requests instead of reloading every call."""
    global _model, _class_names
    if _model is None:
        _model = tf.keras.models.load_model(MODEL_PATH)
        with open(CLASS_NAMES_PATH, "r") as f:
            _class_names = [line.strip() for line in f if line.strip()]
    return _model, _class_names


def verify_herb_image(image_bytes: bytes) -> dict:
    """
    Takes raw image bytes (from an uploaded file), returns:
        {
            "status": "Verified" | "Uncertain",
            "confidence": float (0.0 to 1.0),
            "species": str
        }

    Note: the 0.85 accept/reject threshold is enforced in api/routes.py,
    not here — this function just reports what the model sees.
    """
    model, class_names = _load_model_and_classes()

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(IMG_SIZE)
    arr = np.expand_dims(np.array(img), axis=0).astype("float32")
    arr = preprocess_input(arr)

    predictions = model.predict(arr, verbose=0)[0]
    top_idx = int(np.argmax(predictions))
    confidence = float(predictions[top_idx])

    return {
        "status": "Verified" if confidence >= 0.85 else "Uncertain",
        "confidence": round(confidence, 4),
        "species": class_names[top_idx],
    }