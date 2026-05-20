import { Link } from 'react-router-dom';
import { Sun } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useSite } from '@/store/site-context';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: { icon: 'h-6 w-6', text: 'text-lg', sub: 'text-[9px]', img: 'h-8' },
  md: { icon: 'h-8 w-8', text: 'text-xl', sub: 'text-[10px]', img: 'h-10' },
  lg: { icon: 'h-10 w-10', text: 'text-2xl', sub: 'text-xs', img: 'h-12' },
};

/**
 * Brand logo — dynamically reads logo URL from Firestore settings.
 * Falls back to the Sun icon + text if no logo is uploaded.
 */
export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const s = sizeClasses[size];
  const { settings, config } = useSite();

  const logoUrl = settings?.logoUrl;

  return (
    <Link to="/" className={cn('flex items-center gap-2.5 group', className)}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={config.name}
          className={cn(s.img, 'w-auto object-contain')}
        />
      ) : (
        <>
          <div className="relative">
            <div className="absolute inset-0 bg-brand-primary/20 rounded-xl blur-lg group-hover:bg-brand-primary/30 transition-colors" />
            <div className="relative bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-xl p-2">
              <Sun className={cn(s.icon, 'text-white')} strokeWidth={2.5} />
            </div>
          </div>
          {showText && (
            <div className="flex flex-col">
              <span className={cn(s.text, 'font-bold font-heading text-content-primary leading-tight tracking-tight')}>
                {config.name?.split(' ')[0] || 'Ashish'}{' '}
                <span className="text-brand-primary">{config.name?.split(' ').slice(1).join(' ') || 'Enterprises'}</span>
              </span>
              <span className={cn(s.sub, 'font-medium text-content-tertiary tracking-widest uppercase')}>
                {config.tagline || 'Solar & Electrical'}
              </span>
            </div>
          )}
        </>
      )}
    </Link>
  );
}
