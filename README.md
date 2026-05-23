# Shree Enterprises — Solar Website with Visual Live CMS

A production-ready solar energy company website with a **Shopify-style Visual CMS Editor** built on React + Firebase.

---

## ✨ Key Features

### Visual Live Website Editor
- **`/admin`** — Opens the real website in **Edit Mode**
- Hover any section to reveal edit controls
- Click text to edit inline — saves directly to Firestore
- Click images to replace — uploads to Firebase Storage instantly
- Add / delete / manage items in every section
- Changes appear live on the page in real-time
- Floating toolbar: Edit Mode toggle, Page navigation, Dashboard link

### Sections Supported (all editable)
| Section | Inline Edit | Image Upload | Add/Delete |
|---------|------------|--------------|------------|
| Hero | ✅ | ✅ (bg image) | — |
| Stats | ✅ | — | — |
| About | ✅ | ✅ | ✅ |
| Services | ✅ | — | ✅ |
| Benefits | ✅ | — | ✅ |
| Projects | ✅ | ✅ | ✅ |
| Testimonials | ✅ | — | ✅ |
| FAQ | ✅ | — | ✅ |
| Gallery | — | ✅ | ✅ |
| Blog | ✅ | ✅ | ✅ |
| Products | ✅ | ✅ | ✅ |
| Brands | ✅ | — | ✅ |

---

## 🚀 Setup

### 1. Clone and install
```bash
npm install
```

### 2. Configure Firebase
Copy `.env.example` to `.env` and fill in your Firebase credentials:
```bash
cp .env.example .env
```

### 3. Firebase Console Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password
3. Create a **Firestore Database** (production mode)
4. Create a **Storage bucket**
5. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules,storage:rules,firestore:indexes
   ```

### 4. Create Admin User
In Firebase Console → Authentication:
1. Add user with email/password
2. Copy the UID
3. Go to Firestore → create document: `admin_users/{uid}`
   ```json
   { "email": "admin@example.com", "role": "super_admin" }
   ```

### 5. Run development
```bash
npm run dev
```

### 6. Build for production
```bash
npm run build
```

---

## 🗺️ Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/admin` | **Visual Editor** — opens site in edit mode (requires login) |
| `/admin/login` | Admin login page |
| `/admin/panel` | Traditional dashboard |
| `/admin/panel/hero` | Hero section editor |
| `/admin/panel/products` | Products manager |
| `/admin/panel/blog` | Blog post editor |
| ... | All other content |

---

## 🏗️ Architecture

```
src/
├── components/
│   ├── visual-editor/         # The live CMS editor system
│   │   ├── admin-editor-toolbar.tsx   # Floating admin bar
│   │   ├── editable-section.tsx       # Section wrapper with overlays
│   │   ├── edit-modal.tsx             # Slide-in edit panel
│   │   ├── inline-image-editor.tsx    # Click-to-replace images
│   │   └── inline-text-editor.tsx     # Click-to-edit text
│   └── admin/                 # Traditional dashboard components
├── sections/                  # Homepage sections (all CMS-powered)
├── pages/                     # Route pages
├── firebase/                  # Firebase config, auth, storage, firestore
└── store/
    ├── visual-editor-context.tsx  # Edit mode state
    └── site-context.tsx           # Realtime site data
```

---

## 📁 Firebase Structure

See `FIRESTORE_STRUCTURE.md` for complete schema documentation.

---

## 🔒 Security
- Only admin users (in `admin_users` collection) see editor controls
- Visitors see clean website with zero admin UI visible
- Firestore rules enforce read/write permissions
- Storage rules enforce upload limits and auth

---

## 🛠 Tech Stack
- **React 18** + TypeScript + Vite
- **Firebase** (Firestore, Auth, Storage)
- **Tailwind CSS** + Framer Motion
- **React Hook Form** + Zod validation
- **Zustand** state management
