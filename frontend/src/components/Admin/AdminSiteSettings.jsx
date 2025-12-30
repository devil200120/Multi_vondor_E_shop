import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  IconButton,
  Paper,
  Chip,
  InputAdornment,
} from "@material-ui/core";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Language as WebsiteIcon,
  Palette as PaletteIcon,
  Image as ImageIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";
import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    marginBottom: theme.spacing(3),
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
      pointerEvents: "none",
    },
  },
  headerContent: {
    position: "relative",
    zIndex: 1,
  },
  sectionCard: {
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid #e2e8f0",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2.5),
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    borderRadius: "12px 12px 0 0",
  },
  sectionContent: {
    padding: theme.spacing(3),
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": {
        borderColor: "#e2e8f0",
      },
      "&:hover fieldset": {
        borderColor: "#cbd5e0",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#667eea",
      },
    },
  },
  saveButton: {
    borderRadius: 8,
    padding: "12px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
      boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
    },
  },
  resetButton: {
    borderRadius: 8,
    padding: "12px 24px",
    border: "2px solid #ef4444",
    color: "#ef4444",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "#fef2f2",
      borderColor: "#dc2626",
      color: "#dc2626",
    },
  },
  previewCard: {
    padding: theme.spacing(2),
    backgroundColor: "#f0f9ff",
    border: "2px solid #bae6fd",
    borderRadius: 8,
    marginTop: theme.spacing(2),
  },
  socialIcon: {
    color: "#6b7280",
    "&:hover": {
      color: "#374151",
    },
  },
}));

