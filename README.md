# Quranic Insights Hub (wooniche) 📖✨

Welcome to **Quranic Insights Hub**, a high-performance, dynamic, and feature-rich Quran exploration platform built with cutting-edge web technologies. The web application is engineered to deliver a blazing-fast user experience combined with premium full-stack functionalities.

🌐 **Live Website:** [https://wooniche.com](https://wooniche.com)  
⚡ **Performance Score:** 99% - 100% (GTmetrix Grade A Performance)  
🛠️ **Tech Stack:** Bun, Vite, React, Tailwind CSS, Supabase (PostgreSQL), Vercel, and Cloudflare.

---

## 🚀 Key Features & Functionalities

### 1. Advanced Quran Explorer
*   **Word-by-Word Translation:** Deep exploration of individual Quranic words and meanings.
*   **Multi-Translation Support:** Toggle seamlessly between authentic translations, including Bengali (Islamic Foundation) and English (Pickthall).
*   **Scientific Annotations:** A dedicated section mapping scientific perspectives and explanations linked to specific Quranic verses.
*   **Visibility Toggles:** Dynamic UI switches to show or hide any translation or annotation block in real-time.
*   **Audio Recitations:** High-quality streaming audio player integrated directly for every verse.

### 2. Protected Admin Dashboard (`/auth`)
*   **Secure Authentication:** Row-Level Security (RLS) policies implemented via Supabase Auth to protect critical routes.
*   **Inline Translation Editor:** Admins can effortlessly update, refine, or edit Bengali and English translations via secure popup forms.
*   **Dynamic Global Settings:** Manage Cloudflare Turnstile API keys, dynamic notification email configurations, and Author profiles directly from the UI.
*   **Content Management System (CMS):** A dedicated administrative center to publish, edit, approve, or delete articles and user comments.

### 3. Interactive Blog & User Engagement
*   **Optimized Post Grid:** Beautiful 3-column post layout featuring consistent card heights, modern hover transitions, and category-based sorting.
*   **Smart Pagination:** High-speed server-side data fetching from Supabase limiting posts to 6/9 per page to ensure fast load times.
*   **Author Profile Box:** Modern single-post footer layouts highlighting dynamic author bios, profile avatars, and background overviews.
*   **Social & Email Sharing:** Native social sharing matrix supporting one-click shares across Facebook, WhatsApp, Twitter/X, and Email.
*   **Anti-Spam Comment Engine:** Public comment threads secured by Cloudflare Turnstile with an automated 'Pending Review' state awaiting Admin approval.

---

## 🛠️ Security & Architecture (Hardening)

The project architecture has been thoroughly optimized and audited for peak speed and security:
*   **Web Application Firewall (WAF):** Enhanced cloud security utilizing custom Cloudflare rules throttling malicious bot behavior and traffic.
*   **Enterprise SSL/TLS Layer:** Strict enforcement of HTTPS protocol via HSTS rules and Minimum TLS 1.2 constraints.
*   **AI Scraping Mitigation:** Fully optimized `robots.txt` configuration deployed on Cloudflare edge blocks automated LLM scraping bots from extracting data.

---

## 🗄️ Database Schema Overview (Supabase)

The core relational database is built over a clean PostgreSQL instance utilizing the following decoupled tables:
*   `public.user_roles`: Manages access permissions (Admin vs Regular User).
*   `public.verse_translations`: Houses precise ayah translations, lang strings, and scientific notes.
*   `public.articles`: Stores author posts, content bodies, and multilingual localization fields (`bn`/`en`).
*   `public.comments`: Holds user feedback tied directly to individual article IDs.
*   `public.bookmarks`: Secure internal bookmarking system scoped per user session ID.
*   `public.newsletter_subscribers`: Logs visitor emails for future mailing list campaigns.

---

## 🎨 Creative & Design Assets
*   **Custom Favicon:** Brand-specific `19.png` emblem customized and injected into the HTML root vector for clean browser identity.
*   **Minimalist UI:** Clean global language switchers and custom-styled icon matrices (Lucide React) keeping code footprints exceptionally light.

---
*Crafted with 💚 by Alam M*
