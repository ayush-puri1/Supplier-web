'use client';

import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
  color?: string;
}

export default function ToggleSwitch({ enabled, onChange, color = 'var(--blue-600)' }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      style={{
        position: 'relative',
        width: 44,
        height: 22,
        borderRadius: 999,
        background: enabled ? color : 'rgba(255,255,255,0.08)',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.3s',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: enabled ? 25 : 3,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
        }}
      />
    </button>
  );
}
