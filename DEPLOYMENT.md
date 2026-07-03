# Scale-Ready Enterprise Deployment & Architecture Guide (10K+ Active Users)

This document details the production architecture, security configurations, and hosting instructions for deploying this recruitment platform. It is designed to handle **10,000+ active concurrent users** safely, with complete separation of Concerns: **Frontend** and **Backend** deployed on isolated scalable infrastructures.

---

## 1. Core Architectural Overview

For a professional, enterprise-grade deployment, we completely decouple the static frontend user interface from the dynamic backend application program interface (API).

```
                      +-----------------------------------+
                      |      Global Edge CDN (Vercel)     | <--- Low Latency, 0ms Cold Start
                      |          Static Frontend          |
                      +-----------------------------------+
                                        |
                             HTTPS API Requests (JSON)
                                        v
                      +-----------------------------------+
                      |   Cloud API Gateway / Load Balancer| <--- Rate Limiting & SSL Termination
                      +-----------------------------------+
                                        |
                                        v
                      +-----------------------------------+
                      |  Auto-scaling Containers (Cloud Run)| <--- Backend API Node Pool
                      +-----------------------------------+
                                        |
                                  Connection Pool
                                        v
                      +-----------------------------------+
                      |   Managed Database (Supabase PG)  | <--- PgBouncer Pool, Auto-Indexed
                      +-----------------------------------+
```

---

## 2. Separate Hosting Strategy

### 🌐 A. Frontend (Statically Optimized Client SPA)
The client application lives in the `/src` folder. It should be built into raw, lightweight optimized static assets (HTML, CSS, JS) and hosted on a **Global Content Delivery Network (CDN)**.

*   **Recommended Hosting Providers:** Vercel, Netlify, Cloudflare Pages, or AWS S3 paired with CloudFront CDN.
*   **Why?** Static hosting has virtually infinite scale, 0ms cold starts, and absolute edge protection. It ensures that 10,000+ concurrent visitors downloading the web page will experience sub-100ms load times without placing any burden on your database or backend servers.
*   **Build Pipeline Command:**
    ```bash
    npm run build
    ```
    *This generates the production bundle inside the `/dist` directory, ready for deployment.*
*   **Environment Variable Configuration:**
    *   Create a `.env.production` file for the frontend:
        ```env
        VITE_API_BASE_URL=https://api.yourdomain.com
        ```

### ⚙️ B. Backend (Containerized Scalable Express API)
The server logic lives in the `/server` folder. It runs on a Node.js engine and connects directly to Gemini AI and Supabase PostgreSQL.

*   **Recommended Hosting Providers:** Google Cloud Run, AWS ECS/Fargate, Render (Web Service), or DigitalOcean App Platform.
*   **Why?** These platform-as-a-service (PaaS) engines support **Horizontal Auto-scaling**. When user traffic increases, they dynamically spin up new container instances (e.g., scaling from 2 containers to 20 containers) based on CPU/RAM usage, and scale back down during quiet periods to save on hosting costs.
*   **Production Launch Command:**
    ```bash
    npm run build && npm run start
    ```
*   **Containerization (Docker):**
    A standard professional `Dockerfile` is provided in this project to bundle the Node backend as an isolated microservice container.

---

## 3. High-Load Scalability Plan (10K+ Concurrent Users)

To successfully handle a 10,000+ active user base without latency spikes or application crashes, implement the following operational standards:

### 🗄️ A. Database Connection Pooling (Critical)
10,000 active users can quickly exhaust your database connection limits (standard PostgreSQL limits are typically 100-500 connections).
*   **Implementation:** Use **PgBouncer** or Supabase's built-in **Transaction Connection Pooler** (typically on port `6543`).
*   **Configuration:** Instead of connecting directly to the Postgres port, update your database connection URI on your server environment variables to point to the pooled transaction endpoint. This reuses database connection handles dynamically, enabling a database configured for 100 maximum connections to comfortably serve tens of thousands of concurrent client queries.

