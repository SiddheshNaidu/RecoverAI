/**
 * WoundUpload — Optional wound photo upload for check-in
 * PRD 4.5: Camera/upload button with thumbnail preview
 */
import { useState, useRef } from 'react';

export default function WoundUpload({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const ref = useRef();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload?.(file);
  };

  const clear = () => {
    setPreview(null);
    if (ref.current) ref.current.value = '';
    onUpload?.(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-inter text-xs uppercase tracking-widest font-bold text-ink-muted">
        Wound Photo <span className="normal-case text-ink-muted font-normal">(optional)</span>
      </h3>
      {preview ? (
        <div className="relative w-32 h-32 rounded-2xl overflow-hidden group">
          <img src={preview} alt="Wound" className="w-full h-full object-cover" />
          <button
            onClick={clear}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-white text-[28px]">delete</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => ref.current?.click()}
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-dashed border-outline-variant/40 hover:border-primary/40 hover:bg-surface-low transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-full bg-surface-low flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-primary text-[24px]">photo_camera</span>
          </div>
          <div>
            <p className="font-inter font-medium text-ink">Upload wound photo</p>
            <p className="font-inter text-sm text-ink-muted">Gemini will analyze the healing progress</p>
          </div>
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
