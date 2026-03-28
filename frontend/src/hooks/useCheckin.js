/**
 * useCheckin.js — State machine for the check-in pipeline.
 * Manages the 6 UI steps: idle → recording → transcribing → reviewing → processing → result
 */

import { useState, useCallback, useRef } from "react";
import { submitCheckin } from "../api/client";
import { useApp } from "../context/AppContext";

/** @typedef {'idle'|'recording'|'transcribing'|'reviewing'|'processing'|'result'} CheckinStep */

/**
 * @typedef {Object} CheckinState
 * @property {CheckinStep}     step
 * @property {string}          transcript
 * @property {Blob|null}       audioBlob
 * @property {File|null}       woundImage
 * @property {Object}          medConfirmations   - { [medName]: boolean }
 * @property {Object|null}     result             - Full CheckinResponse from API
 * @property {string|null}     error
 * @property {boolean}         isProxyMode
 */

const INITIAL_STATE = {
  step:             "idle",
  transcript:       "",
  audioBlob:        null,
  woundImage:       null,
  medConfirmations: {},
  result:           null,
  error:            null,
  isProxyMode:      false,
};

/**
 * useCheckin — orchestrates the voice/text check-in flow.
 * @param {string} patientId
 */
export function useCheckin(patientId) {
  const { preferredLanguage } = useApp();
  const [state, setState] = useState(INITIAL_STATE);

  // MediaRecorder ref for voice recording
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const streamRef        = useRef(null);

  const setStep = (step) => setState((s) => ({ ...s, step }));

  // ── Voice Recording ───────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250); // collect chunks every 250ms
      setState((s) => ({ ...s, step: "recording", error: null }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: "Microphone access denied. Please allow microphone permissions.",
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        // Stop all tracks
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setState((s) => ({ ...s, audioBlob: blob, step: "transcribing" }));
        resolve(blob);
      };

      recorder.stop();
    });
  }, []);

  // ── State Setters ─────────────────────────────────────────

  const setTranscript = useCallback((text) => {
    setState((s) => ({ ...s, transcript: text, step: "reviewing" }));
  }, []);

  const setWoundImage = useCallback((file) => {
    setState((s) => ({ ...s, woundImage: file }));
  }, []);

  const setMedConfirmation = useCallback((medName, confirmed) => {
    setState((s) => ({
      ...s,
      medConfirmations: { ...s.medConfirmations, [medName]: confirmed },
    }));
  }, []);

  const toggleProxyMode = useCallback(() => {
    setState((s) => ({ ...s, isProxyMode: !s.isProxyMode }));
  }, []);

  // ── Submission ────────────────────────────────────────────

  const submitCheckinFlow = useCallback(async () => {
    setState((s) => ({ ...s, step: "processing", error: null }));

    try {
      const formData = new FormData();
      formData.append("patient_id",    patientId);
      formData.append("reporter_type", state.isProxyMode ? "family_proxy" : "self");
      formData.append("language_code", preferredLanguage.sarvam);
      formData.append(
        "medications_confirmed",
        JSON.stringify(state.medConfirmations)
      );

      if (state.audioBlob) {
        formData.append("audio", state.audioBlob, "recording.webm");
      } else if (state.transcript) {
        formData.append("text_input", state.transcript);
      }

      if (state.woundImage) {
        formData.append("wound_image", state.woundImage);
      }

      const result = await submitCheckin(formData);
      setState((s) => ({ ...s, step: "result", result }));
    } catch (err) {
      setState((s) => ({
        ...s,
        step:  "reviewing",
        error: err instanceof Error ? err.message : "Submission failed. Please try again.",
      }));
    }
  }, [patientId, preferredLanguage.sarvam, state.audioBlob, state.transcript, state.woundImage, state.medConfirmations, state.isProxyMode]);

  // ── Reset ─────────────────────────────────────────────────

  const reset = useCallback(() => {
    // Clean up any active recording
    streamRef.current?.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setState(INITIAL_STATE);
  }, []);

  return {
    // State
    step:             state.step,
    transcript:       state.transcript,
    audioBlob:        state.audioBlob,
    woundImage:       state.woundImage,
    medConfirmations: state.medConfirmations,
    result:           state.result,
    error:            state.error,
    isProxyMode:      state.isProxyMode,

    // Actions
    startRecording,
    stopRecording,
    setTranscript,
    setWoundImage,
    setMedConfirmation,
    toggleProxyMode,
    submitCheckin:    submitCheckinFlow,
    reset,
  };
}

export default useCheckin;
