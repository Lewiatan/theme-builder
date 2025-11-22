# E-commerce Theme Builder

A visual drag-and-drop theme builder that empowers non-technical shop owners to create and customize their online store appearance without writing any code.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
  - [Features Included in MVP](#features-included-in-mvp)
  - [Features Excluded from MVP](#features-excluded-from-mvp)
- [Project Status](#project-status)
- [License](#license)

## Overview

The E-commerce Theme Builder is a Minimum Viable Product (MVP) that solves a critical problem for small and medium-sized e-commerce business owners: creating professional-looking online stores without technical skills or hiring developers.

The application provides a fully visual environment where building pages is as simple as assembling blocks. Users can:

- Build pages using a library of 13 predefined, responsive components
- Customize content through an intuitive drag-and-drop interface
- Change global theme settings (colors, fonts) to match their brand
- Preview their store with mock product data before going live
- Manage multiple pages (Home, Catalog, Product, Contact) from a single workspace

### Target Users

Non-technical shop owners who need a simple, intuitive tool to independently manage their store's appearance and gain full control over their brand and customer experience.

### Key Highlights

- Visual drag-and-drop interface with vertical component stacking
- Component variants for flexible layouts (e.g., 1, 2, or 3-column text sections)
- Independent save mechanisms for page layouts and global theme settings
- Protection against losing unsaved changes with confirmation dialogs
- Live preview in the editor with separate Demo Store view for saved states
- Fully responsive design for mobile, tablet, and desktop devices

## Tech Stack

### Frontend

- **React 19** - Modern component-based architecture with improved performance
- **TypeScript** - Static type checking and enhanced IDE support
- **Vite** - Lightning-fast development server with Hot Module Replacement (HMR)
- **React Router 7** - Client-side routing for seamless navigation
- **Tailwind CSS 4** - Utility-first styling with excellent developer experience
- **dnd kit** - Modern, accessible drag-and-drop functionality

### Backend & Database

- **Supabase** - Comprehensive Backend-as-a-Service (BaaS) solution
  - PostgreSQL database with real-time capabilities
  - Built-in user authentication with Row Level Security (RLS)
  - JavaScript/TypeScript SDK
  - Open source and self-hostable

### Image Storage

- **Cloudflare R2** - S3-compatible object storage
  - Global CDN distribution for fast image delivery
  - Generous free tier (10GB storage, 1M operations/month)
  - Cost-effective alternative to traditional cloud storage

### Serverless Functions

- **Cloudflare Workers** - Edge computing platform
  - Generates secure presigned upload URLs
  - Sub-millisecond response times
  - Validates user authentication via Supabase JWT

### CI/CD & Hosting

- **GitHub Actions** - Automated testing, linting, and deployment pipelines
- **Cloudflare Pages** - Frontend hosting with automatic deployments
- **Vitest** - Unit testing framework (planned)
- **Playwright** - End-to-end testing (planned)

## Getting Started

### Prerequisites

- **Node.js**: v22.17.0 (managed via `.nvmrc`)
- **npm**: Comes with Node.js
- **Git**: For version control

If you're using [nvm](https://github.com/nvm-sh/nvm), simply run:

```bash
nvm use
```

### Installation

1. Clone the repository:

```bash
git clone git@github.com:Lewiatan/theme-builder.git
cd theme-builder
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the project root based on `.env.example` (if available) and configure:

- Supabase connection credentials
- Cloudflare R2 storage configuration
- Cloudflare Workers settings

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port specified by Vite).

## Available Scripts

- **`npm run dev`** - Start the development server with hot module replacement
- **`npm run build`** - Build the application for production
- **`npm run start`** - Serve the production build locally
- **`npm run typecheck`** - Run TypeScript type checking and generate React Router types

## Project Scope

### Features Included in MVP

- **Drag-and-Drop Interface**: Full drag-and-drop functionality for managing components on a page
- **Component Library**: 13 predefined components with variants and content editing options
- **Authentication**: User registration and login system with isolated user data
- **Page Management**: Automatic creation of 4 default pages (Home, Catalog, Product, Contact) with predefined layouts
- **Theme Customization**: Global color palette and font customization
- **Save & Reset**: Separate save mechanisms for page layouts and theme settings with reset functionality
- **Unsaved Changes Protection**: Warnings before leaving the editor with unsaved changes
- **Demo Store Preview**: Preview the saved store in a new tab with mock product data
- **Responsive Design**: All components display correctly on mobile, tablet, and desktop devices

### Features Excluded from MVP

The following features are planned for future releases but are not included in the MVP:

- "Forgot password" functionality
- Global media library
- Global Header and Footer components (currently page-specific)
- Undo/Redo functionality
- Auto-saving
- Custom component creation or structure modification
- Viewport switcher (desktop/tablet/mobile) in the editor
- Integration with real product database
- Server-Side Rendering (SSR)
- Template versioning

## Project Status

**Current Status**: 🚧 In Development (MVP Phase)

This project is currently in active development as a Minimum Viable Product. The primary goal is to create a functional MVP that will eventually become part of a future E-commerce SaaS platform.

### Success Metrics

**User-Centric Goal**: A new, non-technical user should be able to create, customize, and save a complete page within 20 minutes of their first registration.

**Technical Goals**:
- All 13 components fully functional with variant selection and content editing
- Reliable save and reset mechanisms
- Secure authentication system with proper session management
- Fully operational CI/CD pipeline
- Public deployment on Cloudflare Pages
- Responsive rendering across popular browsers and devices

## License

This project is private and proprietary. All rights reserved.
