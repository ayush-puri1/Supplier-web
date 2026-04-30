import React, { useState, useEffect } from 'react';

interface ActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'confirm' | 'prompt';
  danger?: boolean;
  confirmText?: string;
  cancelText?: string;
  promptLabel?: string;
  promptPlaceholder?: string;
  onConfirm: (val?: string) => void;
  onCancel: () => void;
}

export default function ActionModal({
  isOpen,
  title,
  message,
  type = 'confirm',
  danger = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  promptLabel,
  promptPlaceholder,
  onConfirm,
  onCancel
}: ActionModalProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) setInputValue('');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#0f172a', padding: 30, borderRadius: 16, width: 400, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 20, color: 'white', fontFamily: 'var(--font-heading)' }}>{title}</h3>
        <p style={{ margin: '0 0 20px', color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.5 }}>{message}</p>
        
        {type === 'prompt' && (
          <div style={{ marginBottom: 20 }}>
            {promptLabel && <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-body)' }}>{promptLabel}</label>}
            <input
              autoFocus
              type="text"
              placeholder={promptPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', outline: 'none' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            onClick={onCancel}
            style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => onConfirm(type === 'prompt' ? inputValue : undefined)}
            disabled={type === 'prompt' && !inputValue.trim()}
            style={{ padding: '10px 20px', background: danger ? '#ef4444' : '#2563eb', border: 'none', color: 'white', borderRadius: 8, cursor: (type === 'prompt' && !inputValue.trim()) ? 'not-allowed' : 'pointer', opacity: (type === 'prompt' && !inputValue.trim()) ? 0.5 : 1, fontSize: 14, fontWeight: 500 }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
