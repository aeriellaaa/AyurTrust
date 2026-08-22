import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [collectorId, setCollectorId] = useState(null);
  const [role, setRole] = useState(null);
  const [batches, setBatches] = useState([]);

  // On app start, restore the previous login and any saved batches.
  useEffect(() => {
    (async () => {
      try {
        const rawSession = await AsyncStorage.getItem("session");
        if (rawSession) {
          const saved = JSON.parse(rawSession);
          setCollectorId(saved.collectorId);
          setRole(saved.role);
        }
        const rawBatches = await AsyncStorage.getItem("batches");
        if (rawBatches) setBatches(JSON.parse(rawBatches));
      } catch (err) {
        // Corrupted storage should never stop the app from opening.
      }
    })();
  }, []);

  async function login(id, selectedRole) {
    setCollectorId(id);
    setRole(selectedRole);
    await AsyncStorage.setItem("session", JSON.stringify({ collectorId: id, role: selectedRole }));
  }

  async function logout() {
    setCollectorId(null);
    setRole(null);
    await AsyncStorage.removeItem("session");
  }

  // Newest batch first, and written to the phone so it survives a restart.
  async function addBatch(batch) {
    const next = [batch, ...batches];
    setBatches(next);
    await AsyncStorage.setItem("batches", JSON.stringify(next));
  }

  return (
    <SessionContext.Provider value={{ collectorId, role, batches, login, logout, addBatch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}