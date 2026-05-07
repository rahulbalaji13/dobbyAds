# Nested Folder System - Full Stack Application

This is a Google Drive-like application allowing users to sign up, create nested folders, upload images, and compute the total recursive size of folders.

## Tech Stack
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Frontend:** React.js (Vite), Context API, Axios
- **Storage:** Local file system via `multer`

## Setup Instructions

### Backend
1. Navigate to the `backend` folder.
2. Ensure you have Node.js and MongoDB installed locally.
3. Run `npm install` to install dependencies.
4. Copy `.env.example` to `.env` (or configure the existing `.env`).
   - `PORT=5000`
   - `MONGODB_URI=mongodb://localhost:27017/folder-system`
   - `JWT_SECRET=your_jwt_secret`
5. Run `npm run dev` to start the server.

### Frontend
1. Navigate to the `frontend` folder.
2. Run `npm install` to install dependencies.
3. Start the dev server with `npm run dev`.
4. Open the application in your browser (usually `http://localhost:5173`).

---

## Deployment Guide

### Backend Deployment (Render / Railway / VPS)
1. Ensure your code is pushed to a GitHub repository.
2. **On Render/Railway:** Create a new Web Service and link your repository.
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Environment Variables:** Set `MONGODB_URI` (use MongoDB Atlas URL), `JWT_SECRET`, and `PORT`.
6. *Note on File Storage:* Since `multer` uses local storage, any files uploaded will be lost upon server restart on ephemeral platforms like Render. For a production deployment, replace `multer.diskStorage` with `multer-s3` and an AWS S3 bucket.

### Frontend Deployment (Vercel / Netlify)
1. **On Vercel/Netlify:** Create a new site and link the GitHub repository.
2. Select the `frontend` directory as the Root Directory.
3. **Build Command:** `npm run build`
4. **Publish Directory:** `dist`
5. *Important:* Update the `API_URL` in `src/pages/Dashboard.jsx` and `src/context/AuthContext.jsx` to point to your deployed backend URL.

---

## Advanced Considerations

### Performance Optimizations
1. **Caching Folder Size:** Calculating recursive folder size can become expensive. Instead of calculating it on-the-fly via `$graphLookup`, a `totalSize` property can be maintained on each Folder document. Whenever a file is uploaded or deleted, the backend can increment/decrement the `totalSize` of the immediate parent and propagate this change upwards to the root folder asynchronously.
2. **Indexing in MongoDB:** Ensure indexes are created on `user` and `parent` fields in the `Folder` and `File` collections to optimize query performance when traversing the tree.
   - `Folder.collection.createIndex({ user: 1, parent: 1 })`
   - `File.collection.createIndex({ user: 1, folder: 1 })`

### Scaling the System
- **Microservices:** Extract the File Upload logic into a dedicated service.
- **CDN:** Serve user uploaded images through a Content Delivery Network (CDN) like AWS CloudFront for faster load times globally.
- **Database Sharding:** If folder trees grow massively, MongoDB sharding by user ID or using a dedicated Graph Database (like Neo4j) for folder hierarchies could provide better scaling characteristics.

---

## Bonus: MCP Integration
The backend contains a `src/utils/mcpTools.json` and `src/utils/mcpTools.js` showing how Model Context Protocol tools are structured. This allows an AI agent to execute functions like `createFolder` and `uploadImage` automatically based on natural language queries from the user.
