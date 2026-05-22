import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
}

/**
 * SEO component that updates document head meta tags
 * For a production app, consider using react-helmet-async
 */
export function SEOHead({
  title = 'Ashish Enterprises | UPNEDA Authorized Solar EPC — Varanasi',
  description = 'Premium solar installations and electrical solutions for homes and businesses. Save up to 70% on electricity bills with our cutting-edge technology.',
  keywords = ['solar panels', 'solar energy', 'electrical services', 'renewable energy', 'solar installation'],
  image = '/og-image.jpg',
  url,
  type = 'website',
  publishedTime,
  author,
}: SEOHeadProps) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Helper to set meta tag
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta
    setMeta('description', description);
    setMeta('keywords', keywords.join(', '));

    // Open Graph
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', type, true);
    if (url) setMeta('og:url', url, true);
    if (image) setMeta('og:image', image, true);

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (image) setMeta('twitter:image', image);

    // Article specific
    if (type === 'article') {
      if (publishedTime) setMeta('article:published_time', publishedTime, true);
      if (author) setMeta('article:author', author, true);
    }

    // Cleanup not needed since we're just updating existing meta tags
  }, [title, description, keywords, image, url, type, publishedTime, author]);

  return null;
}
