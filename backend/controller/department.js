const Department = require("../model/department");
const Category = require("../model/category");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

// Create department (Admin only)
exports.createDepartment = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    description,
    categories,
    displayOrder,
    showOnHomepage,
    color,
    mapPosition,
  } = req.body;
  
  // Check if department already exists
  const existingDepartment = await Department.findOne({ name });
  if (existingDepartment) {
    return next(new ErrorHandler("Department with this name already exists", 400));
  }
  
  // Handle image uploads
  let iconData = null;
  let imageData = null;
  
  if (req.files) {
    if (req.files.icon && req.files.icon[0]) {
      const iconResult = await uploadToCloudinary(req.files.icon[0].buffer, {
        folder: 'departments/icons',
        resource_type: 'image',
      });
      iconData = {
        url: iconResult.url,
        public_id: iconResult.public_id,
      };
    }
    
    if (req.files.image && req.files.image[0]) {
      const imageResult = await uploadToCloudinary(req.files.image[0].buffer, {
        folder: 'departments/images',
        resource_type: 'image',
      });
      imageData = {
        url: imageResult.url,
        public_id: imageResult.public_id,
      };
    }
  }
  
  const department = await Department.create({
    name,
    description,
    icon: iconData,
    image: imageData,
    categories: categories ? JSON.parse(categories) : [],
    displayOrder: displayOrder || 0,
    showOnHomepage: showOnHomepage !== undefined ? showOnHomepage : true,
    color: color || '#000000',
    mapPosition: mapPosition ? JSON.parse(mapPosition) : { x: 0, y: 0, floor: 1 },
  });
  
  res.status(201).json({
    success: true,
    message: "Department created successfully",
    department,
  });
});

// Get all departments (public)
exports.getAllDepartments = catchAsyncErrors(async (req, res, next) => {
  const { active } = req.query;
  
  const query = {};
  if (active === 'true') {
    query.isActive = true;
  }
  
  const departments = await Department.find(query)
    .populate('categories', 'title image')
    .sort({ displayOrder: 1 });
  
  res.status(200).json({
    success: true,
    departments,
  });
});

// Get departments for homepage (public)
exports.getHomepageDepartments = catchAsyncErrors(async (req, res, next) => {
  const departments = await Department.find({
    isActive: true,
    showOnHomepage: true,
  })
  .populate('categories', 'title image')
  .sort({ displayOrder: 1 })
  .limit(12);
  
  res.status(200).json({
    success: true,
    departments,
  });
});

// Get single department (public)
exports.getDepartment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const department = await Department.findById(id)
    .populate('categories', 'title image description');
  
  if (!department) {
    return next(new ErrorHandler("Department not found", 404));
  }
  
  res.status(200).json({
    success: true,
    department,
  });
});

// Update department (Admin only)
exports.updateDepartment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    description,
    categories,
    displayOrder,
    showOnHomepage,
    color,
    mapPosition,
    isActive,
  } = req.body;
  
  const department = await Department.findById(id);
  
  if (!department) {
    return next(new ErrorHandler("Department not found", 404));
  }
  
  // Update fields
  if (name) department.name = name;
  if (description !== undefined) department.description = description;
  if (categories) department.categories = JSON.parse(categories);
  if (displayOrder !== undefined) department.displayOrder = displayOrder;
  if (showOnHomepage !== undefined) department.showOnHomepage = showOnHomepage;
  if (color) department.color = color;
  if (mapPosition) department.mapPosition = JSON.parse(mapPosition);
  if (isActive !== undefined) department.isActive = isActive;
  
  // Handle image uploads
  if (req.files) {
    if (req.files.icon && req.files.icon[0]) {
      // Delete old icon
      if (department.icon && department.icon.public_id) {
        await deleteFromCloudinary(department.icon.public_id);
      }
      
      const iconResult = await uploadToCloudinary(req.files.icon[0].buffer, {
        folder: 'departments/icons',
        resource_type: 'image',
      });
      department.icon = {
        url: iconResult.url,
        public_id: iconResult.public_id,
      };
    }
    
    if (req.files.image && req.files.image[0]) {
      // Delete old image
      if (department.image && department.image.public_id) {
        await deleteFromCloudinary(department.image.public_id);
      }
      
      const imageResult = await uploadToCloudinary(req.files.image[0].buffer, {
        folder: 'departments/images',
        resource_type: 'image',
      });
      department.image = {
        url: imageResult.url,
        public_id: imageResult.public_id,
      };
    }
  }
  
  await department.save();
  
  res.status(200).json({
    success: true,
    message: "Department updated successfully",
    department,
  });
});

// Delete department (Admin only)
exports.deleteDepartment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const department = await Department.findById(id);
  
  if (!department) {
    return next(new ErrorHandler("Department not found", 404));
  }
  
  // Delete images from Cloudinary
  if (department.icon && department.icon.public_id) {
    await deleteFromCloudinary(department.icon.public_id);
  }
  
  if (department.image && department.image.public_id) {
    await deleteFromCloudinary(department.image.public_id);
  }
  
  await department.deleteOne();
  
  res.status(200).json({
    success: true,
    message: "Department deleted successfully",
  });
});

// Reorder departments (Admin only)
exports.reorderDepartments = catchAsyncErrors(async (req, res, next) => {
  const { departments } = req.body; // Array of { id, displayOrder }
  
  if (!Array.isArray(departments)) {
    return next(new ErrorHandler("Invalid departments data", 400));
  }
  
  // Update display orders
  const updatePromises = departments.map(dept => 
    Department.findByIdAndUpdate(dept.id, { displayOrder: dept.displayOrder })
  );
  
  await Promise.all(updatePromises);
  
  res.status(200).json({
    success: true,
    message: "Departments reordered successfully",
  });
});

// Get mall map (public)
exports.getMallMap = catchAsyncErrors(async (req, res, next) => {
  const { floor } = req.query;
  
  const query = { isActive: true };
  if (floor) {
    query['mapPosition.floor'] = parseInt(floor);
  }
  
  const departments = await Department.find(query)
    .populate('categories', 'title')
    .sort({ 'mapPosition.floor': 1, displayOrder: 1 });
  
  // Group by floor
  const floors = {};
  departments.forEach(dept => {
    const floorNum = dept.mapPosition.floor;
    if (!floors[floorNum]) {
      floors[floorNum] = [];
    }
    floors[floorNum].push({
      id: dept._id,
      name: dept.name,
      icon: dept.icon,
      color: dept.color,
      position: { x: dept.mapPosition.x, y: dept.mapPosition.y },
      categories: dept.categories,
    });
  });
  
  res.status(200).json({
    success: true,
    floors,
  });
});
