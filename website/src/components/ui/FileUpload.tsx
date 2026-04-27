'use client';

import React, { useRef } from 'react';
import { UploadCloud, Check, File } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  file?: File | string | null;
  onFileSelect: (file: File) => void;
  uploading?: boolean;
}

export default function FileUpload({ label, accept = '.pdf,.jpg,.png,.jpeg', file, onFileSelect, uploading }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  };

  const fileName = typeof file === 'string' ? file.split('/').pop() : file?.name;

  return (
    <div style={{
      borderRadius: 16,
      border: '2px dashed rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.02)',
      padding: '24px',
      transition: 'all 0.3s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
    >
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
      
      <div style={{
        width: 44, height: 44,
        borderRadius: 12,
        background: 'rgba(37,99,235,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--blue-400)',
      }}>
        {file ? <Check size={20} /> : <UploadCloud size={20} />}
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
          {fileName || 'PDF, JPG, PNG (max 10MB)'}
        </p>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          padding: '8px 20px',
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 700,
          background: 'var(--blue-600)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginTop: 4,
          opacity: uploading ? 0.5 : 1,
        }}
        onMouseEnter={e => !uploading && (e.currentTarget.style.background = '#1D4ED8')}
        onMouseLeave={e => !uploading && (e.currentTarget.style.background = 'var(--blue-600)')}
      >
        {uploading ? 'Processing...' : file ? 'Replace File' : 'Choose File'}
      </button>
    </div>
  );
}
