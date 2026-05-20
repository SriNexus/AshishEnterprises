import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Users, TrendingUp, Target, Eye, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TEAM_MEMBERS } from '@/data/constants';
import { fadeUp, fadeLeft, fadeRight, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { StatsSection } from '@/sections/stats';
import { TestimonialsSection } from '@/sections/testimonials';

const highlights = [
  { icon: Award, label: 'ISO 9001:2015 Certified', description: 'Quality management system certified' },
  { icon: Users, label: '50+ Expert Team', description: 'Certified engineers & technicians' },
  { icon: TrendingUp, label: '99.5% Satisfaction', description: 'Industry-leading customer satisfaction' },
];

const milestones = [
  { year: '2016', title: 'Company Founded', description: 'Started solar energy services in Varanasi' },
  { year: '2018', title: 'UPNEDA Empanelment', description: 'Authorized as EPC vendor by Uttar Pradesh government' },
  { year: '2020', title: '100+ Installations', description: 'Completed 100+ solar installations in Varanasi region' },
  { year: '2022', title: 'PM Surya Ghar Partner', description: 'Authorized installer for PM Surya Ghar Yojana' },
  { year: '2023', title: '500+ Happy Families', description: 'Connected 500+ families with solar energy' },
  { year: '2024', title: 'Regional Expansion', description: 'Expanded services to Jaunpur, Mirzapur & Chandauli' },
];

export default function AboutPage() {
  const { ref: missionRef, inView: missionInView } = useScrollReveal();
  const { ref: timelineRef, inView: timelineInView } = useScrollReveal();
  const { ref: teamRef, inView: teamInView } = useScrollReveal();

  return (
    <MainLayout>
      <PageHero
        title="About Ashish Enterprises"
        subtitle="UPNEDA authorized solar EPC company serving Varanasi & Eastern UP since 2016."
        breadcrumbs={[{ label: 'About Us' }]}
      />

      {/* Company Overview */}
      <Section background="primary" padding="lg">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image/Visual */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-brand-secondary to-brand-secondary-dark">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-56 h-56">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-brand-primary/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-6 rounded-full border-4 border-brand-primary/20"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-brand-primary/20 flex items-center justify-center">
                      <span className="text-5xl">☀️</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience badge */}
            <motion.div
              className="absolute -bottom-4 -right-4 sm:right-8 bg-brand-primary rounded-2xl p-6 shadow-xl shadow-brand-primary/20"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="text-center text-white">
                <div className="text-4xl font-bold font-heading">8+</div>
                <div className="text-sm font-medium opacity-80">Years</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 bg-brand-primary/10 text-brand-primary">
                Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-content-primary mb-4">
                Pioneering Solar Excellence Since 2009
              </h2>
            </div>

            <p className="text-content-secondary leading-relaxed">
              Ashish Enterprises was founded in Varanasi with a mission to make clean solar energy
              accessible to every home and business. Today, as a UPNEDA authorized solar EPC company,
              we serve hundreds of families and businesses across Eastern Uttar Pradesh.
            </p>

            <p className="text-content-secondary leading-relaxed">
              Our journey began with a simple belief: every household deserves affordable, reliable,
              and clean energy. With 500+ installations and 850+ kW of solar capacity deployed,
              we've helped our customers save lakhs on electricity bills.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              {highlights.map(({ icon: Icon, label, description }) => (
                <div key={label} className="p-4 rounded-xl bg-surface-secondary border border-line">
                  <Icon className="h-6 w-6 text-brand-primary mb-2" />
                  <div className="text-sm font-semibold text-content-primary">{label}</div>
                  <div className="text-xs text-content-tertiary mt-1">{description}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section background="secondary" padding="lg">
        <motion.div
          ref={missionRef}
          variants={staggerContainer}
          initial="hidden"
          animate={missionInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 gap-8"
        >
          <motion.div variants={fadeUp}>
            <Card className="h-full" padding="lg">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-5">
                <Target className="h-7 w-7 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold font-heading text-content-primary mb-3">Our Mission</h3>
              <p className="text-content-secondary leading-relaxed">
                To make solar energy accessible and affordable for every Indian household and business, 
                delivering world-class quality with exceptional service. We are committed to reducing 
                carbon footprints while maximizing energy savings for our customers.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="h-full" padding="lg">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-5">
                <Eye className="h-7 w-7 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold font-heading text-content-primary mb-3">Our Vision</h3>
              <p className="text-content-secondary leading-relaxed">
                To be India's most trusted solar energy partner, leading the clean energy revolution 
                with innovation, integrity, and impact. We envision a future where clean energy powers 
                every home, business, and community in India.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </Section>

      {/* Stats */}
      <StatsSection />

      {/* Timeline */}
      <Section background="primary" padding="lg">
        <SectionHeading
          badge="Our Journey"
          title="Milestones That Define Us"
          subtitle="Key moments in our 15+ year journey of powering India's sustainable future."
        />

        <motion.div
          ref={timelineRef}
          variants={staggerContainer}
          initial="hidden"
          animate={timelineInView ? 'visible' : 'hidden'}
          className="relative"
        >
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-line md:-translate-x-1/2" />

          <div className="space-y-8">
            {milestones.map((item, idx) => (
              <motion.div
                key={item.year}
                variants={fadeUp}
                className={`relative flex items-center gap-6 ${
                  idx % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-brand-primary border-4 border-surface-primary -translate-x-1/2 z-10" />

                {/* Content card */}
                <div className={`flex-1 ml-12 md:ml-0 ${idx % 2 === 0 ? 'md:mr-[52%] md:text-right' : 'md:ml-[52%]'}`}>
                  <Card className="inline-block" padding="md">
                    <div className="text-sm font-bold text-brand-primary mb-1">{item.year}</div>
                    <h4 className="text-lg font-bold text-content-primary mb-1">{item.title}</h4>
                    <p className="text-sm text-content-secondary">{item.description}</p>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* Team */}
      <Section background="secondary" padding="lg">
        <SectionHeading
          badge="Our Team"
          title="Meet the Experts"
          subtitle="Our leadership team brings decades of combined experience in solar and electrical engineering."
        />

        <motion.div
          ref={teamRef}
          variants={staggerContainer}
          initial="hidden"
          animate={teamInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {TEAM_MEMBERS.map((member) => (
            <motion.div key={member.name} variants={fadeUp}>
              <Card className="text-center group" padding="lg">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-brand-primary/20 transition-all">
                  <span className="text-3xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-content-primary">{member.name}</h4>
                <p className="text-sm text-brand-primary font-medium">{member.role}</p>
                <p className="text-xs text-content-tertiary mt-1">{member.experience}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA */}
      <Section background="primary" padding="lg">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-content-primary mb-4">
            Ready to Go Solar?
          </h2>
          <p className="text-content-secondary mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers who have made the switch to clean energy.
          </p>
          <Link to="/contact">
            <Button size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
              Get Free Consultation
            </Button>
          </Link>
        </div>
      </Section>
    </MainLayout>
  );
}
