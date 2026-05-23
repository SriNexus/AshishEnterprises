/**
 * CmsImage — drop-in <img> replacement for CMS-sourced images.
 *
 * - Shows skeleton while loading
 * - Shows fallback icon on error
 * - Lazy-loads by default
 * - Gracefully handles empty/null src
 */
import { useState, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CmsImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallbackIcon?: boolean;
  skeletonClassName?: string;
}

export function CmsImage({
  src,
  alt = '',
  className,
  fallbackIcon = true,
  skeletonClassName,
  ...props
}: CmsImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    src ? 'loading' : 'error'
  );

  if (!src) {
    return fallbackIcon ? (
      <div className={cn('flex items-center justify-center bg-surface-secondary text-content-tertiary/30', className)}>
        <ImageOff className="h-1/4 w-1/4 max-h-12" />
      </div>
    ) : null;
  }

  return (
    <span className={cn('relative block', className)} style={{ display: 'block' }}>
      {status === 'loading' && (
        <span
          className={cn('absolute inset-0 bg-surface-secondary animate-pulse rounded-[inherit]', skeletonClassName)}
          aria-hidden
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          className,
          'transition-opacity duration-300',
          status === 'loaded' ? 'opacity-100' : 'opacity-0',
          status === 'error' && 'hidden',
        )}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        {...props}
      />
      {status === 'error' && fallbackIcon && (
        <span className={cn('absolute inset-0 flex items-center justify-center bg-surface-secondary text-content-tertiary/30', className)}>
          <ImageOff className="h-1/4 w-1/4 max-h-12" />
        </span>
      )}
    </span>
  );
}
