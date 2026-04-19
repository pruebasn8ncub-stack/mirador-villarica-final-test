'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { PhotoPlaceholder } from './PhotoPlaceholder';

interface AttachmentVideoProps {
  url: string;
  thumb?: string;
  title?: string;
  duration?: string;
}

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname === 'youtu.be') {
      const id =
        u.hostname === 'youtu.be'
          ? u.pathname.slice(1)
          : u.searchParams.get('v') ?? u.pathname.split('/').pop();
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').pop();
      if (id) return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  } catch {
    return url;
  }
}

export function AttachmentVideo({ url, thumb, title, duration }: AttachmentVideoProps) {
  const [playing, setPlaying] = useState(false);
  const embed = toEmbedUrl(url);

  if (playing) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl border border-bosque-100 bg-black">
        <iframe
          src={embed}
          title={title ?? 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block h-[148px] w-full overflow-hidden rounded-xl border border-bosque-100"
      aria-label={`Reproducir ${title ?? 'video'}`}
    >
      <PhotoPlaceholder tone="sunset" url={thumb} label={title ?? 'VIDEO · DRONE AÉREO'} />
      <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-110">
          <Play className="h-5 w-5 translate-x-0.5 fill-bosque-900 text-bosque-900" />
        </span>
      </span>
      {duration && (
        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">
          {duration}
        </span>
      )}
    </button>
  );
}
