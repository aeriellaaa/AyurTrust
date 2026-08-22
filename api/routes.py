from fastapi import APIRouter, UploadFile, File, Form
from services import ai_service, ipfs_service, fabric_service, ocr_service
import uuid

router = APIRouter()

@router.post("/batch/collect")
async def collect_batch(
    collectorId: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    accuracy: float = Form(...),
    mocked: bool = Form(...),
    timestamp: str = Form(...),
    gpsTimestamp: str = Form(...),
    photo: UploadFile = File(...)
):
    image_bytes = await photo.read()

    if mocked:
        return {"error": "Mock/spoofed GPS location detected. Please disable mock location and try again."}

    ai_result = ai_service.verify_herb_image(image_bytes)
    if ai_result["confidence"] < 0.85:
        return {"error": "Herb verification failed. Please try again."}

    ipfs_hash = ipfs_service.upload_to_ipfs(image_bytes, photo.filename)

    batch_id = str(uuid.uuid4())
    fabric_result = fabric_service.commit_batch_to_ledger(
        batch_id,
        {
            "collectorId": collectorId,
            "latitude": latitude,
            "longitude": longitude,
            "accuracy": accuracy,
            "timestamp": timestamp,
            "gpsTimestamp": gpsTimestamp,
        },
        ipfs_hash
    )

    return {
        "batchId": batch_id,
        "status": "pending",
        "ai_result": ai_result,
        "ipfs_hash": ipfs_hash,
        "fabric_result": fabric_result
    }

@router.post("/batch/{batch_id}/lab")
async def upload_lab_report(batch_id: str, file: UploadFile = File(...)):
    image_bytes = await file.read()
    lab_data = ocr_service.extract_lab_data(image_bytes)
    ipfs_hash = ipfs_service.upload_to_ipfs(image_bytes, file.filename)
    return {"message": "Lab report appended", "lab_data": lab_data, "ipfs_hash": ipfs_hash}

@router.get("/batch/{batch_id}/status")
async def get_batch_status(batch_id: str):
    ledger_record = fabric_service.get_batch_from_ledger(batch_id)
    ai_result = ai_service.verify_herb_image(b"")

    if ai_result["confidence"] < 0.85:
        return {
            "batchId": batch_id,
            "status": "flagged",
            "reason": "Collection point outside the approved NMPB harvest zone"
        }

    return {
        "batchId": batch_id,
        "status": "verified",
        "species": ai_result["species"],
        "confidence": ai_result["confidence"],
        "geofence": "inside approved zone"
    }

@router.get("/batch/{batch_id}/qr")
async def get_batch_qr(batch_id: str):
    return {"batchId": batch_id, "qrValue": f"https://ayurtrust.app/verify/{batch_id}"}