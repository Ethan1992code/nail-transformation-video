'use client';

import { useState, useCallback, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import VideoPreview from '../components/VideoPreview';
import type { UploadedFile, NailVideoInput, RenderStatus, MusicOption } from '../types/video';

const MUSIC_OPTIONS: MusicOption[] = [
  { id: 'none', name: 'No Music' },
  { id: 'music1', name: 'Music 1' },
  { id: 'music2', name: 'Music 2' },
  { id: 'music3', name: 'Music 3' },
];

export default function Home() {
  const [beforeImage, setBeforeImage] = useState<UploadedFile>();
  const [afterImage, setAfterImage] = useState<UploadedFile>();
  const [logoImage, setLogoImage] = useState<UploadedFile>();
  const [shopName, setShopName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [selectedMusic, setSelectedMusic] = useState<string>('none');
  const [renderStatus, setRenderStatus] = useState<RenderStatus>('waiting');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hasImages = beforeImage && afterImage;
    if (hasImages) {
      setRenderStatus('ready-to-preview');
    } else {
      setRenderStatus('waiting');
      setVideoUrl('');
      setError('');
    }
  }, [beforeImage, afterImage]);

  const handleReset = useCallback(() => {
    if (beforeImage?.url && beforeImage.url.startsWith('blob:')) {
      URL.revokeObjectURL(beforeImage.url);
    }
    if (afterImage?.url && afterImage.url.startsWith('blob:')) {
      URL.revokeObjectURL(afterImage.url);
    }
    if (logoImage?.url && logoImage.url.startsWith('blob:')) {
      URL.revokeObjectURL(logoImage.url);
    }
    setBeforeImage(undefined);
    setAfterImage(undefined);
    setLogoImage(undefined);
    setShopName('');
    setInstagramHandle('');
    setSelectedMusic('none');
    setVideoUrl('');
    setError('');
    setRenderStatus('waiting');
  }, [beforeImage, afterImage, logoImage]);

  const getVideoInput = useCallback((): NailVideoInput => {
    return {
      beforeImageUrl: beforeImage?.url || '',
      afterImageUrl: afterImage?.url || '',
      logoUrl: logoImage?.url || undefined,
      shopName: shopName || 'Nail Studio',
      instagramHandle: instagramHandle || undefined,
      musicUrl: undefined,
    };
  }, [beforeImage, afterImage, logoImage, shopName, instagramHandle]);

  const handleGenerate = useCallback(async () => {
    if (!beforeImage || !afterImage) return;

    setRenderStatus('uploading');
    setError('');

    const formData = new FormData();
    formData.append('beforeImage', beforeImage.file);
    formData.append('afterImage', afterImage.file);
    if (logoImage) {
      formData.append('logoImage', logoImage.file);
    }
    formData.append('shopName', shopName || 'Nail Studio');
    formData.append('instagramHandle', instagramHandle);
    formData.append('music', selectedMusic);

    try {
      setRenderStatus('rendering');
      const response = await fetch('/api/render', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setVideoUrl(result.videoUrl);
        setRenderStatus('completed');
      } else {
        setError(result.error || 'Failed to generate video');
        setRenderStatus('failed');
      }
    } catch (err) {
      setError('An error occurred during video generation');
      setRenderStatus('failed');
    }
  }, [beforeImage, afterImage, logoImage, shopName, instagramHandle, selectedMusic]);

  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `nail-transformation-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [videoUrl]);

  const handleShare = useCallback(async () => {
    if (!videoUrl) return;

    if (navigator.share) {
      try {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'nail-transformation.mp4', { type: 'video/mp4' });

        await navigator.share({
          title: 'Nail Transformation Video',
          text: 'Check out this amazing nail transformation!',
          files: [file],
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      await navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [videoUrl]);

  const handleCopyLink = useCallback(async () => {
    if (!videoUrl) return;
    await navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [videoUrl]);

  const canPreview = renderStatus === 'ready-to-preview' || renderStatus === 'ready-to-generate';
  const canGenerate = beforeImage && afterImage && renderStatus !== 'rendering';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-md mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Nail Transformation
          </h1>
          <p className="text-sm text-gray-500">
            Upload before and after photos to create a shareable nail transformation video.
          </p>
        </header>

        <main className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <ImageUploader
              label="Before"
              subtitle="Before nail treatment"
              value={beforeImage}
              onChange={setBeforeImage}
              capture="environment"
              required
            />
            <ImageUploader
              label="After"
              subtitle="After nail treatment"
              value={afterImage}
              onChange={setAfterImage}
              capture="environment"
              required
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Shop Information
            </label>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Shop Name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
              <input
                type="text"
                placeholder="Instagram Handle"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Logo (Optional)
              </label>
              <div
                className={`relative w-full h-32 rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer ${
                  logoImage
                    ? 'border-primary bg-white'
                    : 'border-gray-200 bg-gray-50 hover:border-primary'
                }`}
                onClick={() => !logoImage && document.getElementById('upload-logo')?.click()}
              >
                {logoImage ? (
                  <>
                    <img
                      src={logoImage.url}
                      alt="Logo"
                      className="w-full h-full object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        URL.revokeObjectURL(logoImage.url);
                        setLogoImage(undefined);
                      }}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                    <span className="text-xs">Upload Logo</span>
                  </div>
                )}
              </div>
              <input
                id="upload-logo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = URL.createObjectURL(file);
                  setLogoImage({ file, url, name: file.name, size: file.size });
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Background Music
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MUSIC_OPTIONS.map((music) => (
                <button
                  key={music.id}
                  type="button"
                  onClick={() => setSelectedMusic(music.id)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedMusic === music.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {music.name}
                </button>
              ))}
            </div>
          </div>

          {canPreview && (
            <VideoPreview input={getVideoInput()} />
          )}

          {renderStatus === 'rendering' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Generating Video...</p>
              <p className="text-xs text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}

          {renderStatus === 'completed' && videoUrl && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Generated Video
              </label>
              <div className="relative w-full video-container bg-gray-900 rounded-xl overflow-hidden mb-4">
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  playsInline
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share
                </button>
              </div>
              <button
                onClick={handleCopyLink}
                className="w-full mt-3 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {copied ? 'Link copied!' : 'Copy Video Link'}
              </button>
            </div>
          )}

          {renderStatus === 'failed' && (
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">Error</span>
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                canGenerate
                  ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {renderStatus === 'rendering' ? 'Generating...' : 'Generate Video'}
            </button>
          </div>
        </main>

        <footer className="mt-8 text-center text-xs text-gray-400">
          <p>Perfect for Instagram Reels, TikTok & Snapchat</p>
        </footer>
      </div>
    </div>
  );
}