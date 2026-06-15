'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';

interface ImageUploadProps {
  label: string;
  sublabel?: string;
  onCapture: (base64: string, mimeType: string) => void;
  preview?: string;
  id: string;
}

export default function ImageUpload({ label, sublabel, onCapture, preview, id }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // data:image/jpeg;base64,... 에서 base64 부분만 추출
      const base64 = result.split(',')[1];
      onCapture(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) processFile(file);
  };

  return (
    <div className="space-y-3">
      <div
        id={id}
        role="button"
        tabIndex={0}
        aria-label={label}
        className={`upload-zone min-h-[180px] tablet:min-h-[220px] p-6 ${
          dragging ? 'dragging' : ''
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="relative w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/jpeg;base64,${preview}`} alt="업로드 이미지" className="max-h-48 mx-auto rounded-xl object-contain" />
            <div className="absolute inset-0 bg-surface/60 opacity-0 hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center">
              <span className="text-brand-300 font-medium">미리보기 다시 적사</span>
            </div>
          </div>
        ) : (
          <>
            {/* 아이콘 */}
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-white/70 text-lg font-medium mb-1">{label}</p>
            {sublabel && <p className="text-white/40 text-sm text-center">{sublabel}</p>}
            <p className="text-brand-400/60 text-xs mt-3">클릭하라 업로드하거나 사진을 드래그하세요</p>
          </>
        )}
      </div>

      {/* 업로드 / 카메라 버튼 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-3 rounded-xl bg-surface-elevated border border-surface-border text-white/70 text-sm font-medium hover:border-brand-500 hover:text-white transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          사진 업로드
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 py-3 rounded-xl bg-brand-600/20 border border-brand-500/40 text-brand-300 text-sm font-medium hover:bg-brand-600/30 hover:border-brand-400 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          카메라 촬영
        </button>
      </div>

      {/* 숨김 인풀들 */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} aria-hidden="true" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} aria-hidden="true" />
    </div>
  );
}