### 🛡️ B. Advanced Caching (Redis)
Avoid querying the database or hitting heavy API routes (like Gemini AI parsing) repeatedly for identical requests:
*   **Job Listings Cache:** Cache the list of active jobs in an in-memory **Redis** cluster. Revalidate the cache only when recruiters post or delete jobs.
*   **Session State:** Maintain stateless API instances. Never store user authentication states in server memory. Use JSON Web Tokens (JWT) or session tables stored securely inside Supabase.

### 📈 C. CDN Edge Caching
Cache unchanging public API endpoints directly at the CDN Edge (using `Cache-Control: public, max-age=3600`) so requests do not even need to travel to your backend servers.

---

## 4. Production Security Protocol

To protect user data and maintain complete compliance, our backend has been pre-configured with several industry-standard security features:

### 🔒 A. Strict CORS (Cross-Origin Resource Sharing)
Restricts client-side access to your backend API to protect against malicious script injections from unauthorized domains.
*   **Configured:** Yes. In `/server/index.ts`, CORS is locked down to specific trusted domains specified in the `ALLOWED_ORIGINS` variable.
*   **Environment Setup:**
    ```env
    ALLOWED_ORIGINS=https://app.yourdomain.com
    ```

### 🚦 B. Smart API Rate Limiting
Prevents API scraping, server overloading, and brute-force/spam attacks.
*   **Configured:** Yes. 
    1.  **Global Limiter:** Limits general API requests to **150 requests per minute** per IP address.
    2.  **Auth Limiter:** Strict security applied to all OTP dispatches, login validations, and password resets to **15 requests per 15 minutes** per IP. This mitigates automated SMTP spam and brute-forcing.

### 🔐 C. HTTPS & SSL Enforcement
*   **SSL Termination:** Handle SSL/TLS certificates at your load balancer or Cloud CDN layer.
*   **Transport Security:** Ensure all API endpoints communicate exclusively over `https://`. Never transmit raw authentication tokens over unencrypted channels.

### 📧 D. SMTP Production Delivery
*   Our system features a dual delivery mechanism. While in developer preview it utilizes the **Ethereal Mail Developer Sandbox** for zero-setup previews, in production you should configure an enterprise SMTP service (e.g., SendGrid, Mailgun, Amazon SES, or Resend) in your environment variables:
    ```env
    SMTP_HOST=smtp.sendgrid.net
    SMTP_PORT=587
    SMTP_USER=apikey
    SMTP_PASS=your_production_secure_api_key
    SENDER_EMAIL=noreply@yourdomain.com
    ```

---

## 5. Step-by-Step Production Hosting Guide

### Step 1: Set up the Database (Supabase)
1.  Create a free/pro account on [Supabase](https://supabase.com).
2.  Launch a new PostgreSQL database.
3.  Navigate to the **SQL Editor** in Supabase and copy the optimized schema generated in the admin developer panel of your app. Run the script to initialize tables for `profiles`, `jobs`, and `applications` with appropriate performance indexes.
4.  Retrieve your database connection credentials from Settings -> Database.

### Step 2: Deploy the Backend API (e.g., Google Cloud Run)
1.  Verify the backend build configuration runs successfully.
2.  Deploy using your CLI or connect your GitHub repository directly to a PaaS service like **Render** or **Google Cloud Run**.
3.  Configure your environment variables in the Cloud console:
    ```env
    NODE_ENV=production
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_ANON_KEY=your-secure-anon-key
    GEMINI_API_KEY=your-gemini-ai-api-key
    SMTP_HOST=smtp.sendgrid.net
    SMTP_PORT=587
    SMTP_USER=apikey
    SMTP_PASS=your-smtp-pass
    SENDER_EMAIL=hiring@yourdomain.com
    ALLOWED_ORIGINS=https://yourfrontend.vercel.app
    ```

### Step 3: Deploy the Frontend SPA (e.g., Vercel)
1.  Import your repository into [Vercel](https://vercel.com).
2.  Set the Framework Preset to **Vite**.
3.  Add the following Frontend Environment Variable:
    *   `VITE_API_BASE_URL`: Set to the live HTTPS URL of your deployed backend API (e.g., `https://api-service-abcde-uc.a.run.app`).
4.  Click **Deploy**. Your scalable, secure recruitment platform is live globally!
