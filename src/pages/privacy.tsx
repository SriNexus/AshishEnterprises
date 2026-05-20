import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SITE_CONFIG } from '@/data/constants';

export default function PrivacyPage() {
  const lastUpdated = 'January 15, 2024';

  return (
    <MainLayout>
      <PageHero
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your personal information."
        breadcrumbs={[{ label: 'Privacy Policy' }]}
        compact
      />

      <Section background="primary" padding="lg">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert prose-headings:font-heading prose-headings:text-content-primary prose-p:text-content-secondary prose-li:text-content-secondary">
          <p className="text-sm text-content-tertiary mb-8">Last updated: {lastUpdated}</p>

          <h2>1. Introduction</h2>
          <p>
            Welcome to {SITE_CONFIG.name}. We respect your privacy and are committed to protecting 
            your personal data. This privacy policy explains how we collect, use, and safeguard 
            your information when you visit our website or use our services.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, and address when you contact us or request a quote.</li>
            <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited and time spent.</li>
            <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers.</li>
            <li><strong>Cookies:</strong> Small data files stored on your device to improve your experience.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information for:</p>
          <ul>
            <li>Responding to your inquiries and providing customer support</li>
            <li>Processing service requests and quotes</li>
            <li>Sending promotional communications (with your consent)</li>
            <li>Improving our website and services</li>
            <li>Complying with legal obligations</li>
          </ul>

          <h2>4. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. 
            We may share your information with:
          </p>
          <ul>
            <li>Service providers who assist in our operations (hosting, analytics)</li>
            <li>Legal authorities when required by law</li>
            <li>Business partners for joint promotions (with your consent)</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your 
            personal data against unauthorized access, alteration, disclosure, or destruction. 
            However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>

          <h2>7. Cookies Policy</h2>
          <p>
            Our website uses cookies to enhance your browsing experience. You can control 
            cookie settings through your browser. Essential cookies are required for the 
            website to function properly.
          </p>

          <h2>8. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites. We are not responsible 
            for the privacy practices of these external sites. We encourage you to read 
            their privacy policies.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under 18 years of age. We do not 
            knowingly collect personal information from children.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of 
            any changes by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our data practices, 
            please contact us at:
          </p>
          <ul>
            <li>Email: {SITE_CONFIG.email}</li>
            <li>Phone: {SITE_CONFIG.phone}</li>
            <li>Address: {SITE_CONFIG.address}</li>
          </ul>
        </div>
      </Section>
    </MainLayout>
  );
}
