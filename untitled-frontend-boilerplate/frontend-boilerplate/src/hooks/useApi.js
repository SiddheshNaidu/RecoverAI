/**
 * hooks/useApi.js — Team UNTITLED | Build-it ON
 * Custom hooks wrapping api/client.js.
 * Returns { data, loading, error, execute } for every operation.
 *
 * Usage:
 *   const { data, loading, error, execute } = useProcessText();
 *   await execute("my text", "knowledge");
 */

import { useState, useCallback } from "react";
import * as api from "../api/client";

// ─── Generic hook factory ────────────────────────────────────────────────────

function makeApiHook(apiFn) {
  return function useApiHook() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
      setLoading(true);
      setError(null);
      const { data: result, error: err } = await apiFn(...args);
      setLoading(false);
      if (err) {
        setError(err);
        return null;
      }
      setData(result);
      return result;
    }, []);

    const reset = useCallback(() => {
      setData(null);
      setError(null);
      setLoading(false);
    }, []);

    return { data, loading, error, execute, reset };
  };
}

// ─── Exported hooks ──────────────────────────────────────────────────────────

/** execute(text: string, promptType: string) → Item */
export const useProcessText = makeApiHook(api.processText);

/** execute(audioFile: File|Blob, promptType: string) → { transcript, item } */
export const useProcessAudio = makeApiHook(api.processAudio);

/** execute(imageFile: File) → Item */
export const useProcessImage = makeApiHook(api.processImage);

/** execute(prompt: string) → { result: string } */
export const useGenerate = makeApiHook(api.generate);

/** execute() → { items: Item[], count: number } */
export const useListItems = makeApiHook(api.listItems);

/** execute(type, content, metadata) → Item */
export const useCreateItem = makeApiHook(api.createItem);

/** execute(phone: string, message: string) → { success: boolean } */
export const useDeliverWhatsApp = makeApiHook(api.deliverWhatsApp);

/** execute() → { status: "ok" } */
export const useHealthCheck = makeApiHook(api.checkHealth);
