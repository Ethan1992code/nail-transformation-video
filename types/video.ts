export interface NailVideoInput {
  beforeImageUrl: string;
  afterImageUrl: string;
  logoUrl?: string;
  shopName: string;
  instagramHandle?: string;
  musicUrl?: string;
}

export interface RenderResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
  code?: string;
}

export type RenderStatus = 
  | 'waiting'
  | 'ready-to-preview'
  | 'ready-to-generate'
  | 'uploading'
  | 'rendering'
  | 'completed'
  | 'failed';

export interface UploadedFile {
  file: File;
  url: string;
  name: string;
  size: number;
}

export interface MusicOption {
  id: string;
  name: string;
  url?: string;
}