import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import session from "express-session";

dotenv.config();

const sessionConfig = session({
  secret: process.env.SESSION_SECRET || "your_secret_key", // ✅ Ensure a strong secret
  resave: false,
  saveUninitialized: false, // ✅ Prevent storing empty sessions
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI, // ✅ Use the correct MongoDB URI
    collectionName: "sessions",
    autoRemove: "interval", // ✅ Ensures periodic cleanup
    autoRemoveInterval: 10, // Remove expired sessions every 10 minutes
    ttl: 2 * 60 * 60, // ✅ Set session TTL (2 hours)
    crypto: {
      secret: process.env.SESSION_SECRET, // ✅ Encrypt session data
    },
  }),
  cookie: {
    httpOnly: true, // ✅ Prevent XSS
    secure: false, // ✅ Required for mobile apps (React Native)
    sameSite: "none", // ✅ Required for cross-domain authentication
    maxAge: 2 * 60 * 60 * 1000, // ✅ 2 hours session expiration
  },
});

export default sessionConfig;
