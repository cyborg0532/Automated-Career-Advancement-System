# Deployment Guide - PIRATES CAS

## Overview
This application consists of two parts that need to be deployed separately:
1. **Backend** (Node.js/Express + MongoDB) - Deploy to Render/Railway/Heroku
2. **Frontend** (HTML/CSS/JS) - Deploy to Netlify/Vercel

---

## Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account

### 1.2 Deploy Backend
1. Push your code to GitHub
2. In Render dashboard, click **"New +"** → **"Web Service"**
3. Connect your repository
4. Render will auto-detect the `render.yaml` configuration
5. Set environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `HF_API_KEY`: Your Hugging Face API key (optional, for chatbot)
6. Click **"Create Web Service"**
7. Wait for deployment to complete
8. **Copy your backend URL** (e.g., `https://pirates-cas-backend.onrender.com`)

---

## Step 2: Update Frontend Configuration

### 2.1 Update API URL
1. Open `js/script.js`
2. Find line 5 (the API_BASE_URL configuration)
3. Replace `'https://your-backend-app.onrender.com/api'` with your actual backend URL
4. Example:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:3000/api'
       : 'https://pirates-cas-backend.onrender.com/api';  // ← Update this
   ```

---

## Step 3: Deploy Frontend to Netlify

### 3.1 Create Netlify Account
1. Go to [netlify.com](https://netlify.com) and sign up
2. Connect your GitHub account

### 3.2 Deploy Frontend
1. In Netlify dashboard, click **"Add new site"** → **"Import an existing project"**
2. Connect your repository
3. Configure build settings:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `/` (root directory)
4. Click **"Deploy site"**
5. Your site will be live at a URL like `https://your-site.netlify.app`

---

## Step 4: Test Your Deployment

1. Visit your Netlify URL
2. Try signing up with a new account
3. Verify login works
4. Check that the dashboard loads

---

## Troubleshooting

### Backend Issues
- **MongoDB connection fails**: Check your `MONGO_URI` is correct and MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- **Server crashes**: Check Render logs for error messages

### Frontend Issues
- **"Server error" on signup**: Verify the API_BASE_URL in `js/script.js` matches your Render backend URL
- **CORS errors**: The backend already has CORS enabled, but verify it's running

### Local Development
- Backend: `npm start` (runs on http://localhost:3000)
- Frontend: Open `index.html` in browser or use Live Server
- The app automatically detects localhost and uses local API

---

## Environment Variables Summary

### Backend (.env)
```
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secure_random_string_here
HF_API_KEY=your_hugging_face_api_key_optional
```

### Frontend (js/script.js)
Update the production URL after deploying backend:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://YOUR-BACKEND-URL.onrender.com/api';
```
