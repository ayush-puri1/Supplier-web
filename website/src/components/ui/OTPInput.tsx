'use client';

import React, { useRef, useState, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
}

export default function OTPInput({ length = 6, value, onChange }: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [values, setValues] = useState<string[]>(Array(length).fill(''));

  useEffect(() => {
    const chars = value.split('');
    setValues(Array(length).fill('').map((_, i) => chars[i] || ''));
  }, [value, length]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputs.current[index]?.focus();
    }
  };

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;

    const newValues = [...values];
    newValues[index] = char.slice(-1);
    setValues(newValues);
    onChange(newValues.join(''));

    if (char && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newValues = Array(length).fill('').map((_, i) => pasted[i] || '');
    setValues(newValues);
    onChange(newValues.join(''));
    focusInput(Math.min(pasted.length, length - 1));
  };

  return (
    <div className="flex gap-3 justify-center">
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-white/10 bg-white/5 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
      ))}
    </div>
  );
}
