import { NextRequest, NextResponse } from 'next/server';
import { createCreatomateRender, pollCreatomateRender, buildNailVideoPayload } from '../../../lib/creatomate';

export const maxDuration = 120;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Unsupported file type. Only JPEG, PNG, and WebP are allowed.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size exceeds 10MB limit.';
  }
  return null;
}

async function fileToBase64Url(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
}

export async function POST(request: NextRequest) {
  try {
    const renderMode = process.env.VIDEO_RENDER_MODE || 'local';
    const creatomateApiKey = process.env.CREATOMATE_API_KEY;

    if (renderMode === 'creatomate' && !creatomateApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Creatomate API key not configured. Set CREATOMATE_API_KEY environment variable.',
          code: 'missing_api_key',
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const beforeImage = formData.get('beforeImage') as File;
    const afterImage = formData.get('afterImage') as File;
    const logoImage = formData.get('logoImage') as File | null;
    const shopName = formData.get('shopName') as string || 'Nail Studio';
    const instagramHandle = formData.get('instagramHandle') as string || '';

    if (!beforeImage || !afterImage) {
      return NextResponse.json(
        { success: false, error: 'Before and After images are required', code: 'missing_images' },
        { status: 400 }
      );
    }

    const beforeError = validateFile(beforeImage);
    if (beforeError) {
      return NextResponse.json(
        { success: false, error: `Before image: ${beforeError}`, code: 'invalid_before' },
        { status: 400 }
      );
    }

    const afterError = validateFile(afterImage);
    if (afterError) {
      return NextResponse.json(
        { success: false, error: `After image: ${afterError}`, code: 'invalid_after' },
        { status: 400 }
      );
    }

    if (renderMode === 'creatomate') {
      try {
        const beforeImageUrl = await fileToBase64Url(beforeImage);
        const afterImageUrl = await fileToBase64Url(afterImage);
        let logoUrl: string | undefined;
        if (logoImage) {
          const logoError = validateFile(logoImage);
          if (logoError) {
            return NextResponse.json(
              { success: false, error: `Logo: ${logoError}`, code: 'invalid_logo' },
              { status: 400 }
            );
          }
          logoUrl = await fileToBase64Url(logoImage);
        }

        const payload = buildNailVideoPayload(
          beforeImageUrl,
          afterImageUrl,
          logoUrl,
          shopName,
          instagramHandle
        );

        const render = await createCreatomateRender(creatomateApiKey!, payload);

        if (!render.id) {
          throw new Error('Failed to create render job');
        }

        const completedRender = await pollCreatomateRender(creatomateApiKey!, render.id);

        if (!completedRender.url) {
          throw new Error('Render completed but no video URL returned');
        }

        return NextResponse.json({
          success: true,
          videoUrl: completedRender.url,
        });
      } catch (error) {
        console.error('Creatomate render error:', error);
        return NextResponse.json(
          {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to render video',
            code: 'render_failed',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Local rendering is not supported in production. Set VIDEO_RENDER_MODE=creatomate.',
        code: 'unsupported_mode',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Render error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate video. Please try again.',
        code: 'render_failed',
      },
      { status: 500 }
    );
  }
}