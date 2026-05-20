/** Navigation link type */
export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

/** Service card data */
export interface ServiceData {
  id: string;
  title: string;
  description: string;
  icon: string;
  features?: string[];
}

/** Project/portfolio item */
export interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  stats?: Record<string, string>;
}

/** Testimonial */
export interface TestimonialData {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatarUrl?: string;
}

/** FAQ item */
export interface FAQData {
  id: string;
  question: string;
  answer: string;
}

/** Contact form values */
export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

/** Brand/partner logo */
export interface BrandData {
  id: string;
  name: string;
  logoUrl: string;
}

/** Stats counter */
export interface StatData {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

/** Theme type */
export type Theme = 'light' | 'dark';

/** Component with className prop */
export interface WithClassName {
  className?: string;
}
