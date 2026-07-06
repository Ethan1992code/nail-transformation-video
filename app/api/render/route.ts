import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir, rm } from 'fs/promises';
import { join, dirname } from 'path';
import { randomUUID } from 'crypto';
import { put } from '@vercel/blob';

export const maxDuration = 300;

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

async function saveFile(file: File, directory: string): Promise<string> {
  const buffer = await file.arrayBuffer();
  const extension = file.name.split('.').pop() || 'jpg';
  const filename = `${randomUUID()}.${extension}`;
  const filePath = join(directory, filename);
  await writeFile(filePath, Buffer.from(buffer));
  return filePath;
}

function getFileUrl(filePath: string, hostname: string, port: string | number): string {
  const relativePath = filePath.replace(/\\/g, '/').replace(/.*public\\?/, '');
  return `http://${hostname}:${port}/${relativePath}`;
}

export async function POST(request: NextRequest) {
  try {
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

    const renderMode = process.env.VIDEO_RENDER_MODE || 'local';
    const uploadDir = join(process.cwd(), 'public', 'uploads', randomUUID());
    await mkdir(uploadDir, { recursive: true });

    try {
      const beforePath = await saveFile(beforeImage, uploadDir);
      const afterPath = await saveFile(afterImage, uploadDir);
      let logoPath: string | undefined;
      if (logoImage) {
        const logoError = validateFile(logoImage);
        if (logoError) {
          return NextResponse.json(
            { success: false, error: `Logo: ${logoError}`, code: 'invalid_logo' },
            { status: 400 }
          );
        }
        logoPath = await saveFile(logoImage, uploadDir);
      }

      const hostname = process.env.HOSTNAME || 'localhost';
      const port = process.env.PORT || 3000;

      const variables = {
        beforeImageUrl: getFileUrl(beforePath, hostname, port),
        afterImageUrl: getFileUrl(afterPath, hostname, port),
        logoUrl: logoPath ? getFileUrl(logoPath, hostname, port) : undefined,
        shopName,
        instagramHandle: instagramHandle || undefined,
      };

      const variablesPath = join(uploadDir, 'variables.json');
      await writeFile(variablesPath, JSON.stringify(variables, null, 2));

      const compositionDir = join(process.cwd(), 'nail-transformation');
      const outputDir = join(compositionDir, 'renders');
      await mkdir(outputDir, { recursive: true });

      const { exec } = await import('child_process');
      const util = await import('util');
      const execPromise = util.promisify(exec);

      const renderCommand = `npx hyperframes render --variables-file "${variablesPath}" --low-memory-mode`;

      const { stdout, stderr } = await execPromise(renderCommand, {
        cwd: compositionDir,
        timeout: 300000,
      });

      console.log('HyperFrames stdout:', stdout);
      console.log('HyperFrames stderr:', stderr);

      const renderMatch = stdout.match(/◇\s*[\r\n]*\s*(.*\.mp4)/);
      if (!renderMatch) {
        throw new Error('Failed to find rendered video file. Output: ' + stdout.substring(0, 500));
      }

      const videoPath = renderMatch[1].trim();
      const videoBuffer = await readFile(videoPath);

      let videoUrl: string;

      if (renderMode === 'vercel' && process.env.BLOB_READ_WRITE_TOKEN) {
        const blobResult = await put(`nail-transformation-${randomUUID()}.mp4`, videoBuffer, {
          access: 'public',
        });
        videoUrl = blobResult.url;
      } else {
        const videoFileName = `render-${randomUUID()}.mp4`;
        const videoPublicPath = join(process.cwd(), 'public', 'renders', videoFileName);
        await mkdir(dirname(videoPublicPath), { recursive: true });
        await writeFile(videoPublicPath, videoBuffer);
        videoUrl = `/renders/${videoFileName}`;
      }

      await rm(uploadDir, { recursive: true, force: true });

      return NextResponse.json({ success: true, videoUrl });
    } finally {
      try {
        await rm(uploadDir, { recursive: true, force: true });
      } catch {
      }
    }
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