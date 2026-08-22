import axios from "axios";

// ---------------------------------------------------------------
// 1. WHERE THE BACKEND LIVES
// Your phone is a separate device from your laptop, so "localhost"
// would mean the phone itself. Use the laptop's Wi-Fi (LAN) address.
// Windows: run  ipconfig  and copy the IPv4 Address.
// ---------------------------------------------------------------
export const API_BASE_URL = "http://192.168.1.42:8000";

// ---------------------------------------------------------------
// 2. THE ONE SWITCH THAT CONTROLS EVERYTHING
// true  = fake but realistic responses, no backend needed at all
// false = real calls to Member 1's FastAPI server
// ---------------------------------------------------------------
export const MOCK_MODE = true;

// Set to "flagged" to rehearse the rejection path in your demo.
export const MOCK_OUTCOME = "verified"; // "verified" | "flagged"

const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

function mockDelay(value, ms = 700) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Counts how many times each batch has been polled, so the mock can
// move pending -> pending -> verified instead of finishing instantly.
const mockPolls = {};

// -------- Screen 1 (Capture Herb) calls this on submit --------
export async function submitBatch(payload) {
  if (MOCK_MODE) {
    const fakeId = "BATCH-" + String(Date.now()).slice(-6);
    mockPolls[fakeId] = 0;
    return mockDelay({ batchId: fakeId, status: "pending" });
  }
  const form = new FormData();
  form.append("collectorId", payload.collectorId);
  form.append("latitude", String(payload.latitude));
  form.append("longitude", String(payload.longitude));
  form.append("accuracy", String(payload.accuracy));
  form.append("mocked", String(payload.mocked));
  form.append("timestamp", payload.timestamp);
  form.append("gpsTimestamp", payload.gpsTimestamp);
  form.append("photo", {
    uri: payload.photoUri,
    name: "herb.jpg",
    type: "image/jpeg",
  });
  const { data } = await api.post("/batch/collect", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// -------- Screen 2 polls this every 3 seconds --------
export async function getBatchStatus(batchId) {
  if (MOCK_MODE) {
    mockPolls[batchId] = (mockPolls[batchId] || 0) + 1;
    if (mockPolls[batchId] < 3) {
      return mockDelay({ batchId, status: "pending" }, 300);
    }
    if (MOCK_OUTCOME === "flagged") {
      return mockDelay({
        batchId,
        status: "flagged",
        reason: "Collection point outside the approved NMPB harvest zone",
      }, 300);
    }
    return mockDelay({
      batchId,
      status: "verified",
      species: "Withania somnifera (Ashwagandha)",
      confidence: 0.94,
      geofence: "inside approved zone",
    }, 300);
  }
  const { data } = await api.get(`/batch/${batchId}/status`);
  return data;
}

// -------- Screen 3 calls this once, for the QR contents --------
export async function getBatchQr(batchId) {
  if (MOCK_MODE) {
    return mockDelay({ batchId, qrValue: `https://ayurtrust.example/verify/${batchId}` });
  }
  const { data } = await api.get(`/batch/${batchId}/qr`);
  return data;
}