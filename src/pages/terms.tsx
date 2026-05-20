import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SITE_CONFIG } from '@/data/constants';

export default function TermsPage() {
  const lastUpdated = 'January 15, 2024';

  return (
    <MainLayout>
      <PageHero
        title="Terms & Conditions"
        subtitle="Terms of service for using our website and services."
        breadcrumbs={[{ label: 'Terms & Conditions' }]}
        compact
      />

      <Section background="primary" padding="lg">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert prose-headings:font-heading prose-headings:text-content-primary prose-p:text-content-secondary prose-li:text-content-secondary">
          <p className="text-sm text-content-tertiary mb-8">Last updated: {lastUpdated}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the {SITE_CONFIG.name} website and services, you accept 
            and agree to be bound by these Terms & Conditions. If you do not agree with 
            any part of these terms, you should not use our website or services.
          </p>

          <h2>2. Services</h2>
          <p>
            {SITE_CONFIG.name} provides solar energy solutions including but not limited to:
          </p>
          <ul>
            <li>Residential and commercial solar panel installations</li>
            <li>Solar system design and engineering</li>
            <li>Electrical services and maintenance</li>
            <li>Energy consulting and auditing</li>
          </ul>

          <h2>3. Quotations and Pricing</h2>
          <p>
            All quotations are valid for 30 days unless otherwise specified. Prices are 
            subject to change based on site conditions, material costs, and government policies. 
            Final pricing will be confirmed in a formal agreement before work commences.
          </p>

          <h2>4. Payment Terms</h2>
          <ul>
            <li>A deposit is required to confirm the booking</li>
            <li>Progress payments as per the agreed schedule</li>
            <li>Final payment upon project completion and commissioning</li>
            <li>All payments are non-refundable unless otherwise agreed in writing</li>
          </ul>

          <h2>5. Warranties</h2>
          <p>Our warranty coverage includes:</p>
          <ul>
            <li>Solar panels: 25-year performance warranty (as per manufacturer)</li>
            <li>Inverters: 5-10 year warranty (as per manufacturer)</li>
            <li>Installation workmanship: 5-year warranty</li>
            <li>Batteries: As per manufacturer warranty</li>
          </ul>
          <p>
            Warranty claims are subject to proper use and maintenance of the equipment. 
            Damage due to misuse, natural disasters, or unauthorized modifications is not covered.
          </p>

          <h2>6. Customer Responsibilities</h2>
          <p>Customers are responsible for:</p>
          <ul>
            <li>Providing accurate site information and access</li>
            <li>Obtaining necessary permissions and approvals</li>
            <li>Ensuring safe working conditions for our team</li>
            <li>Maintaining the solar system as recommended</li>
            <li>Reporting any issues promptly</li>
          </ul>

          <h2>7. Limitation of Liability</h2>
          <p>
            {SITE_CONFIG.name} shall not be liable for any indirect, incidental, special, 
            or consequential damages arising from the use of our services. Our total liability 
            shall not exceed the amount paid for the specific service in question.
          </p>

          <h2>8. Force Majeure</h2>
          <p>
            We shall not be held responsible for delays or failures due to circumstances 
            beyond our control, including natural disasters, government actions, supply 
            chain disruptions, or other force majeure events.
          </p>

          <h2>9. Intellectual Property</h2>
          <p>
            All content on this website, including text, images, logos, and designs, 
            is the property of {SITE_CONFIG.name} and is protected by copyright laws. 
            Unauthorized use is prohibited.
          </p>

          <h2>10. Cancellation Policy</h2>
          <ul>
            <li>Cancellation before work begins: Deposit may be partially refundable</li>
            <li>Cancellation after work begins: No refund for work completed</li>
            <li>We reserve the right to cancel orders due to unforeseen circumstances</li>
          </ul>

          <h2>11. Dispute Resolution</h2>
          <p>
            Any disputes arising from these terms or our services shall be resolved through 
            amicable negotiation. If unresolved, disputes shall be subject to the exclusive 
            jurisdiction of courts in Varanasi, Uttar Pradesh.
          </p>

          <h2>12. Modifications</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of our 
            services after changes constitutes acceptance of the modified terms.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of 
            India, without regard to its conflict of law provisions.
          </p>

          <h2>14. Contact Information</h2>
          <p>For questions about these terms, contact us at:</p>
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
