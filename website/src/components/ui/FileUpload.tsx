'use client';

import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  file?: File | null;
  onFileSelect: (file: File) => void;
  uploading?: boolean;
}

export default function FileUpload({ label, accept = '.pdf,.jpg,.png,.jpeg', file, onFileSelect, uploading }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-6 hover:border-[#0D9373]/40 transition-colors">
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center">
          <UploadCloud className="w-6 h-6 text-[#0D9373]" />
        </div>
        <p className="text-sm font-semibold text-[#0F1117]">{label}</p>
        {file ? (
          <p className="text-xs text-[#0D9373] font-medium">{file.name}</p>
        ) : (
          <p className="text-xs text-[#6B7280]">PDF, JPG, PNG (max 5MB)</p>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-full text-xs font-bold bg-[#0D9373] text-white hover:bg-[#0A7A61] transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : file ? 'Change File' : 'Choose File'}
        </button>
      </div>
    </div>
  );
}
