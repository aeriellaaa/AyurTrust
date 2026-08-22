from pydantic import BaseModel
from typing import Optional

class BatchCreate(BaseModel):
    collectorId: str
    latitude: float
    longitude: float
    accuracy: float
    mocked: bool
    timestamp: str
    gpsTimestamp: str

class LabReport(BaseModel):
    lab_id: str
    metrics: dict