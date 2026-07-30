# 🚀 Deployment Guide — Pathology Lab CRM

This guide walks you through deploying the **frontend on Vercel** and the **backend on Render** using Docker.

---

## Architecture Overview

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│   Vercel      │  API    │   Render          │  DB     │  MongoDB     │
│   (Frontend)  │ ──────► │   (Backend/Docker)│ ──────► │  Atlas       │
│   React+Vite  │ WS/HTTP │   Node.js+Express │         │  (Cloud)     │
└──────────────┘         └──────────────────┘         └──────────────┘
```

---

## Prerequisites

Before you start, make sure you have:

- [x] A **GitHub** account (with this repo pushed)
- [x] A **Vercel** account — [Sign up free](https://vercel.com)
- [x] A **Render** account — [Sign up free](https://render.com)
- [x] A **MongoDB Atlas** cluster — [Create free](https://www.mongodb.com/cloud/atlas/register)
- [x] Your `MONGODB_URI` connection string from Atlas

> **⚠️ Important:** Your `.gitignore` currently ignores `package-lock.json`. You **must** commit `package-lock.json` files for both `client/` and `server/` for deployment to work. Remove `package-lock.json` from your `.gitignore` before pushing.

---

## Step 1: Set Up MongoDB Atlas (Database)

If you don't already have a MongoDB Atlas cluster:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **free M0 cluster**
3. Under **Database Access**, create a database user with a password
4. Under **Network Access**, add `0.0.0.0/0` to allow connections from anywhere (required for Render)
5. Click **Connect** → **Connect your application** → Copy the connection string
6. Replace `<password>` with your database user's password

Your `MONGODB_URI` will look like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pathology-crm?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend on Render (Docker)

### 2.1 Push to GitHub

Make sure your code is pushed to GitHub:

```bash
# Remove package-lock.json from gitignore first (see note above)
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2 Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your **GitHub repository**
4. Configure the service:

| Setting            | Value                              |
| ------------------ | ---------------------------------- |
| **Name**           | `pathology-crm-api`               |
| **Region**         | Choose closest to your users       |
| **Root Directory** | `server`                           |
| **Runtime**        | `Docker`                           |
| **Instance Type**  | `Free` (or `Starter` for production)|

> Render will automatically detect the `Dockerfile` in the `server/` directory.

### 2.3 Add Environment Variables

In the Render service settings, go to **Environment** and add these variables:

| Key                     | Value                                           |
| ----------------------- | ----------------------------------------------- |
| `MONGODB_URI`           | `mongodb+srv://...` (your Atlas connection URI) |
| `JWT_SECRET`            | A strong random string (32+ characters)         |
| `PORT`                  | `5000`                                          |
| `FRONTEND_URL`          | `https://your-app.vercel.app` *(add after Vercel deploy)* |
| `BACKEND_URL`           | `https://pathology-crm-api.onrender.com` *(your Render URL)* |
| `RAZORPAY_KEY_ID`       | Your Razorpay key *(if using payments)*         |
| `RAZORPAY_KEY_SECRET`   | Your Razorpay secret *(if using payments)*      |
| `NODE_ENV`              | `production`                                    |

> 💡 **Generate a strong JWT_SECRET:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 2.4 Deploy

Click **Create Web Service**. Render will:
1. Pull your code from GitHub
2. Build the Docker image using `server/Dockerfile`
3. Start the container
4. Assign a URL like `https://pathology-crm-api.onrender.com`

### 2.5 Verify Backend

Once deployed, test the health check:

```bash
curl https://pathology-crm-api.onrender.com/api/health
# Should return: {"status":"OK"}
```

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Import Project on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your **GitHub repository**
4. Configure the project:

| Setting                | Value              |
| ---------------------- | ------------------ |
| **Framework Preset**   | `Vite`             |
| **Root Directory**     | `client`           |
| **Build Command**      | `npm run build`    |
| **Output Directory**   | `dist`             |
| **Install Command**    | `npm install`      |

