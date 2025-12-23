const express = require("express");
const router = express.Router();

// Import category controller
const categoryController = require("../controller/category");

// Use category controller routes
router.use("/", categoryController);

module.exports = router;
