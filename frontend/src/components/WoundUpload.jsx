/**
 * WoundUpload.jsx — Wound photo capture + thumbnail preview
 * Stitch design: camera icon left, 80×80 thumbnail right, hover-refresh overlay
 * ui-ux-pro-max: accepts image/*, alt text, 44px hover overlay
 */

import { useRef } from "react";

/**
 * @param {{
 *   imageFile: File | null;
 *   woundInsight?: string;
 *   onChange: (file: File) => void;
 * }} props
 */
export default function WoundUpload({ imageFile, woundInsight, onChange }) {
  const inputRef  = useRef(null);
  const previewURL = imageFile ? URL.createObjectURL(imageFile) : null;

  return (
    <section
      className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between gap-4 shadow-card"
      aria-label="Wound photo"
    >
      {/* Left info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2.5">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: 20 }}
            aria-hidden="true"
          >
            photo_camera
          </span>
          <h3 className="font-label font-semibold text-sm text-on-surface">
            Photograph your wound
          </h3>
        </div>

        {woundInsight ? (
          <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
            {woundInsight}
          </span>
        ) : (
          <p className="text-xs text-on-surface-variant">
            Optional but helps your nurse review remotely
          </p>
        )}
      </div>

      {/* Right: thumbnail or upload button */}
      <div className="flex-shrink-0">
        <button
          onClick={() => inputRef.current?.click()}
          aria-label={imageFile ? "Change wound photo" : "Upload wound photo"}
          className="
            relative w-20 h-20 rounded-xl overflow-hidden cursor-pointer
            bg-surface-container flex items-center justify-center group
            border-2 border-dashed border-outline-variant
            hover:border-primary-container transition-colors duration-200
            focus-visible:ring-2 focus-visible:ring-primary
          "
        >
          {previewURL ? (
            <>
              <img
                src={previewURL}
                alt="Wound photo preview"
                className="w-full h-full object-cover"
              />
              {/* Refresh overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ fontSize: 22 }}
                  aria-hidden="true"
                >
                  refresh
                </span>
              </div>
            </>
          ) : (
            <span
              className="material-symbols-outlined text-outline group-hover:text-primary-container transition-colors duration-200"
              style={{ fontSize: 28 }}
              aria-hidden="true"
            >
              add_photo_alternate
            </span>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          aria-hidden="true"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange(f);
          }}
        />
      </div>
    </section>
  );
}
