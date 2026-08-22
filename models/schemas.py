from pydantic import BaseModel
from typing import Optional

class BatchCreate(BaseModel):
    farmer_id: str
    herb_type: str
    gps_coordinates: str
    timestamp: str

class LabReport(BaseModel):
    lab_id: str
    metrics: dict