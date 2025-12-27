const express = require("express");
const ErrorHandler = require("./middleware/error");
const connectDatabase = require("./db/Database");
const app = express();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

// connect db
connectDatabase();

// Initialize default site settings
const initializeSiteSettings = async () => {
  try {
    const SiteSettings = require("./model/siteSettings");
    const existingSettings = await SiteSettings.findOne({ isActive: true });
    
    if (!existingSettings) {
      const defaultSettings = new SiteSettings({});
      await defaultSettings.save();
      console.log('✅ Default site settings initialized');
    }
  } catch (error) {
    console.error('❌ Error initializing site settings:', error.message);
  }
};

// Initialize settings after database connection
setTimeout(() => {
  initializeSiteSettings();
}, 2000);

// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory created:', uploadsDir);
}

// middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Enable CORS for all routes
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000","https://multi-vondor-e-shop-1.onrender.com","https://multi-vondor-e-shop-2.onrender.com","https://www.wanttar.in","http://72.60.103.18:3000","http://72.60.103.18", "https://72.60.103.18","https://samrudhigroup.in","https://www.samrudhigroup.in","https://samrudhigroup.in:8000","https://samrudhigroup.in:4000","https://wanttar.in"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token", "X-Requested-With", "X-Context"],
    exposedHeaders: ["set-cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 200
  })
);

// Handle preflight requests
app.options('*', cors());

app.use("/", express.static("uploads"));

app.get("/test", (req, res) => {
  res.send("Hello World!");
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// routes
const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const event = require("./controller/event");
const coupon = require("./controller/coupounCode");
const payment = require("./controller/payment");
const order = require("./controller/order");
const message = require("./controller/message");
const conversation = require("./controller/conversation");
const withdraw = require("./controller/withdraw");
const newsletter = require("./controller/newsletter");
const notification = require("./controller/notification");
const pincode = require("./routes/pincode");
const shipping = require("./routes/shipping");
const aiChat = require("./routes/ai-chat");
const banner = require("./controller/banner");
const category = require("./routes/category");
const migration = require("./routes/migration");
const review = require("./routes/review");
const legalPage = require("./controller/legalPage");
const siteSettings = require("./controller/siteSettings");
const faq = require("./controller/faq");
const phonePePayment = require("./routes/phonePePayment");
const videoBanner = require("./routes/videoBanner");
const videoCall = require("./routes/videoCall");
const subscription = require("./controller/subscription");
const commission = require("./controller/commission");

// endpoints
app.use("/api/v2/user", user);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/message", message);
app.use("/api/v2/order", order);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/payment/phonepe", phonePePayment);
app.use("/api/v2/withdraw", withdraw);
app.use("/api/v2/newsletter", newsletter);
app.use("/api/v2/notification", notification);
app.use("/api/v2/pincode", pincode);
app.use("/api/v2/shipping", shipping);
app.use("/api/v2/ai-chat", aiChat);
app.use("/api/v2/banner", banner);
app.use("/api/v2/category", category);
app.use("/api/v2/migration", migration);
app.use("/api/v2/review", review);
app.use("/api/v2/legal-page", legalPage);
app.use("/api/v2/site-settings", siteSettings);
app.use("/api/v2/faq", faq);
app.use("/api/v2/video-banner", videoBanner);
app.use("/api/v2/video-call", videoCall);
app.use("/api/v2/subscription", subscription);
app.use("/api/v2/commission", commission);

// error handler middleware
app.use(ErrorHandler);

// create server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// Handling Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`shutting down the server for handling UNCAUGHT EXCEPTION! 💥`);
});

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down the server for ${err.message}`);
  console.log(`shutting down the server for unhandle promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
