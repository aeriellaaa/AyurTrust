import io
import os
import platform
import re

import cv2
import numpy as np
import pytesseract
from PIL import Image

# Windows only: point pytesseract at the installed Tesseract binary.
# Harmless no-op on Mac/Linux/deployment servers where it's already on PATH.
if platform.system() == "Windows":
    _default_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(_default_path):
        pytesseract.pytesseract.tesseract_cmd = _default_path


def _preprocess(img: np.ndarray) -> np.ndarray:
    """Denoise, threshold, and deskew — improves OCR accuracy on phone-photo lab reports."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.fastNlMeansDenoising(gray, h=10)
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 15
    )

    coords = np.column_stack(np.where(thresh < 255))
    if len(coords) > 0:
        angle = cv2.minAreaRect(coords)[-1]
        angle = -(90 + angle) if angle < -45 else -angle
        if abs(angle) > 0.5:
            (h, w) = thresh.shape
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            thresh = cv2.warpAffine(thresh, M, (w, h), flags=cv2.INTER_CUBIC,
                                     borderMode=cv2.BORDER_REPLICATE)
    return thresh


def _extract_fields(text: str) -> dict:
    """Best-effort structured field extraction. Tune these patterns once real report layouts are seen."""
    fields = {}
    patterns = {
        "batch_id": r"Batch\s*ID[:\-]?\s*([A-Z0-9\-]+)",
        "species": r"Species\s*Tested[:\-]?\s*([A-Za-z\s()]+?)(?:\n|$)",
        "test_date": r"(?<!Received\s)Test\s*Date[:\-]?\s*([\d/\-]+)",
        "lab_name": r"Lab\s*Name[:\-]?\s*([A-Za-z0-9\s&,.]+?)(?:\n|$)",
        "accreditation": r"(NABL[- ]?[\w\-]*)",
    }
    for field, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            fields[field] = match.group(1).strip()
    return fields


def extract_lab_data(image_bytes: bytes) -> dict:
    """
    Takes raw image bytes (from an uploaded lab report file), returns:
        {
            "raw_text": str,
            "extracted_metrics": dict  # batch_id, species, test_date, lab_name, accreditation
        }
    """
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    cv_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    processed = _preprocess(cv_img)
    raw_text = pytesseract.image_to_string(processed, config="--psm 6")

    return {
        "raw_text": raw_text,
        "extracted_metrics": _extract_fields(raw_text),
    }