### 3.2 Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Key               | Value                                              |
| ----------------- | -------------------------------------------------- |
| `VITE_API_URL`    | `https://pathology-crm-api.onrender.com`           |
| `VITE_SOCKET_URL` | `https://pathology-crm-api.onrender.com`           |

> ⚠️ Replace with your **actual Render backend URL** from Step 2.4.

### 3.3 Deploy

Click **Deploy**. Vercel will:
1. Install dependencies
2. Run `npm run build` (Vite production build)
3. Deploy the static `dist/` output to the CDN
4. Assign a URL like `https://your-app.vercel.app`

### 3.4 Update Backend CORS

After getting your Vercel URL, go back to **Render Dashboard** → your service → **Environment** and update:

```
FRONTEND_URL=https://your-app.vercel.app
```

This ensures Socket.IO CORS allows connections from your frontend.

---

## Step 4: Seed the Database (Optional)

If you need to populate the production database with initial data:

```bash
# Run locally with your production MONGODB_URI
cd server
MONGODB_URI="mongodb+srv://..." node scripts/seed.js
```

Or use Render's **Shell** feature:
1. Go to your Render service → **Shell**
2. Run: `node scripts/seed.js`

---

## Step 5: Custom Domain (Optional)

### Vercel (Frontend)
1. Go to Vercel project → **Settings** → **Domains**
2. Add your custom domain (e.g., `app.yourdomain.com`)
3. Update DNS records as instructed by Vercel

### Render (Backend)
1. Go to Render service → **Settings** → **Custom Domains**
2. Add your API domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed by Render

After adding custom domains, update environment variables:

| Service | Variable         | New Value                        |
| ------- | ---------------- | -------------------------------- |
| Render  | `FRONTEND_URL`   | `https://app.yourdomain.com`     |
| Render  | `BACKEND_URL`    | `https://api.yourdomain.com`     |
| Vercel  | `VITE_API_URL`   | `https://api.yourdomain.com`     |
| Vercel  | `VITE_SOCKET_URL`| `https://api.yourdomain.com`     |

---

## Troubleshooting

### Backend won't start on Render
- Check **Logs** in Render dashboard for error details
- Verify `MONGODB_URI` is correct and Atlas network allows `0.0.0.0/0`
- Ensure `PORT` env variable is set

### Frontend shows "Network Error"
- Verify `VITE_API_URL` points to the correct Render URL
- Check that backend is running (hit `/api/health`)
- Redeploy frontend after changing environment variables (Vite bakes env vars at build time)

### WebSocket/Socket.IO not connecting
- Ensure `FRONTEND_URL` on Render matches your Vercel URL exactly (including `https://`)
- Check browser console for CORS errors
- Render free tier may sleep after 15 minutes of inactivity — first request will be slow

### 404 on page refresh (Vercel)
- The `vercel.json` file in `client/` handles SPA routing — make sure it's committed
- If still broken, check Vercel project settings → **Rewrites**

### Render free tier cold starts
- Free tier services spin down after 15 min of inactivity
- First request after sleep takes ~30-60 seconds
- Upgrade to **Starter** ($7/month) for always-on service

---

## File Reference

| File                       | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `server/Dockerfile`        | Docker build config for backend on Render            |
| `server/.dockerignore`     | Files excluded from Docker build context             |
| `client/vercel.json`       | Vercel SPA routing rewrites                          |
| `server/.env.example`      | Template for backend environment variables           |
| `client/.env.production`   | Template for frontend production env (Vite)          |

---

## Quick Reference URLs

After deployment, your URLs will be:

| Service        | URL                                                |
| -------------- | -------------------------------------------------- |
| **Frontend**   | `https://your-app.vercel.app`                      |
| **Backend API**| `https://pathology-crm-api.onrender.com`           |
| **Health Check**| `https://pathology-crm-api.onrender.com/api/health`|
| **MongoDB**    | MongoDB Atlas Dashboard                             |

---

> 💡 **Pro tip:** Set up **auto-deploy** on both Vercel and Render by connecting your GitHub repo. Every push to `main` will trigger a new deployment automatically.
