import os
import requests

FABRIC_API_URL = os.getenv("FABRIC_API_URL", "http://localhost:3000/api/fabric")

def commit_batch_to_ledger(batch_id: str, data: dict, ipfs_hash: str):
    payload = {"batchId": batch_id, "data": data, "ipfsHash": ipfs_hash}
    response = requests.post(f"{FABRIC_API_URL}/invoke", json=payload, timeout=30)
    if response.ok:
        return response.json()
    raise RuntimeError(f"Fabric transaction failed: {response.text}")

def get_batch_from_ledger(batch_id: str):
    response = requests.get(f"{FABRIC_API_URL}/query/{batch_id}", timeout=15)
    if response.ok:
        return response.json()
    raise RuntimeError(f"Fabric query failed: {response.text}")