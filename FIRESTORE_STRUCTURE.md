# Firestore Database Structure

## Collections Overview

### `settings/main` (document)
Site-wide configuration. Read by all visitors.
```json
{
  "siteName": "Shree Enterprises",
  "tagline": "Solar Energy Solutions",
  "phone": "+91 88812 04444",
  "whatsapp": "918881204444",
  "email": "shreesolar@gmail.com",
  "address": "Varanasi, Uttar Pradesh",
  "logoUrl": "https://...",
  "faviconUrl": "https://...",
  "socialLinks": {
    "facebook": "https://facebook.com/...",
    "instagram": "https://instagram.com/...",
    "linkedin": "",
    "twitter": "",
    "youtube": ""
  }
}
```

### `hero_settings/main` (document)
Hero section content. Admin-editable via visual editor.
```json
{
  "heading": "Solar Powered,",
  "headingAccent": "Brighter",
  "subheading": "Future",
  "ctaPrimaryText": "Get Free Quote",
  "ctaPrimaryLink": "/contact",
  "ctaSecondaryText": "Call Now",
  "ctaSecondaryLink": "tel:+918881204444",
  "backgroundImage": "https://...",
  "badges": ["UPNEDA Authorized · PM Surya Ghar Yojana"],
  "trustChips": [
    { "icon": "Shield", "text": "25-Year Warranty" },
    { "icon": "Leaf", "text": "Up to 70% Savings" },
    { "icon": "Zap", "text": "Free Site Survey" }
  ]
}
```

### `settings/benefits`
Benefits section items.
```json
{ "items": [{ "title": "...", "description": "...", "icon": "ShieldCheck" }] }
```

### `settings/brands`
Brand partners list.
```json
{ "items": ["Tata Solar", "Adani Solar", "Luminous", ...] }
```

### `settings/stats`
Homepage stats counters.
```json
{ "items": [{ "label": "Installations Done", "value": 500, "suffix": "+" }] }
```

### `settings/about`
About section content.
```json
{
  "imageUrl": "https://...",
  "yearsText": "8+",
  "p1": "About paragraph 1...",
  "p2": "About paragraph 2...",
  "checkpoints": ["UPNEDA authorized solar installer", ...]
}
```

### `services/{id}` (collection)
```json
{
  "title": "Residential Rooftop Solar",
  "description": "...",
  "icon": "Home",
  "slug": "residential-solar",
  "features": ["..."],
  "benefits": ["..."],
  "isPublished": true,
  "order": 1,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

### `products/{id}` (collection)
```json
{
  "name": "Tata Solar Panel 400W",
  "category": "solar-panels",
  "brand": "Tata Solar",
  "description": "...",
  "specifications": { "Wattage": "400W", "Efficiency": "21.3%" },
  "images": ["https://..."],
  "featured": true,
  "isPublished": true
}
```

### `projects/{id}` (collection)
```json
{
  "title": "5kW Residential Solar Installation",
  "slug": "5kw-residential-lamahi",
  "description": "...",
  "category": "Residential",
  "location": "Lamahi, Varanasi",
  "images": ["https://..."],
  "stats": { "capacity": "5kW", "savings": "₹4,000/mo" },
  "featured": true,
  "isPublished": true
}
```

### `gallery/{id}` (collection)
```json
{
  "title": "Rooftop Installation - Varanasi",
  "category": "Residential",
  "imageUrl": "https://...",
  "description": "3kW system",
  "isPublished": true,
  "order": 1
}
```

### `blog_posts/{id}` (collection)
```json
{
  "title": "How to Apply for PM Surya Ghar Yojana Subsidy",
  "slug": "how-to-apply-pm-surya-ghar-yojana",
  "excerpt": "Step-by-step guide...",
  "content": "Full markdown content...",
  "category": "Government Schemes",
  "author": "Ashish Tripathi",
  "featuredImage": "https://...",
  "tags": ["subsidy", "government"],
  "readTime": "5 min",
  "isPublished": true,
  "publishedAt": timestamp,
  "createdAt": timestamp
}
```

### `testimonials/{id}` (collection)
```json
{
  "name": "Rajesh Gupta",
  "role": "Homeowner",
  "company": "Lamahi, Varanasi",
  "content": "Excellent solar installation...",
  "rating": 5,
  "isPublished": true,
  "featured": false,
  "createdAt": timestamp
}
```

### `faq/{id}` (collection)
```json
{
  "question": "How long does installation take?",
  "answer": "Installation typically takes 3-5 days...",
  "order": 1,
  "isPublished": true,
  "createdAt": timestamp
}
```

### `team/{id}` (collection)
```json
{
  "name": "Ashish Tripathi",
  "role": "Founder & CEO",
  "bio": "...",
  "imageUrl": "https://...",
  "experience": "8+ years",
  "isPublished": true,
  "order": 1
}
```

### `leads/{id}` (collection)
Auto-created on form submission.
```json
{
  "name": "Customer Name",
  "email": "customer@email.com",
  "phone": "+91 ...",
  "service": "residential-solar",
  "message": "...",
  "status": "new",
  "source": "contact_form",
  "createdAt": timestamp
}
```

### `contact_submissions/{id}` (collection)
Same as leads. Used for contact page form.

---

## Admin Setup
1. Go to Firebase Console > Authentication > Enable Email/Password
2. Create an admin user account
3. Go to Firestore > Create document: `admin_users/{uid}` with fields:
   ```json
   { "email": "admin@example.com", "role": "super_admin", "createdAt": timestamp }
   ```
4. Deploy Firestore rules: `firebase deploy --only firestore:rules`
5. Deploy Storage rules: `firebase deploy --only storage:rules`
6. Deploy indexes: `firebase deploy --only firestore:indexes`
