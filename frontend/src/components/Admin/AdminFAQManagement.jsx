import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Collapse,
  Card,
  CardContent,
  InputAdornment,
  Checkbox,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  Publish as PublishIcon,
  QuestionAnswer as QuestionAnswerIcon,
  TrendingUp as TrendingUpIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";

const FAQ_CATEGORIES = [
  "general",
  "ordering",
  "shipping",
  "payment",
  "returns",
  "account",
  "technical",
  "products",
];

const AdminFAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedFaqs, setSelectedFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "general",
    order: 0,
    isActive: true,
    isPublished: true,
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  // Fetch FAQs
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${server}/faq/admin/get-all-faqs?page=${page}&limit=10&category=${filterCategory}&search=${searchTerm}&status=${filterStatus}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setFaqs(response.data.faqs);
        setTotalPages(response.data.totalPages);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterCategory, searchTerm, filterStatus]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }

    try {
      const payload = {
        ...formData,
        tags: formData.tags.filter((tag) => tag.trim() !== ""),
      };

      let response;
      if (editingFaq) {
        response = await axios.put(
          `${server}/faq/admin/update-faq/${editingFaq._id}`,
          payload,
          { withCredentials: true }
        );
      } else {
        response = await axios.post(`${server}/faq/admin/create-faq`, payload, {
          withCredentials: true,
        });
      }

      if (response.data.success) {
        toast.success(
          editingFaq ? "FAQ updated successfully" : "FAQ created successfully"
        );
        setOpenDialog(false);
        resetForm();
        fetchFAQs();
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error(error.response?.data?.message || "Failed to save FAQ");
    }
  };

  // Handle delete
  const handleDelete = async (faqId) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${server}/faq/admin/delete-faq/${faqId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("FAQ deleted successfully");
        fetchFAQs();
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("Failed to delete FAQ");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedFaqs.length === 0) {
      toast.warning("Please select FAQs to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedFaqs.length} selected FAQs?`
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(
        `${server}/faq/admin/bulk-delete-faqs`,
        {
          data: { faqIds: selectedFaqs },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(
          `Successfully deleted ${response.data.deletedCount} FAQs`
        );
        setSelectedFaqs([]);
        fetchFAQs();
      }
    } catch (error) {
      console.error("Error bulk deleting FAQs:", error);
      toast.error("Failed to delete selected FAQs");
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (faq, field) => {
    try {
      const updatedFaq = { ...faq, [field]: !faq[field] };

      const response = await axios.put(
        `${server}/faq/admin/update-faq/${faq._id}`,
        updatedFaq,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`FAQ ${field} status updated`);
        fetchFAQs();
      }
    } catch (error) {
      console.error("Error updating FAQ status:", error);
      toast.error("Failed to update FAQ status");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      category: "general",
      order: 0,
      isActive: true,
      isPublished: true,
      tags: [],
    });
    setTagInput("");
    setEditingFaq(null);
  };

  // Handle edit
  const handleEdit = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive,
      isPublished: faq.isPublished,
      tags: faq.tags || [],
    });
    setEditingFaq(faq);
    setOpenDialog(true);
  };

  // Handle tag operations
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Handle selection
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedFaqs(faqs.map((faq) => faq._id));
    } else {
      setSelectedFaqs([]);
    }
  };

  const handleSelectFaq = (faqId, checked) => {
    if (checked) {
      setSelectedFaqs([...selectedFaqs, faqId]);
    } else {
      setSelectedFaqs(selectedFaqs.filter((id) => id !== faqId));
    }
  };

  const getStatusColor = (isActive, isPublished) => {
    if (isActive && isPublished) return "success";
    if (isActive && !isPublished) return "warning";
    return "error";
  };

  const getStatusText = (isActive, isPublished) => {
    if (isActive && isPublished) return "Published";
    if (isActive && !isPublished) return "Draft";
    return "Inactive";
  };

  return (
    <Box
      style={{
        padding: "24px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Professional Header */}
      <Box
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          color: "white",
          boxShadow: "0 6px 15px rgba(102, 126, 234, 0.15)",
        }}
      >
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <QuestionAnswerIcon
            style={{ fontSize: "1.8rem", marginRight: "12px", opacity: 0.9 }}
          />
          <Box>
            <Typography
              variant="h4"
              component="h1"
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "4px",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              FAQ Management
            </Typography>
            <Typography
              variant="h6"
              style={{
                fontSize: "0.95rem",
                opacity: 0.9,
                fontWeight: 400,
              }}
            >
              Create, manage and organize frequently asked questions for better
              customer experience
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Professional Stats Cards */}
      <Grid container spacing={2} style={{ marginBottom: "20px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <CardContent style={{ padding: "16px", color: "white" }}>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      marginBottom: "2px",
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {stats.total || 0}
                  </Typography>
                  <Typography
                    variant="body1"
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.9,
                      fontWeight: 500,
                    }}
                  >
                    Total FAQs
                  </Typography>
                </Box>
                <QuestionAnswerIcon
                  style={{
                    fontSize: "2.5rem",
                    opacity: 0.2,
                    position: "absolute",
                    right: "12px",
                    top: "12px",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <CardContent style={{ padding: "16px", color: "white" }}>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      marginBottom: "2px",
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {stats.published || 0}
                  </Typography>
                  <Typography
                    variant="body1"
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.9,
                      fontWeight: 500,
                    }}
                  >
                    Published
                  </Typography>
                </Box>
                <PublishIcon
                  style={{
                    fontSize: "2.5rem",
                    opacity: 0.2,
                    position: "absolute",
                    right: "12px",
                    top: "12px",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <CardContent style={{ padding: "16px", color: "white" }}>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      marginBottom: "2px",
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {stats.totalViews || 0}
                  </Typography>
                  <Typography
                    variant="body1"
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.9,
                      fontWeight: 500,
                    }}
                  >
                    Total Views
                  </Typography>
                </Box>
                <VisibilityIcon
                  style={{
                    fontSize: "2.5rem",
                    opacity: 0.2,
                    position: "absolute",
                    right: "12px",
                    top: "12px",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <CardContent style={{ padding: "16px", color: "white" }}>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      marginBottom: "2px",
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {stats.totalHelpful || 0}
                  </Typography>
                  <Typography
                    variant="body1"
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.9,
                      fontWeight: 500,
                    }}
                  >
                    Helpful Votes
                  </Typography>
                </Box>
                <TrendingUpIcon
                  style={{
                    fontSize: "2.5rem",
                    opacity: 0.2,
                    position: "absolute",
                    right: "12px",
                    top: "12px",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Professional Controls Section */}
      <Card
        elevation={0}
        style={{
          borderRadius: "16px",
          marginBottom: "32px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            padding: "12px 16px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Typography
            variant="h6"
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#1f2937",
              marginBottom: "2px",
            }}
          >
            Search & Filter
          </Typography>
          <Typography
            variant="body2"
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
            }}
          >
            Find and organize your FAQ content
          </Typography>
        </Box>
        <CardContent style={{ padding: "16px" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Search FAQs by question or answer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "#6b7280" }} />
                    </InputAdornment>
                  ),
                  style: {
                    borderRadius: "12px",
                    backgroundColor: "#f9fafb",
                  },
                }}
                style={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel style={{ color: "#6b7280" }}>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label="Category"
                  style={{
                    borderRadius: "12px",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {FAQ_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel style={{ color: "#6b7280" }}>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                  style={{
                    borderRadius: "12px",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {selectedFaqs.length > 0 && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                    style={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 500,
                      borderColor: "#ef4444",
                      color: "#ef4444",
                    }}
                  >
                    Delete ({selectedFaqs.length})
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    resetForm();
                    setOpenDialog(true);
                  }}
                  style={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                    padding: "10px 24px",
                  }}
                >
                  Add New FAQ
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Professional FAQ Table */}
      <Card
        elevation={0}
        style={{
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Typography
            variant="h6"
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#1f2937",
              marginBottom: "4px",
            }}
          >
            FAQ Management Table
          </Typography>
          <Typography
            variant="body2"
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
            }}
          >
            View and manage all your frequently asked questions
          </Typography>
        </Box>
        <TableContainer style={{ backgroundColor: "#ffffff" }}>
          <Table>
            <TableHead>
              <TableRow style={{ backgroundColor: "#f8fafc" }}>
                <TableCell
                  padding="checkbox"
                  style={{
                    fontWeight: 600,
                    color: "#374151",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  <Checkbox
                    indeterminate={
                      selectedFaqs.length > 0 &&
                      selectedFaqs.length < faqs.length
                    }
                    checked={
                      faqs.length > 0 && selectedFaqs.length === faqs.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ color: "#667eea" }}
                  />
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "0.875rem",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Question
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "0.875rem",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Category
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "0.875rem",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "0.875rem",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Views
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "0.875rem",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Helpful
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "0.875rem",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Order
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "0.875rem",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : faqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No FAQs found
                  </TableCell>
                </TableRow>
              ) : (
                faqs.map((faq) => (
                  <React.Fragment key={faq._id}>
                    <TableRow hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedFaqs.includes(faq._id)}
                          onChange={(e) =>
                            handleSelectFaq(faq._id, e.target.checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {faq.question.length > 60
                              ? `${faq.question.substring(0, 60)}...`
                              : faq.question}
                          </Typography>
                          {faq.tags && faq.tags.length > 0 && (
                            <Box style={{ marginTop: 4 }}>
                              {faq.tags.slice(0, 2).map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  style={{ marginRight: 4, fontSize: "0.7rem" }}
                                />
                              ))}
                              {faq.tags.length > 2 && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  +{faq.tags.length - 2} more
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            faq.category.charAt(0).toUpperCase() +
                            faq.category.slice(1)
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(faq.isActive, faq.isPublished)}
                          color={getStatusColor(faq.isActive, faq.isPublished)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{faq.views || 0}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" color="success.main">
                            👍 {faq.helpful || 0}
                          </Typography>
                          <Typography variant="body2" color="error.main">
                            👎 {faq.notHelpful || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{faq.order}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View/Edit Details">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setExpandedFaq(
                                  expandedFaq === faq._id ? null : faq._id
                                )
                              }
                              style={{
                                backgroundColor: "#f3f4f6",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                color: "#6b7280",
                              }}
                            >
                              {expandedFaq === faq._id ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(faq)}
                              style={{
                                backgroundColor: "#dbeafe",
                                border: "1px solid #93c5fd",
                                borderRadius: "8px",
                                color: "#2563eb",
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(faq._id)}
                              style={{
                                backgroundColor: "#fee2e2",
                                border: "1px solid #fca5a5",
                                borderRadius: "8px",
                                color: "#dc2626",
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row */}
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={8}
                      >
                        <Collapse
                          in={expandedFaq === faq._id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box style={{ margin: 16 }}>
                            <Card variant="outlined">
                              <CardContent>
                                <Grid container spacing={2}>
                                  <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                      Question
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                      {faq.question}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                      Answer
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                      {faq.answer}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <Box style={{ marginBottom: 16 }}>
                                      <FormControlLabel
                                        control={
                                          <Switch
                                            checked={faq.isActive}
                                            onChange={() =>
                                              handleStatusToggle(
                                                faq,
                                                "isActive"
                                              )
                                            }
                                            color="primary"
                                          />
                                        }
                                        label="Active"
                                      />
                                      <FormControlLabel
                                        control={
                                          <Switch
                                            checked={faq.isPublished}
                                            onChange={() =>
                                              handleStatusToggle(
                                                faq,
                                                "isPublished"
                                              )
                                            }
                                            color="success"
                                          />
                                        }
                                        label="Published"
                                      />
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Created:{" "}
                                      {new Date(faq.createdAt).toLocaleString()}
                                    </Typography>
                                    {faq.updatedAt !== faq.createdAt && (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        Updated:{" "}
                                        {new Date(
                                          faq.updatedAt
                                        ).toLocaleString()}
                                      </Typography>
                                    )}
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              variant="outlined"
              size="small"
              style={{ marginRight: 8 }}
            >
              Previous
            </Button>
            <Typography variant="body2" style={{ margin: "0 16px" }}>
              Page {page} of {totalPages}
            </Typography>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              variant="outlined"
              size="small"
              style={{ marginLeft: 8 }}
            >
              Next
            </Button>
          </Box>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingFaq ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} style={{ marginTop: 8 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Question"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  required
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Answer"
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  required
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    label="Category"
                  >
                    {FAQ_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Display Order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Box style={{ marginBottom: 16 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags
                  </Typography>
                  <Box
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {formData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => removeTag(tag)}
                        size="small"
                      />
                    ))}
                  </Box>
                  <Box style={{ display: "flex", gap: 8 }}>
                    <TextField
                      size="small"
                      placeholder="Add tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button variant="outlined" onClick={addTag}>
                      Add
                    </Button>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                  }
                  label="Active"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPublished}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPublished: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Published"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingFaq ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminFAQManagement;
