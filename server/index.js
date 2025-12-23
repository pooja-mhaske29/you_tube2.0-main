// Add this at the VERY TOP - must be first
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Debug: Check if env variables are loaded
console.log("DB_URL from env:", process.env.DB_URL);
console.log("PORT from env:", process.env.PORT);

// Connect to MongoDB
console.log("🔗 Attempting to connect to MongoDB...");

const DBURL = process.env.DB_URL || process.env.MONGODB_URI;

if (!DBURL) {
  console.warn("⚠️ WARNING: No MongoDB connection string found!");
  console.warn("Create a .env file with DB_URL or MONGODB_URI");
} else {
  console.log("MongoDB URL:", DBURL.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password
  
  mongoose.connect(DBURL)
  .then(() => {
    console.log("✅ MongoDB Connected to Atlas!");
    console.log("📊 Database:", mongoose.connection.db?.databaseName || "Connected");
    console.log("🎯 Host:", mongoose.connection.host);
  })
  .catch(err => {
    console.log("❌ MongoDB Connection Error:", err.message);
    console.log("💡 Tips:");
    console.log("1. Check your password in .env file");
    console.log("2. Check IP whitelist in MongoDB Atlas");
    console.log("3. Check if cluster is active");
  });
}

// Express middleware
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "You tube backend is working",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    status: "OK"
  });
});

app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);

// Test route to check database connection
app.get("/test-db", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        error: "Database not connected",
        status: mongoose.connection.readyState 
      });
    }
    
    // Try to list collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({
      message: "Database is working!",
      collections: collections.map(c => c.name),
      databaseName: mongoose.connection.db.databaseName,
      status: "OK"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Open: http://localhost:${PORT}`);
  console.log(`📊 Database status: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
  console.log(`📁 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/test-db`);
  console.log(`   GET  http://localhost:${PORT}/`);
});