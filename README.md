# Nail Transformation Video Generator

A mobile-first web application for nail salons to create professional before/after transformation videos for social media platforms like Instagram Reels, TikTok, and Snapchat.

## Features

- Upload or capture before and after photos
- Customize shop name, Instagram handle, and logo
- Preview video before generating
- Generate high-quality 9:16 MP4 videos
- Download and share videos

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- HyperFrames (video rendering)
- GSAP (animations)
- Vercel Blob (storage)

## Environment Requirements

- Node.js >= 20.x
- FFmpeg (for video rendering)
- HyperFrames CLI (globally installed)

## Installation

```bash
# Install dependencies
npm install

# Install HyperFrames CLI globally (if not already installed)
npm install -g @hyperframes/cli
```

## Local Development

```bash
# Start development server
npm run dev
```

The application will be available at http://localhost:3000

## HyperFrames Commands

```bash
# Lint composition
npx hyperframes lint

# Preview composition
npx hyperframes preview

# Render composition (with test variables)
npx hyperframes render --variables-file test-variables.json
```

## Video Composition

The video template is located at:
- `nail-transformation/index.html` - Main composition for HyperFrames rendering
- `public/compositions/nail-transformation/index.html` - Preview composition for browser

### Video Specifications

- Format: MP4
- Aspect Ratio: 9:16
- Resolution: 1080 × 1920
- Frame Rate: 30 FPS
- Duration: 8 seconds
- Codec: H.264
- Audio: AAC

### Timeline

| Time | Segment | Description |
|------|---------|-------------|
| 0-1s | Intro | "Nail Transformation" title animation |
| 1-3s | Before | Before photo with label and slow zoom |
| 3-4s | Transition | Flash white transition effect |
| 4-7s | After | After photo with label, glow, and shimmer |
| 7-8s | Outro | Shop logo, name, and Instagram handle |

## API

### POST /api/render

Generate a video from uploaded images.

**Request:**
```multipart/form-data
beforeImage: File (required)
afterImage: File (required)
logoImage: File (optional)
shopName: String
instagramHandle: String
music: String
```

**Response:**
```json
{
  "success": true,
  "videoUrl": "/renders/xxx.mp4"
}
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Vercel Blob Storage (for production)
BLOB_READ_WRITE_TOKEN=your_blob_token

# Video Render Mode: 'local' or 'vercel'
VIDEO_RENDER_MODE=local
```

## Vercel Deployment

1. Push your code to GitHub/GitLab
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
app/
  page.tsx              # Main page component
  api/
    render/
      route.ts          # Video rendering API
  globals.css           # Global styles

components/
  ImageUploader.tsx     # Image upload component
  VideoPreview.tsx      # Video preview component

types/
  video.ts              # TypeScript types

nail-transformation/    # HyperFrames composition
  index.html            # Render composition
  test-variables.json   # Test variables

public/
  compositions/
    nail-transformation/
      index.html        # Preview composition
  renders/              # Generated videos

.env.example           # Environment variables template
```

## Completed Features

- ✅ Before/After photo upload with camera capture
- ✅ Shop information input (name, Instagram, logo)
- ✅ Video preview in browser
- ✅ 8-second 9:16 video generation
- ✅ Intro title animation
- ✅ Before/After labels
- ✅ Flash transition effect
- ✅ After glow and shimmer effects
- ✅ Brand outro with logo
- ✅ Video download
- ✅ Share functionality (Web Share API / copy link)
- ✅ Error handling
- ✅ TypeScript support

## Not Implemented

- ❌ User authentication
- ❌ Database storage
- ❌ Video history
- ❌ Multiple templates
- ❌ AI image processing
- ❌ Background music
- ❌ Direct social media publishing
- ❌ Vercel Sandbox rendering (requires Docker)

## License

MIT