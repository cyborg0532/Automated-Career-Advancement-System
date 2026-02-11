# Automated Career Advancement System (PIRATES CAS)

This is a full-stack automated career advancement system that features user management, profile tracking, and an AI-powered chatbot assistant.

## Features
- **Authentication**: Secure Signup and Login using JWT.
- **Profile Management**: Track academic details and career progression.
- **Dashboard**: Visualize performance data with charts.
- **Chatbot**: AI assistant powered by Hugging Face models.

## Pre-requisites
- **Node.js** (v14 or higher)
- **MongoDB** (Must be running locally on port 27017)

## Installation

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     PORT=3000
     MONGO_URI=mongodb://localhost:27017/carrier_advancement_system
     JWT_SECRET=your_jwt_secret
     HF_API_KEY=your_hugging_face_api_key
     ```

## Running the Application

### Option 1: Standard Start
```bash
npm start
```

### Option 2: Windows PowerShell Fix (If `npm start` fails)
If you encounter a PSSecurityException or "running scripts is disabled" error, run the server directly using Node:
```bash
node server.js
```
OR
```bash
cmd /c npm start
```

## Verify Installation
Run the built-in verification script to test all backend APIs:
```bash
node check_api.js
```
