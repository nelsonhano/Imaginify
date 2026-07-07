# Imaginify - AI-Powered Image Manipulation SaaS

Imaginify is a premium software-as-a-service (SaaS) web application built using Next.js 15, TypeScript, Tailwind CSS, MongoDB, Mongoose, Clerk, Cloudinary, and Stripe. It empowers users to easily perform advanced, AI-driven image transformations such as background removal, generative filling, object recoloring, object removal, and image restoration—all controlled under a secure, credit-based billing system.

---

## 🚀 Features

- **AI Image Restoration**: Automatically refine and improve photo quality by removing noise and imperfections.
- **Generative Fill (Outpainting)**: Scale and extend an image beyond its original boundaries seamlessly using AI outpainting.
- **Object Removal**: Cleanly eliminate unwanted elements or objects from photos.
- **Object Recoloring**: Easily isolate specific objects within an image and change their colors.
- **Background Removal**: Extract subjects from images with high precision.
- **Secure Authentication**: Managed via [Clerk](https://clerk.com/) with complete user lifecycle synchronization.
- **Monetization & Credit Purchases**: Secure payment processing with [Stripe](https://stripe.com/) checkout to purchase credit packages.
- **Credits Management**: Credit-based usage logic where operations deduct credits, and purchases add credits.
- **Search & Pagination**: Find transformed images quickly with title-based queries and clean pagination controls.
- **Download Center**: Instantly download transformed images directly from Cloudinary.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Database**: MongoDB (via Mongoose ODM)
- **Auth**: Clerk (Next.js SDK)
- **Media Engine**: Cloudinary AI (Next-Cloudinary)
- **Payments**: Stripe SDK
- **Forms**: React Hook Form, Zod (Validation)

---

## 📁 Project Structure

```
├── constants/             # App configuration, navigation, and credit plans
├── public/                # Static assets, icons, and illustrations
├── src/
│   ├── app/               # Next.js pages, layouts, and API routes
│   │   ├── (auth)/        # Auth group pages (Sign-in / Sign-up)
│   │   ├── (root)/        # Main app pages (Home, Credits, Profile, Transformations)
│   │   └── api/           # Webhook endpoints (Clerk & Stripe)
│   ├── components/        # UI components
│   │   ├── shared/        # Core business components (MediaUploader, Sidebar, Checkout)
│   │   └── ui/            # Shadcn atomic components
│   ├── lib/               # Utilities, database connection, and Server Actions
│   │   ├── actions/       # Server Actions (image.action, user.actions, transaction.action)
│   │   ├── database/      # Database models (User, Image, Transaction) & Mongoose client
│   │   └── utils.ts       # Shared helper functions
│   └── middleware.ts      # Clerk authentication protection configuration
├── tsconfig.json          # TypeScript configurations
└── tailwind.config.ts     # Tailwind configuration
```

---

## 🗄️ Database Architecture

Imaginify utilizes **MongoDB** structured with **Mongoose**. Below are the core collections:

### 👤 User Collection
Stores account info synced from Clerk and keeps track of user plan credits.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `clerkId` | `String` | Yes | Unique ID from Clerk authentication |
| `email` | `String` | Yes | Unique email address |
| `username` | `String` | Yes | Unique profile username |
| `photo` | `String` | Yes | URL link to user profile photo |
| `firstName` | `String` | No | User's first name |
| `lastName` | `String` | No | User's last name |
| `planId` | `Number` | Yes (Default: `1`) | Active credit plan ID |
| `creditBalance`| `Number` | Yes (Default: `10`) | Current available credit balance |

### 🖼️ Image Collection
Stores uploaded images and their active Cloudinary transformation configurations.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | `String` | Yes | Human-readable title of the image |
| `transformationType` | `String` | Yes | Type of transform applied (e.g., `fill`, `recolor`) |
| `publicId` | `String` | Yes | Cloudinary public asset ID |
| `secureURL` | `String` | Yes | Secure URL of the original image |
| `width` | `Number` | No | Original width of the image |
| `height` | `Number` | No | Original height of the image |
| `config` | `Object` | No | Cloudinary transformation config details |
| `transformationUrl` | `String` | No | Final transformed asset URL |
| `aspectRatio` | `String` | No | Configured aspect ratio for outpainting |
| `color` | `String` | No | Target replacement color |
| `prompt` | `String` | No | AI description prompt (e.g., object to remove) |
| `creator` | `ObjectId` | Yes | Reference link to the creator `User` document |

### 💳 Transaction Collection
Logs Stripe payment purchases.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `stripeId` | `String` | Yes | Stripe Payment/Session transaction ID |
| `amount` | `Number` | Yes | Currency amount paid |
| `plan` | `String` | No | Purchased plan package name |
| `credits` | `Number` | No | Amount of credits granted by purchase |
| `buyer` | `ObjectId` | Yes | Reference link to the buyer `User` document |
| `createdAt` | `Date` | Yes (Default: `now`) | Purchase timestamp |

---

## ⚙️ Environment Configuration

To run this project locally, create a `.env.local` or `.env` file in the root folder and add the following keys:

```env
# Clerk Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Clerk Webhook Secret (for svix webhooks integration)
WEBHOOK_SECRET=your_clerk_webhook_secret

# MongoDB Connection
MONGODB_URL=your_mongodb_connection_uri

# Cloudinary Integration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_CLOUDINARY_CLOUD_KEY=your_cloudinary_api_key
NEXT_CLOUDINARY_CLOUD_SECRETE=your_cloudinary_api_secret
NEXT_CLOUDINARY_CLOUD_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name

# Stripe Payment Integration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Server Environment URL
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

---

## 🛠️ Getting Started & Installation

### Prerequisites
Make sure you have Node.js installed on your machine.

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd imagnify
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Up Webhook Forwarding (optional but recommended for local testing):**
   Use tools like Ngrok or the Stripe CLI to forward webhooks to your local machine:
   - For Clerk webhooks: Point to `http://localhost:3000/api/webhooks/clerk`
   - For Stripe webhooks: Point to `http://localhost:3000/api/webhooks/stripe`

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 💳 Credit Plans

The app offers three pre-defined credit models:
1. **Free Plan** - $0 (20 credits, basic features access)
2. **Pro Package** - $40 (120 credits, full features, priority support)
3. **Premium Package** - $199 (2000 credits, full features, priority support, priority updates)

Each image transformation operation deducts **1 credit** from the user's account balance.
