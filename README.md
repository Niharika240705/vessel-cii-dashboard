# Vessel CII Compliance & Decarbonization Dashboard

An intelligent intelligence platform for tracking global fleet vessel CII (Carbon Intensity Indicator) compliance and decarbonization.

## 🚀 Live Demo
* **Stable Production URL** (always points to the latest update):  
  [https://vessel-cii-dashboard-niharikastar2005-7028s-projects.vercel.app](https://vessel-cii-dashboard-niharikastar2005-7028s-projects.vercel.app)
* **Latest Production Deployment**:  
  [https://vessel-cii-dashboard-9am8h9w9b-niharikastar2005-7028s-projects.vercel.app](https://vessel-cii-dashboard-9am8h9w9b-niharikastar2005-7028s-projects.vercel.app)

---

## 🛠️ Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   Create a `.env` or `.env.local` file in the root directory and configure your Supabase connection:
   ```env
   DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
   AUTH_SECRET="your-generated-secret-key"
   ```

3. Seed the database (to populate vessels, voyages, and charts):
   ```bash
   npx prisma db push
   DATABASE_URL="your-direct-connection-url-port-5432" npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
