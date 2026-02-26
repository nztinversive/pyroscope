"use client";
import { useState, useEffect } from "react";

export function useApiKey() {
  const [key, setKeyState] = useState<string>("");

  useEffect(() => {
    setKeyState(localStorage.getItem("pyroscope_api_key") || "");
  }, []);

  const setKey = (k: string) => {
    localStorage.setItem("pyroscope_api_key", k);
    setKeyState(k);
  };

  const clearKey = () => {
    localStorage.removeItem("pyroscope_api_key");
    setKeyState("");
  };

  return { key, setKey, clearKey };
}
