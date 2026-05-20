import { createDocument } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import type { ContactFormValues } from '@/types';
import type { LeadDoc } from '@/types/admin';

/**
 * Submit contact form data to Firestore
 */
export async function submitContactForm(
  data: ContactFormValues,
  source: string = 'contact_page'
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const leadData: Partial<LeadDoc> = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: data.service || undefined,
      message: data.message || undefined,
      source: source,
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : undefined,
      status: 'new',
      isPublished: true,
    };

    const id = await createDocument(COLLECTIONS.LEADS, leadData);

    return { success: true, id };
  } catch (error) {
    console.error('Failed to submit contact form:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit form' 
    };
  }
}

/**
 * Submit quick inquiry (WhatsApp redirect with tracking)
 */
export async function trackQuickInquiry(
  name: string,
  phone: string,
  service?: string
): Promise<void> {
  try {
    await createDocument(COLLECTIONS.LEADS, {
      name,
      phone,
      email: '',
      service: service || 'Quick Inquiry',
      source: 'whatsapp_inquiry',
      status: 'new',
      isPublished: true,
    });
  } catch (error) {
    console.error('Failed to track inquiry:', error);
  }
}