const AdminSiteSettings = () => {
  const classes = useStyles();
  const [settings, setSettings] = useState({
    branding: {
      favicon: "",
      appleTouchIcon: "",
      themeColor: "#000000",
      metaDescription: "",
      siteTitle: "",
    },
    footerAddress: {
      streetAddress: "",
      landmark: "",
      city: "",
      postalCode: "",
      phone: "",
      email: "",
    },
    companyInfo: {
      name: "",
      description: "",
      website: "",
    },
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
    },
    businessHours: {
      weekdays: "",
      weekends: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingAppleIcon, setUploadingAppleIcon] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${server}/site-settings/admin/get-site-settings`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSettings(response.data.settings);
        setLastUpdated(response.data.settings.updatedAt);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${server}/site-settings/admin/update-site-settings`,
        settings,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Site settings updated successfully!");
        setLastUpdated(response.data.settings.updatedAt);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (
      window.confirm("Are you sure you want to reset all settings to default?")
    ) {
      try {
        setLoading(true);
        const response = await axios.post(
          `${server}/site-settings/admin/reset-site-settings`,
          {},
          { withCredentials: true }
        );

        if (response.data.success) {
          setSettings(response.data.settings);
          setLastUpdated(response.data.settings.updatedAt);
          toast.success("Settings reset to default successfully!");
        }
      } catch (error) {
        console.error("Error resetting settings:", error);
        toast.error("Failed to reset settings");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/x-icon",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Please upload a valid image file (PNG, JPG, GIF, WebP, ICO, or SVG)"
      );
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    const setUploading =
      imageType === "favicon" ? setUploadingFavicon : setUploadingAppleIcon;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("imageType", imageType);

      const response = await axios.post(
        `${server}/site-settings/admin/upload-branding-image`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSettings((prev) => ({
          ...prev,
          branding: {
            ...prev.branding,
            [imageType]: response.data.url,
          },
        }));
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (imageType) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${
          imageType === "favicon" ? "favicon" : "apple touch icon"
        }?`
      )
    ) {
      return;
    }

    const setUploading =
      imageType === "favicon" ? setUploadingFavicon : setUploadingAppleIcon;
    setUploading(true);

    try {
      const response = await axios.delete(
        `${server}/site-settings/admin/delete-branding-image/${imageType}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSettings((prev) => ({
          ...prev,
          branding: {
            ...prev.branding,
            [imageType]:
              imageType === "favicon" ? "/WANTTA (7).png" : "/logo192.png",
          },
        }));
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error(error.response?.data?.message || "Failed to delete image");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className={classes.root}>
      {/* Header */}
      <Card className={classes.header}>
        <CardContent className={classes.headerContent}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <div>
              <Typography
                variant="h4"
                gutterBottom
                style={{ fontWeight: 700, marginBottom: 8 }}
              >
                ⚙️ Site Settings
              </Typography>
              <Typography
                variant="body1"
                style={{ opacity: 0.9, fontSize: "1.1rem" }}
              >
                Configure footer address, company information, and social media
                links
              </Typography>
              {lastUpdated && (
                <Typography
                  variant="caption"
                  style={{ opacity: 0.8, display: "block", marginTop: 8 }}
                >
                  Last updated: {formatDate(lastUpdated)}
                </Typography>
              )}
            </div>
            <Box style={{ opacity: 0.7 }}>
              <Typography
                variant="h2"
                style={{ fontWeight: 100, fontSize: "4rem" }}
              >
                ⚙️
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Branding & SEO Section */}
      <Card className={classes.sectionCard}>
        <Box className={classes.sectionHeader}>
          <PaletteIcon style={{ marginRight: 8, color: "#667eea" }} />
          <Typography variant="h6" style={{ fontWeight: 600 }}>
            Branding & SEO Settings
          </Typography>
        </Box>
        <CardContent className={classes.sectionContent}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Title (Browser Tab)"
                variant="outlined"
                className={classes.textField}
                value={settings.branding?.siteTitle || ""}
                onChange={(e) =>
                  handleInputChange("branding", "siteTitle", e.target.value)
                }
                placeholder="e.g., Wanttar"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon style={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                helperText="This appears in the browser tab"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Theme Color"
                variant="outlined"
                className={classes.textField}
                type="color"
                value={settings.branding?.themeColor || "#000000"}
                onChange={(e) =>
                  handleInputChange("branding", "themeColor", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaletteIcon style={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Theme color for mobile browsers"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Description (SEO)"
                variant="outlined"
                className={classes.textField}
                value={settings.branding?.metaDescription || ""}
                onChange={(e) =>
                  handleInputChange(
                    "branding",
                    "metaDescription",
                    e.target.value
                  )
                }
                placeholder="e.g., Your trusted online marketplace for all your shopping needs"
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon style={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Description shown in search engine results (max 160 characters recommended)"
              />
            </Grid>
            {/* Favicon Upload */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle2"
                style={{ marginBottom: 8, fontWeight: 600, color: "#374151" }}
              >
                Favicon
              </Typography>
              <Box
                style={{
                  border: "2px dashed #e2e8f0",
                  borderRadius: 12,
                  padding: 16,
                  textAlign: "center",
                  backgroundColor: "#fafafa",
                  position: "relative",
                }}
              >
                {settings.branding?.favicon ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                  >
                    <Box position="relative" display="inline-block">
                      <img
                        src={settings.branding.favicon}
                        alt="Favicon preview"
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "contain",
                          border: "2px solid #e2e8f0",
                          borderRadius: 8,
                          backgroundColor: "white",
                          padding: 4,
                        }}
                        onError={(e) => {
                          e.target.src = "/WANTTA (7).png";
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteImage("favicon")}
                        disabled={uploadingFavicon}
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          backgroundColor: "#ef4444",
                          color: "white",
                          padding: 4,
                        }}
                      >
                        <DeleteIcon style={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                    <Typography
                      variant="caption"
                      style={{ marginTop: 8, color: "#6b7280" }}
                    >
                      Current favicon
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <ImageIcon style={{ fontSize: 48, color: "#d1d5db" }} />
                    <Typography
                      variant="body2"
                      style={{ color: "#6b7280", marginTop: 8 }}
                    >
                      No favicon uploaded
                    </Typography>
                  </Box>
                )}
                <Box mt={2}>
                  <input
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/x-icon,image/svg+xml"
                    style={{ display: "none" }}
                    id="favicon-upload"
                    type="file"
                    onChange={(e) => handleImageUpload(e, "favicon")}
                    disabled={uploadingFavicon}
                  />
                  <label htmlFor="favicon-upload">
                    <Button
                      variant="contained"
                      component="span"
                      disabled={uploadingFavicon}
                      startIcon={
                        uploadingFavicon ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <UploadIcon />
                        )
                      }
                      style={{
                        backgroundColor: uploadingFavicon
                          ? "#9ca3af"
                          : "#667eea",
                        color: "white",
                        borderRadius: 8,
                        textTransform: "none",
                      }}
                    >
                      {uploadingFavicon ? "Uploading..." : "Upload Favicon"}
                    </Button>
                  </label>
                </Box>
                <Typography
                  variant="caption"
                  style={{ color: "#9ca3af", display: "block", marginTop: 8 }}
                >
                  Small icon shown in browser tab (recommended: 32x32 or 16x16
                  PNG)
                </Typography>
              </Box>
            </Grid>

            {/* Apple Touch Icon Upload */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle2"
                style={{ marginBottom: 8, fontWeight: 600, color: "#374151" }}
              >
                Apple Touch Icon
              </Typography>
              <Box
                style={{
                  border: "2px dashed #e2e8f0",
                  borderRadius: 12,
                  padding: 16,
                  textAlign: "center",
                  backgroundColor: "#fafafa",
                  position: "relative",
                }}
              >
                {settings.branding?.appleTouchIcon ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                  >
                    <Box position="relative" display="inline-block">
                      <img
                        src={settings.branding.appleTouchIcon}
                        alt="Apple Touch Icon preview"
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "contain",
                          border: "2px solid #e2e8f0",
                          borderRadius: 8,
                          backgroundColor: "white",
                          padding: 4,
                        }}
                        onError={(e) => {
                          e.target.src = "/logo192.png";
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteImage("appleTouchIcon")}
                        disabled={uploadingAppleIcon}
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          backgroundColor: "#ef4444",
                          color: "white",
                          padding: 4,
                        }}
                      >
                        <DeleteIcon style={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                    <Typography
                      variant="caption"
                      style={{ marginTop: 8, color: "#6b7280" }}
                    >
                      Current icon
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <ImageIcon style={{ fontSize: 48, color: "#d1d5db" }} />
                    <Typography
                      variant="body2"
                      style={{ color: "#6b7280", marginTop: 8 }}
                    >
                      No icon uploaded
                    </Typography>
                  </Box>
                )}
                <Box mt={2}>
                  <input
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    style={{ display: "none" }}
                    id="apple-icon-upload"
                    type="file"
                    onChange={(e) => handleImageUpload(e, "appleTouchIcon")}
                    disabled={uploadingAppleIcon}
                  />
                  <label htmlFor="apple-icon-upload">
                    <Button
                      variant="contained"
                      component="span"
                      disabled={uploadingAppleIcon}
                      startIcon={
                        uploadingAppleIcon ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <UploadIcon />
                        )
                      }
                      style={{
                        backgroundColor: uploadingAppleIcon
                          ? "#9ca3af"
                          : "#667eea",
                        color: "white",
                        borderRadius: 8,
                        textTransform: "none",
                      }}
                    >
                      {uploadingAppleIcon ? "Uploading..." : "Upload Icon"}
                    </Button>
                  </label>
                </Box>
                <Typography
                  variant="caption"
                  style={{ color: "#9ca3af", display: "block", marginTop: 8 }}
                >
                  Icon for iOS devices when added to home screen (recommended:
                  192x192 PNG)
                </Typography>
              </Box>
            </Grid>

            {/* Branding Preview */}
            <Grid item xs={12}>
              <Paper className={classes.previewCard}>
                <Typography
                  variant="subtitle2"
                  style={{ fontWeight: 600, marginBottom: 8, color: "#0369a1" }}
                >
                  🎨 Branding Preview:
                </Typography>
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                  {settings.branding?.favicon && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" style={{ fontWeight: 500 }}>
                        Favicon:
                      </Typography>
                      <img
                        src={
                          settings.branding.favicon.startsWith("http")
                            ? settings.branding.favicon
                            : settings.branding.favicon
                        }
                        alt="Favicon preview"
                        style={{
                          width: 32,
                          height: 32,
                          objectFit: "contain",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </Box>
                  )}
                  {settings.branding?.themeColor && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" style={{ fontWeight: 500 }}>
                        Theme Color:
                      </Typography>
                      <Box
                        style={{
                          width: 32,
                          height: 32,
                          backgroundColor: settings.branding.themeColor,
                          borderRadius: 4,
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <Typography
                        variant="caption"
                        style={{ color: "#6b7280" }}
                      >
                        {settings.branding.themeColor}
                      </Typography>
                    </Box>
                  )}
                  {settings.branding?.siteTitle && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" style={{ fontWeight: 500 }}>
                        Title:
                      </Typography>
                      <Chip
                        label={settings.branding.siteTitle}
                        size="small"
                        style={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}
                      />
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Footer Address Section */}
      <Card className={classes.sectionCard}>
        <Box className={classes.sectionHeader}>
          <LocationIcon style={{ marginRight: 8, color: "#667eea" }} />
          <Typography variant="h6" style={{ fontWeight: 600 }}>
            Footer Address Information
          </Typography>
        </Box>
        <CardContent className={classes.sectionContent}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Street Address"
                variant="outlined"
                className={classes.textField}
                value={settings.footerAddress?.streetAddress || ""}
                onChange={(e) =>
                  handleInputChange(
                    "footerAddress",
                    "streetAddress",
                    e.target.value
                  )
                }
                placeholder="e.g., 5-25, 15th main road, 3rd stage, 4th block, Basaveswaranagar"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Landmark"
                variant="outlined"
                className={classes.textField}
                value={settings.footerAddress?.landmark || ""}
                onChange={(e) =>
                  handleInputChange("footerAddress", "landmark", e.target.value)
                }
                placeholder="e.g., near Guru sagar hotel"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                variant="outlined"
                className={classes.textField}
                value={settings.footerAddress?.city || ""}
                onChange={(e) =>
                  handleInputChange("footerAddress", "city", e.target.value)
                }
                placeholder="e.g., Bangalore"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postal Code"
                variant="outlined"
                className={classes.textField}
                value={settings.footerAddress?.postalCode || ""}
                onChange={(e) =>
                  handleInputChange(
                    "footerAddress",
                    "postalCode",
                    e.target.value
                  )
                }
                placeholder="e.g., 560079"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                className={classes.textField}
                value={settings.footerAddress?.phone || ""}
                onChange={(e) =>
                  handleInputChange("footerAddress", "phone", e.target.value)
                }
                placeholder="e.g., +91 7349727270"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon style={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Support Email"
                variant="outlined"
                className={classes.textField}
                value={settings.footerAddress?.email || ""}
                onChange={(e) =>
                  handleInputChange("footerAddress", "email", e.target.value)
                }
                placeholder="e.g., support@wanttar.in"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon style={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Address Preview */}
            <Grid item xs={12}>
              <Paper className={classes.previewCard}>
                <Typography
                  variant="subtitle2"
                  style={{ fontWeight: 600, marginBottom: 8, color: "#0369a1" }}
                >
                  📍 Address Preview:
                </Typography>
                <Typography
                  variant="body2"
                  style={{ lineHeight: 1.6, color: "#374151" }}
                >
                  {settings.footerAddress?.streetAddress && (
                    <>
                      {settings.footerAddress.streetAddress}
                      {settings.footerAddress.landmark &&
                        `, ${settings.footerAddress.landmark}`}
                      <br />
                    </>
                  )}
                  {settings.footerAddress?.city &&
                    settings.footerAddress?.postalCode && (
                      <>
                        {settings.footerAddress.city} -{" "}
                        {settings.footerAddress.postalCode}
                        <br />
                      </>
                    )}
                  {settings.footerAddress?.phone && (
                    <>
                      📞 {settings.footerAddress.phone}
                      <br />
                    </>
                  )}
                  {settings.footerAddress?.email && (
                    <>✉️ {settings.footerAddress.email}</>
                  )}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Company Information Section */}
      <Card className={classes.sectionCard}>
        <Box className={classes.sectionHeader}>
          <BusinessIcon style={{ marginRight: 8, color: "#667eea" }} />
          <Typography variant="h6" style={{ fontWeight: 600 }}>
            Company Information
          </Typography>
        </Box>
        <CardContent className={classes.sectionContent}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Company Name"
                variant="outlined"
                className={classes.textField}
                value={settings.companyInfo?.name || ""}
                onChange={(e) =>
                  handleInputChange("companyInfo", "name", e.target.value)
                }
                placeholder="e.g., Wanttar"
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Company Description"
                variant="outlined"
                className={classes.textField}
                value={settings.companyInfo?.description || ""}
                onChange={(e) =>
                  handleInputChange(
                    "companyInfo",
                    "description",
                    e.target.value
                  )
                }
                placeholder="e.g., Your trusted online marketplace"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website URL"
                variant="outlined"
                className={classes.textField}
                value={settings.companyInfo?.website || ""}
                onChange={(e) =>
                  handleInputChange("companyInfo", "website", e.target.value)
                }
                placeholder="e.g., https://www.wanttar.in"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WebsiteIcon style={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Social Media Section */}
      <Card className={classes.sectionCard}>
        <Box className={classes.sectionHeader}>
          <Facebook style={{ marginRight: 8, color: "#667eea" }} />
          <Typography variant="h6" style={{ fontWeight: 600 }}>
            Social Media Links
          </Typography>
        </Box>
        <CardContent className={classes.sectionContent}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Facebook URL"
                variant="outlined"
                className={classes.textField}
                value={settings.socialMedia?.facebook || ""}
                onChange={(e) =>
                  handleInputChange("socialMedia", "facebook", e.target.value)
                }
                placeholder="https://facebook.com/yourpage"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Facebook style={{ color: "#1877f2" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Twitter URL"
                variant="outlined"
                className={classes.textField}
                value={settings.socialMedia?.twitter || ""}
                onChange={(e) =>
                  handleInputChange("socialMedia", "twitter", e.target.value)
                }
                placeholder="https://twitter.com/yourhandle"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Twitter style={{ color: "#1da1f2" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Instagram URL"
                variant="outlined"
                className={classes.textField}
                value={settings.socialMedia?.instagram || ""}
                onChange={(e) =>
                  handleInputChange("socialMedia", "instagram", e.target.value)
                }
                placeholder="https://instagram.com/yourhandle"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Instagram style={{ color: "#e4405f" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LinkedIn URL"
                variant="outlined"
                className={classes.textField}
                value={settings.socialMedia?.linkedin || ""}
                onChange={(e) =>
                  handleInputChange("socialMedia", "linkedin", e.target.value)
                }
                placeholder="https://linkedin.com/company/yourcompany"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedIn style={{ color: "#0077b5" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="YouTube URL"
                variant="outlined"
                className={classes.textField}
                value={settings.socialMedia?.youtube || ""}
                onChange={(e) =>
                  handleInputChange("socialMedia", "youtube", e.target.value)
                }
                placeholder="https://youtube.com/channel/yourchannel"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <YouTube style={{ color: "#ff0000" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Business Hours Section */}
      <Card className={classes.sectionCard}>
        <Box className={classes.sectionHeader}>
          <ScheduleIcon style={{ marginRight: 8, color: "#667eea" }} />
          <Typography variant="h6" style={{ fontWeight: 600 }}>
            Business Hours
          </Typography>
        </Box>
        <CardContent className={classes.sectionContent}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Weekdays"
                variant="outlined"
                className={classes.textField}
                value={settings.businessHours?.weekdays || ""}
                onChange={(e) =>
                  handleInputChange("businessHours", "weekdays", e.target.value)
                }
                placeholder="e.g., Monday - Friday: 9:00 AM - 6:00 PM"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Weekends"
                variant="outlined"
                className={classes.textField}
                value={settings.businessHours?.weekends || ""}
                onChange={(e) =>
                  handleInputChange("businessHours", "weekends", e.target.value)
                }
                placeholder="e.g., Saturday - Sunday: 10:00 AM - 4:00 PM"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className={classes.sectionCard}>
        <CardContent className={classes.sectionContent}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              className={classes.resetButton}
              disabled={loading}
            >
              Reset to Default
            </Button>

            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchSettings}
                disabled={loading}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                className={classes.saveButton}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSiteSettings;
