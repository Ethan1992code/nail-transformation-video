'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { UploadedFile } from '../types/video';

interface ImageUploaderProps {
  label: string;
  subtitle?: string;
  value?: UploadedFile;
  onChange: (file: UploadedFile | undefined) => void;
  capture?: 'environment' | 'user';
  required?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageUploader({
  label,
  subtitle,
  value,
  onChange,
  capture = 'environment',
  required = false,
}: ImageUploaderProps) {
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (value?.url && value.url.startsWith('blob:')) {
        URL.revokeObjectURL(value.url);
      }
    };
  }, [value?.url]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError('');

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Please upload a JPEG, PNG, or WebP image');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('File size must be less than 10MB');
        return;
      }

      const url = URL.createObjectURL(file);
      onChange({
        file,
        url,
        name: file.name,
        size: file.size,
      });
    },
    [onChange]
  );

  const handleRemove = useCallback(() => {
    if (value?.url && value.url.startsWith('blob:')) {
      URL.revokeObjectURL(value.url);
    }
    onChange(undefined);
    setError('');
  }, [value?.url, onChange]);

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {subtitle && (
        <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
      )}
      <div
        className={`relative w-full aspect-[9/16] rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer ${
          value
            ? 'border-primary bg-white'
            : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-white'
        }`}
        onClick={() => !value && document.getElementById(`upload-${label.toLowerCase()}`)?.click()}
      >
        {value ? (
          <>
            <img
              src={value.url}
              alt={label}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById(`upload-${label.toLowerCase()}`)?.click();
              }}
              className="absolute top-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-xs hover:bg-black/70 transition-colors"
            >
              Replace
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs mt-1">Tap to upload or capture</p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
      <input
        id={`upload-${label.toLowerCase()}`}
        type="file"
        accept="image/*"
        capture={capture}
        onChange={handleFileChange}
      />
    </div>
  );
}