/**
 * Firestore Collection Names
 * Centralized collection references for type safety
 */
export const COLLECTIONS = {
  // Content Collections
  PRODUCTS: 'products',
  SERVICES: 'services',
  PROJECTS: 'projects',
  GALLERY: 'gallery',
  BLOG_POSTS: 'blog_posts',
  BLOG_CATEGORIES: 'blog_categories',
  TESTIMONIALS: 'testimonials',
  FAQ: 'faq',
  TEAM: 'team',
  
  // Page-specific Settings
  HERO_SETTINGS: 'hero_settings',
  
  // Lead Management
  LEADS: 'leads',
  CONTACT_SUBMISSIONS: 'contact_submissions',
  
  // Settings
  SETTINGS: 'settings',
  SEO_SETTINGS: 'seo_settings',
  
  // Users
  ADMIN_USERS: 'admin_users',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
