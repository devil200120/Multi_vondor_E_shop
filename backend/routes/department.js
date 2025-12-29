const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { upload } = require("../multer");
const departmentController = require("../controller/department");

// Public routes
router.get("/all", departmentController.getAllDepartments);
router.get("/homepage", departmentController.getHomepageDepartments);
router.get("/mall-map", departmentController.getMallMap);
router.get("/:id", departmentController.getDepartment);

// Admin routes
router.post(
  "/admin/create",
  isAuthenticated,
  isAdmin("Admin"),
  upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
  departmentController.createDepartment
);

router.put(
  "/admin/update/:id",
  isAuthenticated,
  isAdmin("Admin"),
  upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
  departmentController.updateDepartment
);

router.delete(
  "/admin/delete/:id",
  isAuthenticated,
  isAdmin("Admin"),
  departmentController.deleteDepartment
);

router.post(
  "/admin/reorder",
  isAuthenticated,
  isAdmin("Admin"),
  departmentController.reorderDepartments
);

module.exports = router;
