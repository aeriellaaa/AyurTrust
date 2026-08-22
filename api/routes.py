from fastapi import APIRouter, UploadFile, File, Form
from services import ai_service, ipfs_service, fabric_service, ocr_service
import uuid

router = APIRouter()

@router.post("/batch/collect")
async def collect_batch(
    farmer_id: str = Form(...),
    gps_coordinates: str = Form(...),
    file: UploadFile = File(...)
):
    image_bytes = await file.read()

    ai_result = ai_service.verify_herb_image(image_bytes)
    if ai_result["confidence"] < 0.85:
        return {"error": "Herb verification failed. Please try again."}

    ipfs_hash = ipfs_service.upload_to_ipfs(image_bytes, file.filename)

    batch_id = str(uuid.uuid4())
    fabric_result = fabric_service.commit_batch_to_ledger(batch_id, {"farmer_id": farmer_id, "gps_coordinates": gps_coordinates}, ipfs_hash)

    return {
        "message": "Batch captured & verified",
        "batch_id": batch_id,
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
    return fabric_service.get_batch_from_ledger(batch_id)

@router.get("/batch/{batch_id}/qr")
async def get_batch_qr(batch_id: str):
    return {"batch_id": batch_id, "qr_data": f"https://ayurtrust.app/verify/{batch_id}"}