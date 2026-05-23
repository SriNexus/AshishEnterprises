import type { NavLink, ServiceData, FAQData, StatData, TestimonialData, ProjectData } from '@/types';

/* ═══════════════════════════════════════════════════
   SITE CONFIGURATION
   ═══════════════════════════════════════════════════ */

export const SITE_CONFIG = {
  name: 'Ashish Enterprises',
  tagline: 'UPNEDA Authorized Solar EPC Company',
  description: 'UPNEDA authorized solar EPC company in Varanasi. Rooftop solar installation, PM Surya Ghar Yojana subsidy assistance, net metering, and solar maintenance services.',
  phone: '+91 8881204444',
  phone2: '+91 7080170802',
  whatsapp: '918881204444',
  email: 'ashishenterprises0151@gmail.com',
  address: 'Lamahi, Lalpur, Varanasi, Uttar Pradesh 221010',
  socialLinks: {
    facebook: 'https://facebook.com/ashishenterprises.varanasi',
    instagram: 'https://instagram.com/ashishenterprises.solar',
    linkedin: '',
    twitter: '',
    youtube: 'https://youtube.com/@ashishenterprises',
  },
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Products', href: '/products' },
  { label: 'Projects', href: '/projects' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

// @ts-ignore — legacy content block (translations moved to /src/i18n/)
const _t = {
  _: {
    badge: { en: 'UPNEDA Authorized · PM Surya Ghar Yojana', hi: 'UPNEDA अधिकृत · पीएम सूर्य घर योजना' },
    heading1: { en: 'Solar Powered,', hi: 'सोलर से रोशन,' },
    headingAccent: { en: 'Brighter', hi: 'भविष्य' },
    heading2: { en: ' Future', hi: ' उज्ज्वल' },
    description: {
      en: 'UPNEDA authorized solar EPC company serving Varanasi & Eastern UP. Get up to ₹78,000 government subsidy on rooftop solar installation under PM Surya Ghar Yojana.',
      hi: 'वाराणसी और पूर्वी UP में UPNEDA अधिकृत सोलर EPC कंपनी। PM सूर्य घर योजना के तहत ₹78,000 तक सब्सिडी सहित रूफटॉप सोलर इंस्टॉलेशन।',
    },
    cta1: { en: 'Get Free Quote', hi: 'फ्री कोट पाएं' },
    cta2: { en: 'Call Now', hi: 'कॉल करें' },
    chips: [
      { icon: 'Shield', en: '25-Year Warranty', hi: '25 वर्ष वारंटी' },
      { icon: 'Leaf', en: 'Up to 70% Savings', hi: '70% तक बचत' },
      { icon: 'Zap', en: 'Free Site Survey', hi: 'फ्री साइट सर्वे' },
    ],
  },
  // About
  about: {
    badge: { en: 'About Us', hi: 'हमारे बारे में' },
    title: { en: "Varanasi's Trusted Solar Partner", hi: 'वाराणसी का भरोसेमंद सोलर पार्टनर' },
    subtitle: {
      en: 'Ashish Enterprises — UPNEDA authorized solar EPC company specializing in rooftop solar, subsidy assistance, and net metering.',
      hi: 'Ashish Enterprises — UPNEDA अधिकृत सोलर EPC कंपनी। रूफटॉप सोलर, सब्सिडी सहायता, और नेट मीटरिंग में विशेषज्ञ।',
    },
  },
  // Benefits
  benefits: {
    badge: { en: 'Why Choose Us', hi: 'हमें क्यों चुनें' },
    title: { en: 'The Ashish Enterprises Advantage', hi: 'Ashish Enterprises की विशेषता' },
  },
  // Section headings
  sections: {
    services: { en: 'Our Services', hi: 'हमारी सेवाएं' },
    servicesTitle: { en: 'Complete Solar & Electrical Solutions', hi: 'संपूर्ण सोलर और इलेक्ट्रिकल समाधान' },
    servicesSubtitle: { en: 'From residential rooftops to commercial installations, we deliver end-to-end solutions.', hi: 'घरेलू छतों से लेकर व्यावसायिक इंस्टॉलेशन तक, हम पूर्ण समाधान प्रदान करते हैं।' },
    projects: { en: 'Our Projects', hi: 'हमारे प्रोजेक्ट्स' },
    projectsTitle: { en: 'Proven Track Record of Excellence', hi: 'उत्कृष्टता का सिद्ध ट्रैक रिकॉर्ड' },
    testimonials: { en: 'Testimonials', hi: 'ग्राहकों की राय' },
    testimonialsTitle: { en: 'What Our Clients Say', hi: 'हमारे ग्राहक क्या कहते हैं' },
    testimonialsSubtitle: { en: 'Real stories from real customers who trusted us with their energy needs.', hi: 'उन ग्राहकों की सच्ची कहानियाँ जिन्होंने अपनी ऊर्जा जरूरतों के लिए हम पर भरोसा किया।' },
    faqBadge: { en: 'FAQs', hi: 'सवाल-जवाब' },
    faq: { en: 'Frequently Asked Questions', hi: 'अक्सर पूछे जाने वाले प्रश्न' },
    faqSubtitle: { en: 'Find answers to the most common questions about solar energy and our services.', hi: 'सोलर ऊर्जा और हमारी सेवाओं के बारे में सबसे आम सवालों के जवाब पाएं।' },
    contact: { en: 'Ready to Go Solar?', hi: 'सोलर लगवाने के लिए तैयार?' },
    contactSubtitle: { en: 'Fill out the form and our team will get back to you within 24 hours with a free customized quote.', hi: 'फॉर्म भरें और हमारी टीम 24 घंटे के भीतर आपसे संपर्क करेगी।' },
    getQuote: { en: 'Get Free Quote', hi: 'फ्री कोट पाएं' },
    viewAll: { en: 'View All', hi: 'सभी देखें' },
    learnMore: { en: 'Learn More', hi: 'और जानें' },
    sendMessage: { en: 'Send Message', hi: 'संदेश भेजें' },
    callNow: { en: 'Call Now', hi: 'कॉल करें' },
  },
  // Service bilingual descriptions
  serviceDescriptions: {
    'residential-solar': { en: 'Power your home with rooftop solar panels and eliminate electricity bills. Get up to ₹78,000 subsidy under PM Surya Ghar Yojana.', hi: 'घर की छत पर सोलर पैनल लगवाएं और बिजली बिल से मुक्ति पाएं। PM सूर्य घर योजना के तहत ₹78,000 तक सब्सिडी उपलब्ध।' },
    'commercial-solar': { en: 'Solar power systems for shops, offices, and commercial buildings. Reduce electricity costs by 60-80% with on-grid solar.', hi: 'दुकान, ऑफिस, और व्यावसायिक भवनों के लिए सोलर पावर सिस्टम — बिजली खर्च 60-80% तक कम करें।' },
    'on-grid-systems': { en: 'Grid-connected solar systems with net metering. Sell excess electricity back to the grid and earn credits.', hi: 'ग्रिड-कनेक्टेड सोलर सिस्टम — नेट मीटरिंग से अतिरिक्त बिजली ग्रिड को बेचें और क्रेडिट कमाएं।' },
    'off-grid-systems': { en: 'Independent solar power with battery backup for areas with no grid or frequent power cuts. 24x7 supply.', hi: 'बिजली कनेक्शन न हो या बार-बार कटती हो — बैटरी बैकअप के साथ 24x7 पावर सप्लाई।' },
    'subsidy-assistance': { en: 'Complete assistance with PM Surya Ghar Yojana subsidy applications, DISCOM approvals, and all paperwork.', hi: 'PM सूर्य घर योजना के तहत सब्सिडी आवेदन, DISCOM अप्रूवल, और पूरी पेपरवर्क हम करते हैं।' },
    'solar-maintenance': { en: 'Keep your solar system at peak performance with regular cleaning, inverter servicing, and monitoring.', hi: 'सोलर सिस्टम की नियमित सफाई, इन्वर्टर सर्विस, और परफॉर्मेंस मॉनिटरिंग — AMC पैकेज उपलब्ध।' },
  } as Record<string, { en: string; hi: string }>,
  // Benefits bilingual
  benefitDetails: [
    { en: 'Government authorized vendor — approved for all subsidy schemes and official installations.', hi: 'सरकार द्वारा अधिकृत — सभी सरकारी योजनाओं और सब्सिडी के लिए मान्य।' },
    { en: "Tata, Adani, Waaree — only certified products from India's top solar manufacturers.", hi: 'Tata, Adani, Waaree — केवल भारत के टॉप ब्रांड्स के प्रमाणित उत्पाद।' },
    { en: 'From system design to subsidy processing — we handle the entire process end-to-end.', hi: 'डिज़ाइन से लेकर सब्सिडी तक — सारी प्रक्रिया हम करते हैं।' },
    { en: 'We stay with you after installation — AMC packages, cleaning, and repair services.', hi: 'इंस्टॉलेशन के बाद भी हम आपके साथ — AMC, सफाई, और रिपेयर सेवा।' },
    { en: 'Full assistance to help you get up to ₹78,000 subsidy under PM Surya Ghar Yojana.', hi: 'PM सूर्य घर योजना के तहत ₹78,000 तक सब्सिडी दिलाने में पूरी सहायता।' },
    { en: 'Installation completed in 3-5 days — minimal disruption, maximum quality.', hi: '3-5 दिनों में इंस्टॉलेशन पूर्ण — न्यूनतम असुविधा, अधिकतम गुणवत्ता।' },
  ],
  // Footer
  footer: {
    aboutHeading: { en: 'About Us', hi: 'हमारे बारे में' },
    quickLinks: { en: 'Quick Links', hi: 'त्वरित लिंक' },
    servicesHeading: { en: 'Services', hi: 'सेवाएं' },
    contactHeading: { en: 'Contact Us', hi: 'संपर्क करें' },
    newsletter: { en: 'Stay updated with our latest projects', hi: 'हमारे नवीनतम प्रोजेक्ट्स से अपडेट रहें' },
    rights: { en: 'All rights reserved.', hi: 'सर्वाधिकार सुरक्षित।' },
  },
} as const;

/* ═══════════════════════════════════════════════════
   SERVICES — English primary
   ═══════════════════════════════════════════════════ */

export const SERVICES: ServiceData[] = [
  {
    id: 'residential-solar',
    title: 'Residential Rooftop Solar',
    description: 'Power your home with rooftop solar panels and eliminate electricity bills. Get up to ₹78,000 subsidy under PM Surya Ghar Yojana.',
    icon: 'Home',
    features: ['1kW–10kW rooftop systems', 'UPNEDA authorized installation', 'Net metering setup', 'PM Surya Ghar subsidy assistance'],
  },
  {
    id: 'commercial-solar',
    title: 'Commercial Solar Solutions',
    description: 'Solar power systems for shops, offices, and commercial buildings. Reduce electricity costs by 60-80% with on-grid solar.',
    icon: 'Building2',
    features: ['10kW–100kW systems', 'Accelerated depreciation benefits', 'Custom system design', 'Maintenance contracts'],
  },
  {
    id: 'on-grid-systems',
    title: 'On-Grid Solar Systems',
    description: 'Grid-connected solar systems with net metering. Sell excess electricity back to the grid and earn credits on your bill.',
    icon: 'PlugZap',
    features: ['Zero electricity bills', 'Net metering credits', 'Government subsidy eligible', '4-5 year ROI'],
  },
  {
    id: 'off-grid-systems',
    title: 'Off-Grid Solar Systems',
    description: 'Independent solar power with battery backup for areas with no grid connection or frequent power cuts. 24x7 power supply.',
    icon: 'BatteryFull',
    features: ['Complete energy independence', 'Lithium / tubular batteries', 'Ideal for rural areas', '8-12 hours backup'],
  },
  {
    id: 'subsidy-assistance',
    title: 'Subsidy Assistance Service',
    description: 'Complete assistance with PM Surya Ghar Yojana subsidy applications, DISCOM approvals, and all government paperwork.',
    icon: 'Wrench',
    features: ['Subsidy application filing', 'UPNEDA portal registration', 'DISCOM NOC processing', 'Net meter installation'],
  },
  {
    id: 'solar-maintenance',
    title: 'Solar AMC & Maintenance',
    description: 'Keep your solar system running at peak performance with regular cleaning, inverter servicing, and performance monitoring.',
    icon: 'Zap',
    features: ['Panel cleaning', 'Inverter servicing', 'Performance reports', 'Emergency repair'],
  },
];

/* ═══════════════════════════════════════════════════
   PRODUCTS — English primary
   ═══════════════════════════════════════════════════ */

export const PRODUCTS = [
  {
    id: 'solar-systems',
    category: 'Rooftop Solar Systems',
    description: 'UPNEDA authorized rooftop solar systems with PM Surya Ghar Yojana subsidy included.',
    items: [
      { name: '1kW On-Grid System', brand: 'Tata / Waaree', efficiency: 'Mono PERC', warranty: '25 years' },
      { name: '2kW On-Grid System', brand: 'Tata Solar', efficiency: '₹30,000 subsidy', warranty: '25 years' },
      { name: '3kW On-Grid System', brand: 'Tata / Adani', efficiency: '₹78,000 subsidy', warranty: '25 years' },
      { name: '5kW On-Grid System', brand: 'Waaree / Vikram', efficiency: '₹78,000 subsidy', warranty: '25 years' },
    ],
  },
  {
    id: 'solar-panels',
    category: 'Solar Panels',
    description: 'High-efficiency Mono PERC and Bifacial solar panels from Tier-1 Indian manufacturers.',
    items: [
      { name: 'Mono PERC 545W', brand: 'Tata Solar', efficiency: '21.5%', warranty: '25 years' },
      { name: 'Bifacial 550W', brand: 'Adani Solar', efficiency: '22.1%', warranty: '25 years' },
      { name: 'Mono PERC 540W', brand: 'Waaree Energies', efficiency: '21.2%', warranty: '25 years' },
      { name: 'Half-Cut 445W', brand: 'Vikram Solar', efficiency: '20.2%', warranty: '25 years' },
    ],
  },
  {
    id: 'solar-inverters',
    category: 'Solar Inverters',
    description: 'On-Grid, Off-Grid, and Hybrid inverters from trusted global brands.',
    items: [
      { name: 'String Inverter 3kW', brand: 'Growatt', efficiency: '98.4%', warranty: '5 years' },
      { name: 'Hybrid Inverter 5kW', brand: 'Solis', efficiency: '97.6%', warranty: '5 years' },
      { name: 'On-Grid Inverter 10kW', brand: 'Huawei', efficiency: '98.6%', warranty: '10 years' },
      { name: 'Micro Inverter 400W', brand: 'Enphase', efficiency: '96.5%', warranty: '25 years' },
    ],
  },
  {
    id: 'batteries',
    category: 'Solar Batteries',
    description: 'Lithium and tubular batteries for Off-Grid and Hybrid solar systems.',
    items: [
      { name: 'Lithium 3.5kWh', brand: 'Luminous', type: 'LiFePO4', warranty: '10 years' },
      { name: 'Tubular 150Ah', brand: 'Exide', type: 'Lead Acid', warranty: '5 years' },
      { name: 'Lithium 5kWh', brand: 'Okaya', type: 'LiFePO4', warranty: '10 years' },
      { name: 'Tall Tubular 200Ah', brand: 'Luminous', type: 'Lead Acid', warranty: '5 years' },
    ],
  },
  {
    id: 'solar-accessories',
    category: 'Solar Accessories',
    description: 'Mounting structures, wiring, ACDB/DCDB boxes, and other essential components.',
    items: [
      { name: 'GI Mounting Structure', type: 'Hot-dip Galvanized', capacity: '1-10kW', warranty: '10 years' },
      { name: 'ACDB/DCDB Box', type: 'IP65 Rated', capacity: '1-10kW', warranty: '2 years' },
      { name: 'DC Cable 4mm²', type: 'UV Resistant', capacity: '100m roll', warranty: '10 years' },
      { name: 'MC4 Connectors', type: 'IP67 Rated', capacity: 'Pair set', warranty: '5 years' },
    ],
  },
];

export const STATS: StatData[] = [
  { label: 'Installations Done', value: 500, suffix: '+' },
  { label: 'kW Installed', value: 850, suffix: '+' },
  { label: 'Happy Families', value: 450, suffix: '+' },
  { label: 'Years Experience', value: 8, suffix: '+' },
];

/* ═══════════════════════════════════════════════════
   TESTIMONIALS — realistic Varanasi region
   ═══════════════════════════════════════════════════ */

export const TESTIMONIALS: TestimonialData[] = [
  {
    id: '1', name: 'Rajesh Gupta', role: 'Homeowner', company: 'Lamahi, Varanasi',
    content: 'Ashish Enterprises installed a 3kW solar system on our rooftop. They handled the entire subsidy process themselves. Our electricity bill is now practically zero. Excellent work!',
    rating: 5,
  },
  {
    id: '2', name: 'Sandeep Verma', role: 'Shop Owner', company: 'Pandeypur, Varanasi',
    content: 'Got a 5kW system installed for my showroom. Ashish ji personally supervised the installation. Net metering was set up within 2 weeks. Very professional team and genuine products.',
    rating: 5,
  },
  {
    id: '3', name: 'Sunita Devi', role: 'Homeowner', company: 'Cholapur, Varanasi',
    content: 'Learned about PM Surya Ghar Yojana from them. Got a 2kW system installed and received ₹30,000 subsidy. Very trustworthy company. I recommend them to everyone.',
    rating: 5,
  },
  {
    id: '4', name: 'Anil Kumar Pandey', role: 'School Principal', company: 'Lamahi, Varanasi',
    content: 'We installed a 10kW system for our school building through Ashish Enterprises. UPNEDA approval was handled completely by them. The system has been running perfectly for over a year now.',
    rating: 5,
  },
  {
    id: '5', name: 'Manoj Tiwari', role: 'Farmer', company: 'Azamgarh Road, Varanasi',
    content: 'Got a solar pump for farming and a 3kW home system installed. The team completed the work on time. Subsidy amount was also credited to my account. Great service!',
    rating: 4,
  },
  {
    id: '6', name: 'Dr. Priya Singh', role: 'Clinic Owner', company: 'Hokulganj, Varanasi',
    content: 'Installed a 4kW hybrid system for my clinic with battery backup. Even during power cuts, all equipment runs smoothly. Ashish Enterprises provided excellent after-sales service. Highly recommended!',
    rating: 5,
  },
];

export const PROJECTS: ProjectData[] = [
  {
    id: '1', title: '3kW Rooftop Solar — Lalpur, Varanasi', category: 'Residential', imageUrl: '',
    description: 'Residential rooftop solar installation under PM Surya Ghar Yojana with full UPNEDA approval and net metering setup.',
    stats: { capacity: '3 kW', subsidy: '₹78,000', timeline: '5 days' },
  },
  {
    id: '2', title: '5kW Commercial System — Pandeypur', category: 'Commercial', imageUrl: '',
    description: 'On-grid solar system for a commercial showroom, reducing monthly electricity bill from ₹12,000 to near zero.',
    stats: { capacity: '5 kW', savings: '₹12K/mo', roi: '3.5 yrs' },
  },
  {
    id: '3', title: '10kW School Rooftop — Lamahi', category: 'Institutional', imageUrl: '',
    description: 'Large-scale rooftop installation for a school building, UPNEDA approved with net metering and monitoring system.',
    stats: { capacity: '10 kW', panels: '20', area: '600 sq.ft' },
  },
  {
    id: '4', title: '2kW Residential — Cholapur', category: 'Residential', imageUrl: '',
    description: 'Compact residential system for a family home, installed under PM Surya Ghar scheme with ₹30,000 central subsidy.',
    stats: { capacity: '2 kW', subsidy: '₹30,000', bill: '₹0/mo' },
  },
  {
    id: '5', title: '4kW Hybrid System — Hokulganj', category: 'Healthcare', imageUrl: '',
    description: 'Hybrid solar system with lithium battery backup for a medical clinic, ensuring uninterrupted power during outages.',
    stats: { capacity: '4 kW', backup: '6 hrs', type: 'Hybrid' },
  },
  {
    id: '6', title: '8kW Commercial — Azamgarh Road', category: 'Commercial', imageUrl: '',
    description: 'Grid-tied solar installation for a warehouse with real-time monitoring and annual maintenance contract.',
    stats: { capacity: '8 kW', savings: '70%', panels: '16' },
  },
];

export const GALLERY_IMAGES = [
  { id: '1', title: '3kW Rooftop — Lalpur', category: 'Residential', description: 'Tata Solar panels on residential rooftop' },
  { id: '2', title: '5kW Commercial — Pandeypur', category: 'Commercial', description: 'On-grid system for showroom' },
  { id: '3', title: 'Panel Installation', category: 'Installation', description: 'Our team installing solar panels' },
  { id: '4', title: 'Inverter Setup', category: 'Equipment', description: 'Growatt inverter configuration' },
  { id: '5', title: '10kW School Project', category: 'Institutional', description: 'School building rooftop solar' },
  { id: '6', title: 'Net Meter Installed', category: 'Equipment', description: 'Bi-directional net meter setup' },
  { id: '7', title: 'Team at Site', category: 'Team', description: 'Ashish Enterprises installation team' },
  { id: '8', title: 'Quality Inspection', category: 'Quality', description: 'Post-installation quality check' },
  { id: '9', title: '2kW Residential — Cholapur', category: 'Residential', description: 'Compact home solar system' },
];

export const BLOG_POSTS = [
  { id: '1', slug: 'pm-surya-ghar-yojana-complete-guide', title: 'PM Surya Ghar Yojana — Complete Subsidy Guide 2024', excerpt: 'Learn how to get up to ₹78,000 government subsidy on rooftop solar under PM Surya Ghar Muft Bijli Yojana.', category: 'Subsidies', author: 'Ashish Enterprises', date: '2024-06-15', readTime: '8 min read', featured: true },
  { id: '2', slug: 'solar-subsidy-up-2024', title: 'Uttar Pradesh Solar Subsidy 2024 — Complete Guide', excerpt: 'Everything you need to know about UPNEDA solar subsidies, eligibility, and how to apply for rooftop solar in UP.', category: 'Subsidies', author: 'Ashish Enterprises', date: '2024-05-20', readTime: '6 min read', featured: true },
  { id: '3', slug: '2kw-vs-3kw-solar-system', title: '2kW vs 3kW Solar System — Which One Should You Choose?', excerpt: 'Compare the two most popular residential solar systems — pricing, subsidy, electricity generation, and which fits your home best.', category: 'Solar Education', author: 'Ashish Enterprises', date: '2024-04-10', readTime: '5 min read', featured: false },
  { id: '4', slug: 'net-metering-varanasi-guide', title: 'Net Metering in Varanasi — How to Apply & Benefits', excerpt: 'Step-by-step guide to getting net metering approval in Varanasi. Sell excess solar power back to the grid.', category: 'Solar Education', author: 'Ashish Enterprises', date: '2024-03-15', readTime: '6 min read', featured: false },
  { id: '5', slug: 'solar-panel-maintenance-tips', title: '7 Essential Solar Panel Maintenance Tips', excerpt: 'Keep your solar panels clean and well-maintained for maximum efficiency and longer lifespan. Simple tips anyone can follow.', category: 'Maintenance', author: 'Ashish Enterprises', date: '2024-02-28', readTime: '4 min read', featured: true },
  { id: '6', slug: 'rooftop-solar-varanasi-benefits', title: 'Why Varanasi is Perfect for Rooftop Solar — 2024 Analysis', excerpt: 'With 280+ sunny days, Varanasi is ideal for solar energy. Here\'s why investing in rooftop solar is a smart decision.', category: 'Business', author: 'Ashish Enterprises', date: '2024-01-20', readTime: '5 min read', featured: false },
];

export const FAQS: FAQData[] = [
  { id: '1', question: 'How much subsidy is available under PM Surya Ghar Yojana?', answer: 'Under PM Surya Ghar Muft Bijli Yojana, you can get up to ₹30,000 for 1kW, ₹60,000 for 2kW, and ₹78,000 for 3kW and above as central government subsidy. The amount is directly credited to your bank account via DBT.' },
  { id: '2', question: 'Is Ashish Enterprises UPNEDA authorized?', answer: 'Yes, Ashish Enterprises is an authorized solar EPC vendor empaneled with UPNEDA (Uttar Pradesh New & Renewable Energy Development Agency). We handle installations and subsidy processing under all government schemes.' },
  { id: '3', question: 'How long does installation take?', answer: 'Residential installations (1-5kW) are completed in 3-5 days. This includes mounting structure, panel installation, inverter setup, wiring, and testing. Net metering approval takes an additional 2-3 weeks.' },
  { id: '4', question: 'How much roof space is required?', answer: 'You need approximately 100 sq.ft. of shadow-free roof space per 1kW of solar capacity. So a 3kW system needs ~300 sq.ft. and a 5kW system needs ~500 sq.ft.' },
  { id: '5', question: 'What brands do you use?', answer: 'We use only Tier-1 brands: Tata Solar, Adani Solar, Waaree, and Vikram Solar for panels. Growatt, Solis, and Huawei for inverters. Luminous and Exide for batteries. All components carry full manufacturer warranty.' },
  { id: '6', question: 'Are EMI / financing options available?', answer: 'Yes, we help facilitate bank loans and EMI options for solar installations. Many banks offer solar loans at 5-7% interest rates. We assist with all the paperwork.' },
  { id: '7', question: 'What is net metering and how does it work?', answer: 'Net metering allows you to sell excess solar electricity back to the grid. A bi-directional meter tracks both import and export. You only pay for the "net" electricity consumed. We handle the complete DISCOM application.' },
  { id: '8', question: 'What is the warranty on solar panels?', answer: 'Solar panels come with a 25-year performance warranty and 10-year product warranty. Inverters carry 5-10 year warranties. Our installation workmanship is guaranteed for 5 years.' },
  { id: '9', question: 'Do you provide service outside Varanasi?', answer: 'Yes, we serve Varanasi, Cholapur, Lamahi, Pandeypur, Azamgarh Road, and surrounding areas within 50km. For larger projects, we also travel to Jaunpur, Mirzapur, Chandauli, and Ghazipur.' },
  { id: '10', question: 'What happens on cloudy days or at night?', answer: 'On cloudy days, solar panels still generate power at 20-30% capacity. At night, on-grid systems draw from the grid while off-grid systems use battery backup. Net metering ensures you get credit for daytime excess generation.' },
];

export const BENEFITS = [
  { title: 'UPNEDA Authorized', description: 'Government authorized vendor — approved for all subsidy schemes and official installations.', icon: 'ShieldCheck' },
  { title: 'Tier-1 Products', description: 'Tata, Adani, Waaree — only certified products from India\'s top solar manufacturers.', icon: 'Award' },
  { title: 'Complete Solution', description: 'From system design to subsidy processing — we handle the entire process end-to-end.', icon: 'Key' },
  { title: 'After-Sales Support', description: 'We stay with you after installation — AMC packages, cleaning, and repair services available.', icon: 'Headphones' },
  { title: 'Subsidy Assistance', description: 'Full assistance to help you get up to ₹78,000 subsidy under PM Surya Ghar Yojana.', icon: 'BadgePercent' },
  { title: 'Fast Installation', description: 'Installation completed in 3-5 days — minimal disruption, maximum quality.', icon: 'Timer' },
] as const;

export const TEAM_MEMBERS = [
  { name: 'Ashish Tripathi', role: 'Founder & CEO', experience: '8+ years in Solar EPC' },
  { name: 'Rajesh Kumar', role: 'Technical Head', experience: 'Certified Solar Designer' },
  { name: 'Vikash Yadav', role: 'Installation Lead', experience: '500+ installations' },
  { name: 'Priya Singh', role: 'Customer Relations', experience: 'Subsidy & Documentation Expert' },
];
