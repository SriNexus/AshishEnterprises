import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/error-boundary';
import { LoadingScreen } from '@/components/loading-screen';
import { AdminLayout } from '@/layouts/admin-layout';
import { VisualEditorProvider } from '@/store/visual-editor-context';
import { SiteProvider } from '@/store/site-context';
import { AuthProvider } from '@/store/auth-provider';

// ─── Public pages ──────────────────────────────────────────────
const HomePage        = lazy(() => import('@/pages/home'));
const AboutPage       = lazy(() => import('@/pages/about'));
const ServicesPage    = lazy(() => import('@/pages/services'));
const ServiceDetail   = lazy(() => import('@/pages/service-detail'));
const ProductsPage    = lazy(() => import('@/pages/products'));
const ProjectsPage    = lazy(() => import('@/pages/projects'));
const GalleryPage     = lazy(() => import('@/pages/gallery'));
const BlogPage        = lazy(() => import('@/pages/blog'));
const BlogPostPage    = lazy(() => import('@/pages/blog-post'));
const ContactPage     = lazy(() => import('@/pages/contact'));
const FAQPage         = lazy(() => import('@/pages/faq-page'));
const PrivacyPage     = lazy(() => import('@/pages/privacy'));
const TermsPage       = lazy(() => import('@/pages/terms'));
const NotFoundPage    = lazy(() => import('@/pages/not-found'));

// ─── Admin pages ───────────────────────────────────────────────
const AdminLogin      = lazy(() => import('@/pages/admin/login'));
const AdminDashboard  = lazy(() => import('@/pages/admin/dashboard'));
const AdminHero       = lazy(() => import('@/pages/admin/hero'));
const AdminLeads      = lazy(() => import('@/pages/admin/leads'));
const AdminProducts   = lazy(() => import('@/pages/admin/products/index'));
const AdminProductEdit= lazy(() => import('@/pages/admin/products/edit'));
const AdminServices   = lazy(() => import('@/pages/admin/services'));
const AdminProjects   = lazy(() => import('@/pages/admin/projects'));
const AdminGallery    = lazy(() => import('@/pages/admin/gallery'));
const AdminBlog       = lazy(() => import('@/pages/admin/blog/index'));
const AdminBlogEdit   = lazy(() => import('@/pages/admin/blog/edit'));
const AdminTestimonials = lazy(() => import('@/pages/admin/testimonials'));
const AdminFAQ        = lazy(() => import('@/pages/admin/faq'));
const AdminTeam       = lazy(() => import('@/pages/admin/team'));
const AdminSettings   = lazy(() => import('@/pages/admin/settings'));
const AdminSEO        = lazy(() => import('@/pages/admin/seo'));
const AdminMedia      = lazy(() => import('@/pages/admin/media'));
const GenericEdit     = lazy(() => import('@/pages/admin/generic-edit'));
const VisualEditorEntry = lazy(() => import('@/pages/admin/visual-editor-entry'));

export default function App() {
  return (
    <ErrorBoundary>
      {/* AuthProvider: single Firebase onAuthStateChanged listener for the whole app */}
      <AuthProvider>
        {/* SiteProvider: single set of Firestore listeners for public content */}
        <SiteProvider>
          {/* VisualEditorProvider: edit mode state, reads from auth store */}
          <VisualEditorProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* ── Public routes ─────────────────────────── */}
                  <Route path="/"                 element={<HomePage />} />
                  <Route path="/about"            element={<AboutPage />} />
                  <Route path="/services"         element={<ServicesPage />} />
                  <Route path="/services/:slug"   element={<ServiceDetail />} />
                  <Route path="/products"         element={<ProductsPage />} />
                  <Route path="/projects"         element={<ProjectsPage />} />
                  <Route path="/gallery"          element={<GalleryPage />} />
                  <Route path="/blog"             element={<BlogPage />} />
                  <Route path="/blog/:slug"       element={<BlogPostPage />} />
                  <Route path="/contact"          element={<ContactPage />} />
                  <Route path="/faq"              element={<FAQPage />} />
                  <Route path="/privacy-policy"   element={<PrivacyPage />} />
                  <Route path="/terms"            element={<TermsPage />} />

                  {/* ── Admin: login (standalone, no layout) ──── */}
                  <Route path="/admin/login"      element={<AdminLogin />} />

                  {/* ── Admin: / entry point ──────────────────── */}
                  {/* Redirects to login or opens site in edit mode */}
                  <Route path="/admin"            element={<VisualEditorEntry />} />

                  {/* ── Admin: panel (protected, with sidebar) ── */}
                  <Route path="/admin/panel"      element={<AdminLayout />}>
                    <Route index                  element={<AdminDashboard />} />
                    <Route path="hero"            element={<AdminHero />} />
                    <Route path="leads"           element={<AdminLeads />} />
                    <Route path="products"        element={<AdminProducts />} />
                    <Route path="products/:id"    element={<AdminProductEdit />} />
                    <Route path="services"        element={<AdminServices />} />
                    <Route path="services/:id"    element={<GenericEdit />} />
                    <Route path="projects"        element={<AdminProjects />} />
                    <Route path="projects/:id"    element={<GenericEdit />} />
                    <Route path="gallery"         element={<AdminGallery />} />
                    <Route path="media"           element={<AdminMedia />} />
                    <Route path="blog"            element={<AdminBlog />} />
                    <Route path="blog/:id"        element={<AdminBlogEdit />} />
                    <Route path="testimonials"    element={<AdminTestimonials />} />
                    <Route path="testimonials/:id" element={<GenericEdit />} />
                    <Route path="faq"             element={<AdminFAQ />} />
                    <Route path="faq/:id"         element={<GenericEdit />} />
                    <Route path="team"            element={<AdminTeam />} />
                    <Route path="settings"        element={<AdminSettings />} />
                    <Route path="seo"             element={<AdminSEO />} />
                  </Route>

                  {/* Legacy: /admin/panel/login → redirect to correct route */}
                  <Route path="/admin/panel/login" element={<Navigate to="/admin/login" replace />} />
                  {/* Legacy: /admin/dashboard → redirect to panel */}
                  <Route path="/admin/dashboard"   element={<Navigate to="/admin/panel" replace />} />

                  {/* ── 404 ───────────────────────────────────── */}
                  <Route path="*"                 element={<NotFoundPage />} />
                </Routes>
              </Suspense>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: '#1a1a1a',
                    color: '#f5f5f5',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '14px',
                  },
                  success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                  error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
              />
            </BrowserRouter>
          </VisualEditorProvider>
        </SiteProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
