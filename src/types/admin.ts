import { Timestamp } from 'firebase/firestore';

/** Base document interface with common fields */
export interface BaseDocument {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
  isPublished?: boolean;
  order?: number;
}

/** Product document */
export interface ProductDoc extends BaseDocument {
  name: string;
  category: string;
  brand?: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  featured: boolean;
}

/** Service document */
export interface ServiceDoc extends BaseDocument {
  slug: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  benefits: string[];
  process: string[];
  specs: Record<string, string>;
  image?: string;
}

/** Project document */
export interface ProjectDoc extends BaseDocument {
  title: string;
  slug: string;
  description: string;
  category: string;
  location?: string;
  completedDate?: Timestamp;
  images: string[];
  stats: Record<string, string>;
  client?: string;
  featured: boolean;
}

/** Gallery item document */
export interface GalleryDoc extends BaseDocument {
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  thumbnailUrl?: string;
}

/** Blog post document */
export interface BlogPostDoc extends BaseDocument {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  featuredImage?: string;
  tags: string[];
  readTime?: string;
  publishedAt?: Timestamp;
  seoTitle?: string;
  seoDescription?: string;
}

/** Blog category document */
export interface BlogCategoryDoc extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
}

/** Testimonial document */
export interface TestimonialDoc extends BaseDocument {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatarUrl?: string;
  featured: boolean;
}

/** FAQ document */
export interface FAQDoc extends BaseDocument {
  question: string;
  answer: string;
  category?: string;
}

/** Lead/Inquiry document */
export interface LeadDoc extends BaseDocument {
  name: string;
  email: string;
  phone: string;
  city?: string;
  service?: string;
  message?: string;
  source: string;
  sourcePage?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  notes?: string;
  assignedTo?: string;
}

/** Settings document */
export interface SettingsDoc {
  id: string;
  siteName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  businessHours: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  logoLightUrl?: string;
  faviconUrl?: string;
}

/** SEO Settings document */
export interface SEOSettingsDoc {
  id: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  ogImage?: string;
  twitterHandle?: string;
  googleVerification?: string;
  bingVerification?: string;
}

/** Admin user document */
export interface AdminUserDoc {
  id: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin' | 'editor';
  avatarUrl?: string;
  lastLogin?: Timestamp;
  createdAt: Timestamp;
}

/** Hero settings document */
export interface HeroSettingsDoc {
  id: string;
  heading: string;
  headingAccent: string;
  subheading: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  backgroundImage?: string;
  badges: string[];
  trustChips: { icon: string; text: string }[];
}

/** Team member document */
export interface TeamDoc extends BaseDocument {
  name: string;
  role: string;
  designation: string;
  bio: string;
  image?: string;
  experience?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  featured: boolean;
}

/** Dashboard stats */
export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  totalProjects: number;
  totalProducts: number;
  totalBlogPosts: number;
  totalTestimonials: number;
}
