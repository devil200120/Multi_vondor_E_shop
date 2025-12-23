import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Card,
  CardContent,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Avatar,
  TablePagination,
  Box,
  IconButton,
} from "@material-ui/core";
import {
  AiFillDelete as DeleteIcon,
  AiFillEye as ViewIcon,
  AiFillStar as StarIcon,
  AiOutlineStar as StarBorderIcon,
  AiOutlineReload as RefreshIcon,
} from "react-icons/ai";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { getAvatarUrl, getProductImageUrl } from "../../utils/mediaUtils";

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
    overflow: "hidden",
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
  filterCard: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    background: "white",
    border: "1px solid #e2e8f0",
  },
  statsCard: {
    textAlign: "center",
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    },
  },
  statsContent: {
    padding: theme.spacing(2.5),
  },
  statsNumber: {
    fontSize: "2.5rem",
    fontWeight: 700,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundClip: "text",
    textFillColor: "transparent",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  table: {
    minWidth: 650,
  },
  tableCard: {
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  tableHeader: {
    backgroundColor: "#f8fafc",
    "& .MuiTableCell-head": {
      fontWeight: 600,
      color: "#374151",
      borderBottom: "2px solid #e5e7eb",
    },
  },
  tableRow: {
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#f8fafc",
      transform: "scale(1.01)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
  },
  avatar: {
    width: 45,
    height: 45,
    border: "3px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  productAvatar: {
    width: 50,
    height: 50,
    borderRadius: 8,
    border: "2px solid #e5e7eb",
  },
  ratingStars: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    padding: theme.spacing(0.75),
    margin: theme.spacing(0.25),
    borderRadius: 8,
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  deleteButton: {
    color: "#ef4444",
    "&:hover": {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      color: "#dc2626",
    },
  },
  viewButton: {
    color: "#3b82f6",
    "&:hover": {
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      color: "#2563eb",
    },
  },
  ratingBadge: {
    padding: "4px 8px",
    borderRadius: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "white",
  },
  rating5: {
    backgroundColor: "#10b981",
  },
  rating4: {
    backgroundColor: "#3b82f6",
  },
  rating3: {
    backgroundColor: "#f59e0b",
  },
  rating2: {
    backgroundColor: "#f97316",
  },
  rating1: {
    backgroundColor: "#ef4444",
  },
  bulkActionBar: {
    padding: theme.spacing(2),
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    border: "1px solid #bae6fd",
    marginBottom: theme.spacing(2),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: "#6b7280",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(6),
  },
}));

