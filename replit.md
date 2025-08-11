# Adrielle Benhossi Psychology Website

## Overview
This project is a sophisticated, full-stack web application for Dr. Adrielle Benhossi, a psychologist, featuring a comprehensive admin dashboard and advanced content management system. The platform serves as a complete digital ecosystem for professional psychology practice, including patient testimonials, academic articles, service management, contact scheduling, marketing analytics, and advanced SEO optimization. The business vision encompasses professional credibility, client engagement, content publication, and robust digital marketing capabilities with tracking and analytics.

## User Preferences
**Communication Style:** Simple, everyday language.
**Code Documentation:** Comprehensive Portuguese comments explaining every line and functionality.
**Avatar Requirements:** Specific, differentiated designs matching testimonial descriptions.
**Admin Workflow:** Manual actions only - user-triggered actions (clicks, drags) should save immediately without automatic background updates or delays.
**Interface Behavior:** No automatic cache refreshes that cause "piscadas" or interface flickering during editing.
**Button Standardization:** All admin panel buttons use unified `btn-admin` CSS class with #0a0a0a background and white text for consistent design across 20+ components.
**Database Indexing:** System uses enableGoogleIndexing toggle in marketing_pixels configuration to control search engine visibility.
**SEO Implementation:** Dynamic robots meta tags and robots.txt generation based on admin panel settings.
**Mobile Optimization:** Drag-and-drop system disabled on mobile devices - only arrow buttons for reordering. Mobile uses touch-optimized interface with larger buttons and simplified controls.
**Button Responsiveness:** All "Salvar textos" buttons in admin forms are now fully responsive and centered on mobile devices with consistent styling.

## System Architecture
The application follows a full-stack monorepo architecture with clear separation between client and server.

**UI/UX Decisions:**
- Modern aesthetic with glassmorphism elements and gradient effects.
- Consistent typography, spacing, and responsive design with a mobile-first approach.
- Intuitive admin panel with categorized navigation, modern card layouts, and enhanced visual hierarchy.
- Dynamic color extraction from gradient configurations.
- Professional SVG icons, predefined favicons, and unified drag-and-drop system.
- Rich text editor with visual formatting and live preview.
- Modern testimonials design with horizontal layout.
- Enhanced marketing analytics with pixel tracking system and templates.
- Complete SEO and Open Graph meta tags system with real-time preview.
- Streamlined Open Graph image upload system with automatic upload and persistent preview.
- Improved section color manager with organized dropdown selector.
- Redesigned "About & Specialties" section with modern enhancements.
- Robust gallery color system with intelligent monitoring and automatic retry.
- Redesigned Admin Login with an elegant feminine aesthetic.
- Professional Journalistic Articles Section Design inspired by news portals, featuring main and secondary articles.
- Complete Journalistic Article Page Redesign with glassmorphism, sticky navigation, and Framer Motion animations.
- **Modern Articles Library Design**: Completely redesigned articles library page (Biblioteca Completa) with premium aesthetic, enhanced responsiveness, glassmorphism effects, and professional card layouts. Features sticky header, advanced filtering system, elegant loading states, and sophisticated empty states. Maintains all filtering/search functionality while elevating visual appeal.

**Technical Implementations:**
- **Frontend**: React with TypeScript and Vite.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM.
- **Styling**: Tailwind CSS with shadcn/ui components.
- **Deployment**: Production build with esbuild for server bundling, deployed on Fly.io with conditional imports to avoid Vite dependencies.
- **Cache Management**: Precise `setQueryData` updates instead of `invalidateQueries` to prevent UI flickering.
- **Performance Optimization**: Gzip/deflate compression, cache headers, optimized payload limits, intelligent client-side caching, memoization, and preloader.
- **Mobile-First Drag-and-Drop**: Optimized system where desktop supports full drag-and-drop with TouchSensor disabled, while mobile uses only arrow buttons for reordering. CSS optimizations prevent unnecessary touch events processing.

**Comprehensive Feature Specifications:**

**🎛️ Admin Dashboard (40+ Management Components):**
- **Complete Content Management**: 13 major content sections with granular controls
- **Marketing Digital Hub**: Integrated Custom Codes, Pixels (Facebook, Google), SEO with social previews
- **Visual Appearance Manager**: Section colors, gradients, icon selections, layout controls
- **Dynamic Section Control**: Redesigned aesthetic visibility interface with modern gradients, glassmorphism effects, elegant animations, and intuitive drag-and-drop reordering
- **Rich Text Editor**: Professional WYSIWYG editor with visual formatting and live preview
- **Image Management System**: Multi-format upload with WebP conversion, optimization, and cropping
- **Advanced Analytics**: Admin logs, access tracking, change monitoring with detailed reports

**🎨 Content & User Experience:**
- **Professional Articles System**: Academic publication management with categories, DOI, references
- **Smart Testimonials**: Automated carousel with manual interaction detection and permanent stop
- **Service Management**: Complete service portfolio with pricing, duration, and gradient theming
- **Specialties Showcase**: Psychology specialization areas with custom icons and descriptions
- **FAQ System**: Dynamic question-answer management with categorization
- **Photo Gallery**: Professional image carousel with text overlays and descriptions

**🔧 Technical Infrastructure:**
- **Advanced SEO System**: Server-side rendering, bot detection, dynamic robots.txt and meta tags
- **Marketing Pixel Integration**: Facebook Pixel, Google Analytics with privacy-compliant tracking
- **Email System**: Mailgun integration with multi-image attachments and anonymous messaging
- **Database Architecture**: 15+ PostgreSQL tables with comprehensive relationships and validation
- **Performance Optimization**: Intelligent caching, compression, mobile-first responsive design
- **Security Features**: Session management, admin authentication, IP tracking

**💬 Communication Systems:**
- **Secret Chat System**: Anonymous messaging at `/secret` with dual analytics (Clarity + Hotjar)
- **Contact Forms**: Multi-image support with attachment optimization and email integration
- **Support System**: Ticket management with file attachments and admin response tracking
- **Cookie Consent**: GDPR-compliant system with customizable messaging and positioning

**🔍 SEO & Marketing:**
- **Dynamic Meta Tags**: Real-time Open Graph configuration with social media previews
- **Custom Code Injection**: Header and body code management with ready-to-use templates
- **Indexing Control**: Admin toggle for Google/Bing indexing with robots.txt generation
- **Social Media Integration**: Facebook/WhatsApp and Twitter/X preview cards with mobile optimization
- **Analytics Integration**: Microsoft Clarity, Hotjar tracking with privacy controls

**📊 Monitoring & Logs:**
- **Dedicated Log Server**: Isolated access on port 5001 with password authentication
- **Admin Activity Tracking**: Comprehensive logging of administrative changes and access
- **Marketing Analytics**: Detailed tracking for digital marketing campaigns and user behavior
- **Performance Monitoring**: Client-side performance tracking with optimization suggestions

## External Dependencies
- **Frontend Core**: React, TypeScript, Vite, Wouter, TanStack Query.
- **Backend Core**: Express, Drizzle ORM, Neon Database.
- **UI & Styling**: Radix UI, Tailwind CSS, shadcn/ui, Lucide React, React Icons.
- **Animations**: Framer Motion.
- **Image Processing**: Multer, Sharp.
- **Deployment Utilities**: ESBuild, TypeScript compiler, Drizzle Kit.
- **Analytics**: Microsoft Clarity, Hotjar.
- **Email**: Mailgun.