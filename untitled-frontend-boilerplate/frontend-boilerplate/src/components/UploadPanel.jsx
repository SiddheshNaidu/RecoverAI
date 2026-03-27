/**
 * components/UploadPanel.jsx — Team UNTITLED | Build-it ON
 * Generic input panel: Text | Audio | File tabs.
 * Controlled by PS_CONFIG flags from AppContext.
 *
 * Props:
 *   onSuccess: (item: Item) => void   — called after successful API call
 *   promptType?: string               — overrides PS_CONFIG.PROMPT_TYPE
 *
 * DO NOT TOUCH: api calls, hook wiring, error/loading state.
 * Bishnupriya can restyle the JSX (Tailwind classes only).
 */

import { useState, useRef } from "react";
import { Upload, Mic, Type, Square, Loader2 } from "lucide-react";
import { useProcessText, useProcessAudio, useProcessImage } from "../hooks/useApi";
import { useApp } from "../context/AppContext";
import LoadingState from "./ui/LoadingState";
import ErrorState from "./ui/ErrorState";

export default function UploadPanel({ onSuccess, promptType }) {
  const { PS_CONFIG, addItem } = useApp();
  const resolvedPromptType = promptType || PS_CONFIG.PROMPT_TYPE;

  // Active tab
  const [tab, setTab] = useState("text");

  // Text tab state
  const [text, setText] = useState("");

  // Audio tab state
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // File tab state
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // API hooks
  const textApi = useProcessText();
  const audioApi = useProcessAudio();
  const imageApi = useProcessImage();

  const isLoading = textApi.loading || audioApi.loading || imageApi.loading;
  const activeError = textApi.error || audioApi.error || imageApi.error;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handleTextSubmit() {
    if (!text.trim()) return;
    const item = await textApi.execute(text, resolvedPromptType);
    if (item) { addItem(item); onSuccess?.(item); setText(""); }
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function handleAudioSubmit() {
    if (!audioBlob) return;
    const result = await audioApi.execute(audioBlob, resolvedPromptType);
    if (result) { addItem(result.item); onSuccess?.(result.item); setAudioBlob(null); }
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const MAX = 10 * 1024 * 1024;
    if (f.size > MAX) { alert("File too large. Max 10MB."); return; }
    if (!f.type.startsWith("image/")) { alert("Images only (jpg, png, webp)."); return; }
    setFile(f);
  }

  async function handleFileSubmit() {
    if (!file) return;
    const item = await imageApi.execute(file);
    if (item) { addItem(item); onSuccess?.(item); setFile(null); }
  }

  // ─── Tabs config ───────────────────────────────────────────────────────────

  const tabs = [
    { id: "text", label: "Text", icon: Type, always: true },
    { id: "audio", label: "Audio", icon: Mic, always: false, flag: PS_CONFIG.AUDIO_ENABLED },
    { id: "file", label: "Image", icon: Upload, always: false, flag: PS_CONFIG.FILE_ENABLED },
  ].filter((t) => t.always || t.flag);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
              ${tab === id
                ? "bg-white text-gray-900 border-b-2 border-gray-900"
                : "bg-gray-50 text-gray-500 hover:text-gray-700"
              }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Error */}
        {activeError && (
          <ErrorState
            message={activeError}
            onRetry={() => { textApi.reset(); audioApi.reset(); imageApi.reset(); }}
            className="mb-4"
          />
        )}

        {/* Loading */}
        {isLoading && <LoadingState variant="spinner" label="Processing…" />}

        {/* Text tab */}
        {!isLoading && tab === "text" && (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type content here…"
              rows={5}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={handleTextSubmit}
              disabled={!text.trim()}
              className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              Process Text
            </button>
          </div>
        )}

        {/* Audio tab */}
        {!isLoading && tab === "audio" && (
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center gap-3">
              {!recording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                >
                  <Mic size={28} />
                </button>
              )}
              {recording && (
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white animate-pulse transition-colors"
                >
                  <Square size={24} />
                </button>
              )}
              {audioBlob && !recording && (
                <>
                  <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => setAudioBlob(null)}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleAudioSubmit}
                      className="flex-1 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      Transcribe &amp; Process
                    </button>
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {recording ? "Recording… tap square to stop" : audioBlob ? "" : "Tap mic to start recording"}
            </p>
          </div>
        )}

        {/* File tab */}
        {!isLoading && tab === "file" && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-400 cursor-pointer transition-colors"
            >
              {file ? (
                <span className="text-sm text-gray-700 font-medium">{file.name}</span>
              ) : (
                <>
                  <Upload size={24} />
                  <span className="text-sm">Click to select image (max 10MB)</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={handleFileSubmit}
              disabled={!file}
              className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              Analyse Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