// Simple date formatting function
const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const AdminReviewManager = () => {
  const classes = useStyles();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    rating: "",
    sortBy: "newest",
  });

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [page, rowsPerPage, filters.rating, filters.sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        sortBy: filters.sortBy,
        ...(filters.rating && { rating: filters.rating }),
      });

      const response = await axios.get(
        `${server}/review/get-all-reviews?${queryParams}`
      );

      if (response.data.success) {
        setReviews(response.data.reviews);
        setTotalReviews(response.data.totalReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${server}/review/get-review-stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleDeleteReview = async (productId, reviewId) => {
    try {
      console.log("🗑️ Deleting review:", { productId, reviewId });
      console.log(
        "🔗 Delete URL:",
        `${server}/review/admin/delete-review/${productId}/${reviewId}`
      );

      const response = await axios.delete(
        `${server}/review/admin/delete-review/${productId}/${reviewId}`,
        { withCredentials: true }
      );

      console.log("✅ Delete response:", response.data);

      if (response.data.success) {
        toast.success("Review deleted successfully");
        fetchReviews();
        fetchStats();
        setDeleteDialog(false);
        setReviewToDelete(null);
      }
    } catch (error) {
      console.error("❌ Error deleting review:", error);
      console.error("❌ Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) {
      toast.warning("Please select reviews to delete");
      return;
    }

    try {
      const reviewsToDelete = selectedReviews.map((reviewId) => {
        const review = reviews.find((r) => r._id === reviewId);
        return {
          productId: review.product._id,
          reviewId: review._id,
        };
      });

      const response = await axios.delete(
        `${server}/review/admin/delete-reviews`,
        {
          data: { reviewsToDelete },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(
          `Successfully deleted ${response.data.deletedCount} reviews`
        );
        fetchReviews();
        fetchStats();
        setBulkDeleteDialog(false);
        setSelectedReviews([]);
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error(error.response?.data?.message || "Failed to delete reviews");
    }
  };

  const handleCheckboxChange = (reviewId) => {
    setSelectedReviews((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedReviews(reviews.map((review) => review._id));
    } else {
      setSelectedReviews([]);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} style={{ color: index < rating ? "#ffd700" : "#ddd" }}>
        {index < rating ? <StarIcon size={16} /> : <StarBorderIcon size={16} />}
      </span>
    ));
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
                📝 Review Management
              </Typography>
              <Typography
                variant="body1"
                style={{ opacity: 0.9, fontSize: "1.1rem" }}
              >
                Monitor and manage all product reviews across the platform
              </Typography>
            </div>
            <Box style={{ opacity: 0.7 }}>
              <Typography
                variant="h2"
                style={{ fontWeight: 100, fontSize: "4rem" }}
              >
                ⭐
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={3} style={{ marginBottom: 32 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent className={classes.statsContent}>
              <Typography className={classes.statsNumber}>
                {stats.totalReviews || 0}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ fontWeight: 500, marginTop: 8 }}
              >
                📊 Total Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent className={classes.statsContent}>
              <Typography className={classes.statsNumber}>
                {stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ fontWeight: 500, marginTop: 8 }}
              >
                ⭐ Average Rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent className={classes.statsContent}>
              <Typography className={classes.statsNumber}>
                {stats.ratingDistribution?.[5] || 0}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ fontWeight: 500, marginTop: 8 }}
              >
                🌟 5-Star Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent className={classes.statsContent}>
              <Typography className={classes.statsNumber}>
                {stats.ratingDistribution?.[1] || 0}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ fontWeight: 500, marginTop: 8 }}
              >
                😞 1-Star Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card className={classes.filterCard}>
        <Box display="flex" alignItems="center" marginBottom={2}>
          <Typography
            variant="h6"
            style={{
              fontWeight: 600,
              color: "#374151",
              display: "flex",
              alignItems: "center",
            }}
          >
            🔍 Filters & Sorting
          </Typography>
        </Box>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel style={{ fontWeight: 500 }}>
                Filter by Rating
              </InputLabel>
              <Select
                value={filters.rating}
                onChange={(e) =>
                  setFilters({ ...filters, rating: e.target.value })
                }
                label="Filter by Rating"
                style={{ borderRadius: 8 }}
              >
                <MenuItem value="">⭐ All Ratings</MenuItem>
                <MenuItem value={5}>🌟 5 Stars</MenuItem>
                <MenuItem value={4}>⭐ 4 Stars</MenuItem>
                <MenuItem value={3}>⚡ 3 Stars</MenuItem>
                <MenuItem value={2}>😐 2 Stars</MenuItem>
                <MenuItem value={1}>😞 1 Star</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel style={{ fontWeight: 500 }}>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                label="Sort By"
                style={{ borderRadius: 8 }}
              >
                <MenuItem value="newest">📅 Newest First</MenuItem>
                <MenuItem value="oldest">📆 Oldest First</MenuItem>
                <MenuItem value="highest">⬆️ Highest Rating</MenuItem>
                <MenuItem value="lowest">⬇️ Lowest Rating</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchReviews();
                fetchStats();
              }}
              disabled={loading}
              style={{
                borderRadius: 8,
                borderColor: "#667eea",
                color: "#667eea",
                fontWeight: 600,
                padding: "8px 20px",
              }}
            >
              Refresh Data
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {selectedReviews.length > 0 && (
              <Button
                variant="contained"
                startIcon={<DeleteIcon />}
                onClick={() => setBulkDeleteDialog(true)}
                style={{
                  borderRadius: 8,
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontWeight: 600,
                  padding: "8px 20px",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                  "&:hover": {
                    backgroundColor: "#dc2626",
                  },
                }}
              >
                Delete Selected ({selectedReviews.length})
              </Button>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Bulk Action Bar */}
      {selectedReviews.length > 0 && (
        <Card className={classes.bulkActionBar}>
          <Box display="flex" alignItems="center" justifyContent="between">
            <Typography
              variant="body1"
              style={{ fontWeight: 600, color: "#0284c7" }}
            >
              {selectedReviews.length} review
              {selectedReviews.length > 1 ? "s" : ""} selected
            </Typography>
            <Button
              variant="contained"
              startIcon={<DeleteIcon />}
              onClick={() => setBulkDeleteDialog(true)}
              style={{
                marginLeft: 16,
                backgroundColor: "#ef4444",
                color: "white",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Delete Selected
            </Button>
          </Box>
        </Card>
      )}

      {/* Reviews Table */}
      <Card className={classes.tableCard}>
        <TableContainer component={Paper}>
          <Table className={classes.table}>
            <TableHead className={classes.tableHeader}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedReviews.length > 0 &&
                      selectedReviews.length < reviews.length
                    }
                    checked={
                      reviews.length > 0 &&
                      selectedReviews.length === reviews.length
                    }
                    onChange={handleSelectAll}
                    style={{ color: "#667eea" }}
                  />
                </TableCell>
                <TableCell style={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Rating</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Review</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box className={classes.loadingContainer}>
                      <CircularProgress style={{ color: "#667eea" }} />
                      <Typography
                        variant="body1"
                        style={{ marginLeft: 16, color: "#6b7280" }}
                      >
                        Loading reviews...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box className={classes.emptyState}>
                      <Typography
                        variant="h6"
                        style={{ fontSize: "3rem", marginBottom: 16 }}
                      >
                        📝
                      </Typography>
                      <Typography
                        variant="h6"
                        style={{ marginBottom: 8, fontWeight: 600 }}
                      >
                        No Reviews Found
                      </Typography>
                      <Typography variant="body2">
                        There are no reviews matching your current filters.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review, index) => (
                  <TableRow key={review._id} hover className={classes.tableRow}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedReviews.includes(review._id)}
                        onChange={() => handleCheckboxChange(review._id)}
                        style={{ color: "#667eea" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={getProductImageUrl(review.product?.image)}
                          className={classes.productAvatar}
                          style={{ marginRight: 12 }}
                        />
                        <div>
                          <Typography
                            variant="body2"
                            style={{ fontWeight: 600, marginBottom: 4 }}
                          >
                            {review.product?.name?.substring(0, 35)}...
                          </Typography>
                          <Typography
                            variant="caption"
                            style={{ color: "#6b7280", fontWeight: 500 }}
                          >
                            🏪 {review.product?.shop?.name}
                          </Typography>
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={getAvatarUrl(review.user?.avatar)}
                          className={classes.avatar}
                          style={{ marginRight: 12 }}
                        />
                        <div>
                          <Typography
                            variant="body2"
                            style={{ fontWeight: 600, marginBottom: 4 }}
                          >
                            {review.user?.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            style={{ color: "#6b7280" }}
                          >
                            {review.user?.email?.substring(0, 25)}...
                          </Typography>
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box className={classes.ratingStars}>
                          {renderStars(review.rating)}
                        </Box>
                        <span
                          className={`${classes.ratingBadge} ${
                            classes[`rating${review.rating}`]
                          }`}
                          style={{ marginLeft: 8 }}
                        >
                          {review.rating}/5
                        </span>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        style={{
                          maxWidth: 250,
                          lineHeight: 1.4,
                          color: "#374151",
                          fontStyle: review.comment ? "normal" : "italic",
                        }}
                      >
                        {review.comment
                          ? `"${review.comment.substring(0, 60)}..."`
                          : "No comment provided"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        style={{ fontWeight: 500, color: "#6b7280" }}
                      >
                        📅 {formatDate(review.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedReview(review);
                            setViewDialog(true);
                          }}
                          className={`${classes.actionButton} ${classes.viewButton}`}
                        >
                          <ViewIcon size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setReviewToDelete(review);
                            setDeleteDialog(true);
                          }}
                          className={`${classes.actionButton} ${classes.deleteButton}`}
                        >
                          <DeleteIcon size={18} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalReviews}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          style={{
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e5e7eb",
            "& .MuiTablePagination-toolbar": {
              paddingLeft: 24,
              paddingRight: 24,
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontWeight: 500,
                color: "#374151",
              },
          }}
        />
      </Card>

      {/* View Review Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogTitle
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontWeight: 600,
            fontSize: "1.5rem",
          }}
        >
          📋 Review Details
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card style={{ padding: 16, backgroundColor: "#f8fafc" }}>
                  <Typography variant="h6" gutterBottom>
                    Product Information
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      src={getProductImageUrl(selectedReview.product?.image)}
                      style={{ width: 60, height: 60, marginRight: 16 }}
                    />
                    <div>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        {selectedReview.product?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Shop: {selectedReview.product?.shop?.name}
                      </Typography>
                    </div>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card style={{ padding: 16, backgroundColor: "#f8fafc" }}>
                  <Typography variant="h6" gutterBottom>
                    Customer Information
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      src={getAvatarUrl(selectedReview.user?.avatar)}
                      style={{ width: 60, height: 60, marginRight: 16 }}
                    />
                    <div>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        {selectedReview.user?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedReview.user?.email}
                      </Typography>
                    </div>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card style={{ padding: 16 }}>
                  <Typography variant="h6" gutterBottom>
                    Review Content
                  </Typography>
                  <Box
                    className={classes.ratingStars}
                    style={{ marginBottom: 16 }}
                  >
                    {renderStars(selectedReview.rating)}
                    <Typography variant="h6" style={{ marginLeft: 8 }}>
                      {selectedReview.rating} out of 5
                    </Typography>
                  </Box>
                  <Typography variant="body1" style={{ marginBottom: 16 }}>
                    {selectedReview.comment}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Posted on {formatDate(selectedReview.createdAt)}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions
          style={{ padding: "16px 24px", backgroundColor: "#f8fafc" }}
        >
          <Button
            onClick={() => setViewDialog(false)}
            style={{
              borderRadius: 8,
              padding: "8px 20px",
              fontWeight: 600,
              color: "#6b7280",
            }}
          >
            Close
          </Button>
          {selectedReview && (
            <Button
              onClick={() => {
                setReviewToDelete(selectedReview);
                setViewDialog(false);
                setDeleteDialog(true);
              }}
              style={{
                borderRadius: 8,
                padding: "8px 20px",
                fontWeight: 600,
                backgroundColor: "#ef4444",
                color: "white",
                marginLeft: 8,
              }}
            >
              Delete Review
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        PaperProps={{
          style: {
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(239, 68, 68, 0.2)",
          },
        }}
      >
        <DialogTitle
          style={{
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            fontWeight: 600,
            borderBottom: "1px solid #fecaca",
          }}
        >
          🗑️ Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this review? This action cannot be
            undone.
          </Typography>
          {reviewToDelete && (
            <Card
              style={{ marginTop: 16, padding: 16, backgroundColor: "#f8fafc" }}
            >
              <Box className={classes.ratingStars} style={{ marginBottom: 8 }}>
                {renderStars(reviewToDelete.rating)}
                <Typography variant="body2" style={{ marginLeft: 8 }}>
                  {reviewToDelete.rating} stars
                </Typography>
              </Box>
              <Typography variant="body2" style={{ marginBottom: 8 }}>
                "{reviewToDelete.comment}"
              </Typography>
              <Typography variant="caption" color="textSecondary">
                By {reviewToDelete.user?.name} on {reviewToDelete.product?.name}
              </Typography>
            </Card>
          )}
        </DialogContent>
        <DialogActions
          style={{ padding: "16px 24px", backgroundColor: "#fef2f2" }}
        >
          <Button
            onClick={() => setDeleteDialog(false)}
            style={{
              borderRadius: 8,
              padding: "8px 20px",
              fontWeight: 600,
              border: "1px solid #d1d5db",
              color: "#6b7280",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (reviewToDelete) {
                handleDeleteReview(
                  reviewToDelete.product._id,
                  reviewToDelete._id
                );
              }
            }}
            style={{
              borderRadius: 8,
              padding: "8px 20px",
              fontWeight: 600,
              backgroundColor: "#ef4444",
              color: "white",
              marginLeft: 8,
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
            }}
          >
            Delete Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialog}
        onClose={() => setBulkDeleteDialog(false)}
        PaperProps={{
          style: {
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(239, 68, 68, 0.2)",
          },
        }}
      >
        <DialogTitle
          style={{
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            fontWeight: 600,
            borderBottom: "1px solid #fecaca",
          }}
        >
          🗑️ Confirm Bulk Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedReviews.length} selected
            reviews? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions
          style={{ padding: "16px 24px", backgroundColor: "#fef2f2" }}
        >
          <Button
            onClick={() => setBulkDeleteDialog(false)}
            style={{
              borderRadius: 8,
              padding: "8px 20px",
              fontWeight: 600,
              border: "1px solid #d1d5db",
              color: "#6b7280",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkDelete}
            style={{
              borderRadius: 8,
              padding: "8px 20px",
              fontWeight: 600,
              backgroundColor: "#ef4444",
              color: "white",
              marginLeft: 8,
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
            }}
          >
            Delete {selectedReviews.length} Reviews
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminReviewManager;
