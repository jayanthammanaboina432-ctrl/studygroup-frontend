# Deployment Guide - Study Group Frontend

This guide explains how to deploy the React frontend to Render.

## Prerequisites

1. GitHub account
2. Render account (sign up at https://render.com)
3. Your repository pushed to GitHub

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Add deployment files for Render"
git push origin main
```

## Step 2: Create a Render Web Service

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"New"** > **"Web Service"**
3. Select **"Deploy an existing repository"**
4. Search for and select your `studygroup-frontend` repository
5. Click **"Connect"**

## Step 3: Configure the Deployment

Fill in the following settings:

- **Name**: `studygroup-frontend`
- **Environment**: `Docker`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Dockerfile Path**: `./Dockerfile` (default)
- **Plan**: Free

## Step 4: Add Environment Variables

Click **"Advanced"** and add:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://studygroup-backend-hgvm.onrender.com` |
| `CI` | `false` |

## Step 5: Deploy

Click **"Create Web Service"**

Render will:
1. Build the Docker image
2. Install dependencies
3. Build the React app
4. Deploy it

The deployment takes 2-3 minutes. You'll see the status in the dashboard.

## Step 6: Update CORS (Backend)

Make sure your backend allows requests from your Render frontend URL. Update `application.properties`:

```properties
# CORS Configuration
spring.mvc.cors.allowed-origins=https://studygroup-frontend-xxx.onrender.com
spring.mvc.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.mvc.cors.allowed-headers=*
spring.mvc.cors.allow-credentials=true
```

Replace `studygroup-frontend-xxx` with your actual Render URL.

## Step 7: Access Your App

Once deployed, your frontend will be available at:
```
https://studygroup-frontend-xxx.onrender.com
```

## Local Development

For local development, create a `.env` file:

```
REACT_APP_API_URL=http://localhost:8080
```

Then start the app:

```bash
npm install
npm start
```

## Troubleshooting

- **Build fails**: Check the build logs in Render dashboard
- **API calls fail**: Verify `REACT_APP_API_URL` is correct and backend CORS is configured
- **Import errors**: Make sure all dependencies are installed
- **Port issues**: The app runs on port 3000 by default

## Rebuild/Redeploy

To redeploy:
1. Make changes locally
2. Commit and push to GitHub
3. Render will auto-redeploy (if auto-deploy is enabled)

Or manually click **"Manual Deploy"** in the Render dashboard.
