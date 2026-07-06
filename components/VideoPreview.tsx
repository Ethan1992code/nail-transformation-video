'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { NailVideoInput } from '../types/video';

interface VideoPreviewProps {
  input: NailVideoInput;
}

export default function VideoPreview({ input }: VideoPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'composition-ready') {
        setIsLoaded(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !isLoaded) return;

    iframe.contentWindow?.postMessage(
      {
        type: 'update-variables',
        data: input,
      },
      '*'
    );
  }, [input, isLoaded]);

  const handlePlay = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'play' },
      '*'
    );
    setIsPlaying(true);
  };

  const handlePause = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'pause' },
      '*'
    );
    setIsPlaying(false);
  };

  const handleReset = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'reset' },
      '*'
    );
    setIsPlaying(false);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Preview
      </label>
      <div className="relative w-full video-container bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
        <iframe
          ref={iframeRef}
          src="/compositions/nail-transformation/index.html"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          title="Video Preview"
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center text-gray-400">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading preview...</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="text-white hover:text-primary transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={isPlaying ? handlePause : handlePlay}
              className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-white hover:text-primary transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}