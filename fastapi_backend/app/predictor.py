"""Loads the trained model and makes predictions on uploaded leaf images.

IMPORTANT: preprocessing here MUST match training exactly:
  denoise (NLM) -> CLAHE -> resize 299x299 -> MobileNetV2 preprocess_input
Any mismatch between training and inference preprocessing hurts accuracy.
"""
import json
import os
import io
import numpy as np
import cv2
import tensorflow as tf
from PIL import Image, ImageOps

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "mobilenet_9way.keras")   # NEW 9-class model
CLASSES_PATH = os.path.join(MODEL_DIR, "class_names.json")

IMG_SIZE = 299                       # matches training (was 224 — WRONG before)
CONFIDENCE_THRESHOLD = 55.0          # below this, treat as uncertain/invalid

REJECT_CLASSES = {"Background", "Not_Maize_Or_Wheat"}

REJECT_MESSAGES = {
    "Background": {
        "en": "No leaf detected. Please point the camera at a wheat or maize leaf.",
        "ne": "कुनै पात फेला परेन। कृपया क्यामेरालाई गहुँ वा मकैको पाततिर लक्षित गर्नुहोस्।",
    },
    "Not_Maize_Or_Wheat": {
        "en": "This doesn't look like a wheat or maize leaf.",
        "ne": "यो गहुँ वा मकैको पात जस्तो देखिँदैन।",
    },
    "LowConfidence": {
        "en": "Image unclear or not a recognized leaf. Please retake the photo in good light.",
        "ne": "तस्बिर अस्पष्ट छ वा पहिचान गर्न सकिएन। कृपया राम्रो उज्यालोमा फेरि खिच्नुहोस्।",
    },
}

_model = None
_class_names = None


def _load():
    global _model, _class_names
    if _model is None:
        _model = tf.keras.models.load_model(MODEL_PATH)
        with open(CLASSES_PATH) as f:
            _class_names = json.load(f)
    return _model, _class_names


def _enhance(img_array):
    """NLM denoise + CLAHE — MUST match the enhancement used to build the
    training dataset (dataset_enhanced)."""
    # img_array is RGB uint8
    denoised = cv2.fastNlMeansDenoisingColored(img_array, None, 7, 7, 7, 21)
    lab = cv2.cvtColor(denoised, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    enhanced = cv2.merge((l, a, b))
    return cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)


def _jpeg_roundtrip(img_array, quality=90):
    """Replicate the JPEG quality-90 save that every training image went through
    (the denoising script saved enhanced images with quality=90). Doing the same
    here makes inference input match the training distribution exactly."""
    bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    ok, enc = cv2.imencode(".jpg", bgr, [cv2.IMWRITE_JPEG_QUALITY, quality])
    dec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
    return cv2.cvtColor(dec, cv2.COLOR_BGR2RGB)


def predict_image(image_bytes: bytes):
    model, class_names = _load()

    # --- Load + orient + RGB (same as before) ---
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)     # respect phone rotation
    img = img.convert("RGB")

    # --- Enhancement to MATCH training (denoise + CLAHE) ---
    arr = np.array(img)                    # RGB uint8
    arr = _enhance(arr)                    # <-- the critical addition
    arr = _jpeg_roundtrip(arr)            # match training's quality=90 JPEG save

    # --- Resize to 299 (matches training) ---
    arr = cv2.resize(arr, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_AREA)

    # --- Feed RAW 0-255 float pixels. Do NOT apply preprocess_input here:
    #     the model has MobileNetV2 preprocessing built in as an internal layer,
    #     so scaling here would double-preprocess and destroy predictions. ---
    arr = arr.astype(np.float32)
    arr = np.expand_dims(arr, axis=0)

    # --- Predict ---
    probs = model.predict(arr, verbose=0)[0]
    idx = int(np.argmax(probs))
    raw_label = class_names[idx]
    confidence = round(float(probs[idx]) * 100, 2)

    is_reject_class = raw_label in REJECT_CLASSES
    is_low_conf = confidence < CONFIDENCE_THRESHOLD
    is_reject = is_reject_class or is_low_conf

    result = {
        "class_key": raw_label,
        "is_valid_leaf": not is_reject,
        "confidence": confidence,
        "all_probabilities": {
            class_names[i].replace("_", " "): round(float(p) * 100, 2)
            for i, p in enumerate(probs)
        },
    }

    if is_reject:
        result["disease_name"] = None
        if is_reject_class:
            key = raw_label                # Background / Not_Maize_Or_Wheat
        else:
            key = "LowConfidence"          # confident-enough class, but below threshold
        result["reject_message"] = REJECT_MESSAGES[key]["en"]
        result["reject_message_ne"] = REJECT_MESSAGES[key]["ne"]
    else:
        result["disease_name"] = raw_label.replace("_", " ")

    return result