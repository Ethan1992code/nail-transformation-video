interface CreatomateSource {
  [key: string]: string | number | boolean;
}

interface CreatomateElement {
  type: string;
  track?: number;
  time?: number;
  duration?: number;
  source?: string;
  transformations?: Record<string, string | number>;
  text?: string;
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  fit?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  xAlignment?: string;
  yAlignment?: string;
  backgroundColor?: string;
  borderRadius?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  letterSpacing?: string;
  textCase?: string;
  fadeIn?: number | boolean;
  fadeOut?: number | boolean;
  animations?: Array<{
    type: string;
    duration?: number;
    fade?: boolean;
    easing?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface CreatomateRenderRequest {
  template_id?: string;
  output_format?: string;
  width?: number;
  height?: number;
  frame_rate?: number;
  duration?: number;
  elements?: CreatomateElement[];
  modifications?: Record<string, CreatomateSource>;
  source?: CreatomateSource;
}

interface CreatomateRenderResponse {
  id: string;
  status: string;
  url?: string;
  error?: string;
}

const CREATOMATE_API_URL = 'https://api.creatomate.com/v1';

export async function createCreatomateRender(
  apiKey: string,
  payload: CreatomateRenderRequest
): Promise<CreatomateRenderResponse> {
  const response = await fetch(`${CREATOMATE_API_URL}/renders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Creatomate API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function pollCreatomateRender(
  apiKey: string,
  renderId: string
): Promise<CreatomateRenderResponse> {
  const maxAttempts = 60;
  const interval = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${CREATOMATE_API_URL}/renders/${renderId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check render status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'succeeded') {
      return data;
    }

    if (data.status === 'failed') {
      throw new Error(data.error || 'Render failed');
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error('Render timeout');
}

export function buildNailVideoPayload(
  beforeImageUrl: string,
  afterImageUrl: string,
  logoUrl: string | undefined,
  shopName: string,
  instagramHandle: string | undefined
): CreatomateRenderRequest {
  const elements: CreatomateElement[] = [
    {
      type: 'image',
      track: 1,
      time: 0,
      duration: 1,
      source: beforeImageUrl,
      x: '0%',
      y: '0%',
      width: '100%',
      height: '100%',
      fit: 'cover',
      animations: [
        { type: 'fade', duration: 0.3, fade: true, easing: 'ease-out' },
      ],
    },
    {
      type: 'shape',
      track: 2,
      time: 0,
      duration: 1,
      x: '50%',
      y: '50%',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(26, 26, 46, 1)',
    },
    {
      type: 'text',
      track: 3,
      time: 0.1,
      duration: 0.8,
      text: 'Nail\nTransformation',
      x: '50%',
      y: '45%',
      width: '80%',
      fontFamily: 'Inter',
      fontSize: 80,
      fontWeight: 800,
      color: '#FFFFFF',
      xAlignment: '50%',
      yAlignment: '50%',
      letterSpacing: '4px',
    },
    {
      type: 'text',
      track: 3,
      time: 0.4,
      duration: 0.5,
      text: 'BEFORE & AFTER',
      x: '50%',
      y: '65%',
      width: '80%',
      fontFamily: 'Inter',
      fontSize: 32,
      fontWeight: 300,
      color: 'rgba(255, 255, 255, 0.7)',
      xAlignment: '50%',
      yAlignment: '50%',
      letterSpacing: '2px',
    },
    {
      type: 'image',
      track: 1,
      time: 1,
      duration: 2,
      source: beforeImageUrl,
      x: '0%',
      y: '0%',
      width: '100%',
      height: '100%',
      fit: 'cover',
      animations: [
        { type: 'scale', duration: 2, from: 1.0, to: 1.05, easing: 'linear' },
      ],
    },
    {
      type: 'shape',
      track: 2,
      time: 1,
      duration: 2,
      x: '0%',
      y: '0%',
      width: '100%',
      height: '100%',
      backgroundColor: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.4) 100%)',
    },
    {
      type: 'shape',
      track: 3,
      time: 1,
      duration: 2,
      x: '50%',
      y: '8%',
      width: '35%',
      height: '8%',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '50px',
    },
    {
      type: 'text',
      track: 3,
      time: 1,
      duration: 2,
      text: 'BEFORE',
      x: '50%',
      y: '8%',
      width: '35%',
      fontFamily: 'Inter',
      fontSize: 48,
      fontWeight: 700,
      color: '#333333',
      xAlignment: '50%',
      yAlignment: '50%',
      letterSpacing: '8px',
    },
    {
      type: 'shape',
      track: 4,
      time: 3,
      duration: 1,
      x: '0%',
      y: '0%',
      width: '100%',
      height: '100%',
      backgroundColor: '#FFFFFF',
      animations: [
        { type: 'fade', duration: 0.1, fade: true },
        { type: 'fade', start: 0.1, duration: 0.2, fade: true, reverse: true },
      ],
    },
    {
      type: 'image',
      track: 1,
      time: 3,
      duration: 4,
      source: afterImageUrl,
      x: '0%',
      y: '0%',
      width: '100%',
      height: '100%',
      fit: 'cover',
      animations: [
        { type: 'fade', duration: 0.3, fade: true },
        { type: 'scale', start: 0.3, duration: 2.7, from: 1.0, to: 1.08, easing: 'linear' },
      ],
    },
    {
      type: 'shape',
      track: 2,
      time: 3,
      duration: 4,
      x: '0%',
      y: '0%',
      width: '100%',
      height: '100%',
      backgroundColor: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.4) 100%)',
    },
    {
      type: 'shape',
      track: 3,
      time: 3,
      duration: 4,
      x: '50%',
      y: '8%',
      width: '30%',
      height: '8%',
      backgroundColor: '#ff6b9d',
      borderRadius: '50px',
    },
    {
      type: 'text',
      track: 3,
      time: 3,
      duration: 4,
      text: 'AFTER',
      x: '50%',
      y: '8%',
      width: '30%',
      fontFamily: 'Inter',
      fontSize: 48,
      fontWeight: 700,
      color: '#FFFFFF',
      xAlignment: '50%',
      yAlignment: '50%',
      letterSpacing: '8px',
    },
    {
      type: 'shape',
      track: 4,
      time: 7,
      duration: 1,
      x: '0%',
      y: '0%',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(26, 26, 46, 1)',
      animations: [
        { type: 'fade', duration: 0.4, fade: true },
      ],
    },
    {
      type: 'text',
      track: 4,
      time: 7,
      duration: 1,
      text: shopName,
      x: '50%',
      y: '45%',
      width: '80%',
      fontFamily: 'Inter',
      fontSize: 64,
      fontWeight: 700,
      color: '#FFFFFF',
      xAlignment: '50%',
      yAlignment: '50%',
      animations: [
        { type: 'fade', duration: 0.4, fade: true },
        { type: 'slide', duration: 0.5, from_y: 50, to_y: 0, easing: 'ease-out' },
      ],
    },
    {
      type: 'text',
      track: 4,
      time: 7.2,
      duration: 0.8,
      text: instagramHandle ? `@${instagramHandle}` : '',
      x: '50%',
      y: '58%',
      width: '80%',
      fontFamily: 'Inter',
      fontSize: 36,
      fontWeight: 300,
      color: 'rgba(255, 255, 255, 0.8)',
      xAlignment: '50%',
      yAlignment: '50%',
      animations: [
        { type: 'fade', duration: 0.4, fade: true },
      ],
    },
    {
      type: 'text',
      track: 4,
      time: 7.4,
      duration: 0.6,
      text: 'Share Your New Look',
      x: '50%',
      y: '70%',
      width: '80%',
      fontFamily: 'Inter',
      fontSize: 32,
      fontWeight: 400,
      color: 'rgba(255, 255, 255, 0.6)',
      xAlignment: '50%',
      yAlignment: '50%',
      letterSpacing: '4px',
    },
  ];

  if (logoUrl) {
    elements.push({
      type: 'image',
      track: 3,
      time: 1,
      duration: 2,
      source: logoUrl,
      x: '88%',
      y: '88%',
      width: '8%',
      height: '8%',
      fit: 'contain',
      animations: [
        { type: 'fade', duration: 0.3, fade: true },
      ],
    } as CreatomateElement);

    elements.push({
      type: 'image',
      track: 3,
      time: 3,
      duration: 4,
      source: logoUrl,
      x: '88%',
      y: '88%',
      width: '8%',
      height: '8%',
      fit: 'contain',
    } as CreatomateElement);

    elements.push({
      type: 'image',
      track: 4,
      time: 7,
      duration: 1,
      source: logoUrl,
      x: '50%',
      y: '30%',
      width: '30%',
      height: '15%',
      fit: 'contain',
      animations: [
        { type: 'fade', duration: 0.4, fade: true },
      ],
    } as CreatomateElement);
  }

  return {
    output_format: 'mp4',
    width: 1080,
    height: 1920,
    frame_rate: 30,
    duration: 8,
    elements,
  };
}
