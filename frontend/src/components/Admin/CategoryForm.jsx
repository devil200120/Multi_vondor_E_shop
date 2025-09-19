import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Chip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { HiOutlineX, HiOutlineCloudUpload } from "react-icons/hi";
import {
  createCategory,
  updateCategory,
  getAllCategories,
} from "../../redux/actions/category";
import { toast } from "react-toastify";
import { backend_url } from "../../server";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      minWidth: "600px",
      maxWidth: "800px",
    },
  },
  imageUpload: {
    border: "2px dashed #ddd",
    borderRadius: "8px",
    padding: theme.spacing(3),
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.3s",
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
  },
  imagePreview: {
    maxWidth: "100%",
    maxHeight: "200px",
    borderRadius: "8px",
    marginTop: theme.spacing(2),
  },
  previewContainer: {
    position: "relative",
    display: "inline-block",
  },
  removeButton: {
    position: "absolute",
    top: "-10px",
    right: "-10px",
    backgroundColor: theme.palette.error.main,
    color: "white",
    borderRadius: "50%",
    minWidth: "24px",
    height: "24px",
    padding: "0",
    "&:hover": {
      backgroundColor: theme.palette.error.dark,
    },
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  levelChip: {
    marginLeft: theme.spacing(1),
  },
}));

const CategoryForm = ({ open, onClose, category }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector((state) => state.categories);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "",
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
    isActive: true,
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [availableParents, setAvailableParents] = useState([]);

  // Load available parent categories
  useEffect(() => {
    if (open) {
      dispatch(
        getAllCategories({ includeInactive: false, page: 1, limit: 100 })
      );
    }
  }, [open, dispatch]);

  // Filter available parents (exclude current category and its descendants)
  useEffect(() => {
    let filtered = categories.filter((cat) => cat.level < 2); // Max 3 levels (0, 1, 2)

    if (category) {
      // Exclude current category and its descendants
      filtered = filtered.filter((cat) => {
        if (cat._id === category._id) return false;
        // Check if cat is a descendant of current category
        return !cat.path?.includes(category.slug);
      });
    }

    setAvailableParents(filtered);
  }, [categories, category]);

  // Initialize form data
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        parent: category.parent?._id || "",
        sortOrder: category.sortOrder || 0,
        metaTitle: category.metaTitle || "",
        metaDescription: category.metaDescription || "",
        isActive: category.isActive !== false,
      });

      if (category.image) {
        setImagePreview(category.image);
      }
    } else {
      setFormData({
        name: "",
        description: "",
        parent: "",
        sortOrder: 0,
        metaTitle: "",
        metaDescription: "",
        isActive: true,
      });
      setImagePreview("");
    }
    setImage(null);
    setErrors({});
  }, [category, open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (formData.name.length > 100) {
      newErrors.name = "Category name cannot exceed 100 characters";
    }

    if (formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = "Meta title cannot exceed 60 characters";
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription =
        "Meta description cannot exceed 160 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    if (image) {
      submitData.append("image", image);
    }

    try {
      if (category) {
        await dispatch(updateCategory(category._id, submitData));
      } else {
        await dispatch(createCategory(submitData));
      }
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const getParentLevel = () => {
    if (!formData.parent) return 0;
    const parent = availableParents.find((p) => p._id === formData.parent);
    return parent ? parent.level + 1 : 0;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">
          {category ? "Edit Category" : "Add New Category"}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" className={classes.sectionTitle}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                label="Category Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Sort Order"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  handleInputChange("sortOrder", parseInt(e.target.value) || 0)
                }
                fullWidth
                variant="outlined"
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                error={!!errors.description}
                helperText={errors.description}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>

            {/* Hierarchy */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" className={classes.sectionTitle}>
                Category Hierarchy
              </Typography>
            </Grid>

            <Grid item xs={12} sm={8}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Parent Category</InputLabel>
                <Select
                  value={formData.parent}
                  onChange={(e) => handleInputChange("parent", e.target.value)}
                  label="Parent Category"
                >
                  <MenuItem value="">
                    <em>Root Category (No Parent)</em>
                  </MenuItem>
                  {availableParents.map((parent) => (
                    <MenuItem key={parent._id} value={parent._id}>
                      {parent.name}
                      <Chip
                        label={`Level ${parent.level}`}
                        size="small"
                        className={classes.levelChip}
                        color={parent.level === 0 ? "primary" : "default"}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" height="100%">
                <Typography variant="body2" color="textSecondary">
                  This will be Level: <strong>{getParentLevel()}</strong>
                </Typography>
              </Box>
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" className={classes.sectionTitle}>
                Category Image
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                id="image-upload"
              />

              {!imagePreview ? (
                <label htmlFor="image-upload">
                  <Box className={classes.imageUpload}>
                    <HiOutlineCloudUpload size={48} color="#ddd" />
                    <Typography variant="body1" style={{ marginTop: 16 }}>
                      Click to upload category image
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      JPG, PNG, GIF up to 5MB
                    </Typography>
                  </Box>
                </label>
              ) : (
                <Box className={classes.previewContainer}>
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className={classes.imagePreview}
                  />
                  <Button
                    className={classes.removeButton}
                    onClick={removeImage}
                    size="small"
                  >
                    <HiOutlineX />
                  </Button>
                </Box>
              )}
            </Grid>

            {/* SEO Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" className={classes.sectionTitle}>
                SEO Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Meta Title"
                value={formData.metaTitle}
                onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                error={!!errors.metaTitle}
                helperText={errors.metaTitle || "Recommended: 50-60 characters"}
                fullWidth
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Meta Description"
                value={formData.metaDescription}
                onChange={(e) =>
                  handleInputChange("metaDescription", e.target.value)
                }
                error={!!errors.metaDescription}
                helperText={
                  errors.metaDescription || "Recommended: 150-160 characters"
                }
                fullWidth
                multiline
                rows={2}
                variant="outlined"
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label="Active Category"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="secondary" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} />}
          >
            {category ? "Update" : "Create"} Category
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryForm;
