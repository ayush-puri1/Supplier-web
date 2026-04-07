'use client';

import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
  color?: string;
}

export default function ToggleSwitch({ enabled, onChange, color = 'bg-[#0D9373]' }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${enabled ? color : 'bg-zinc-300'}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${enabled ? 'left-7' : 'left-1'}`}
      />
    </button>
  );
}
