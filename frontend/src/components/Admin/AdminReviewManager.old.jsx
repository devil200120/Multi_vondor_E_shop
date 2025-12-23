import React, { useEffect, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
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
  IconButton,

  Avatar,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tooltip,
} from "@material-ui/core";
import {
  AiFillDelete as DeleteIcon,
  AiFillEye as ViewIcon,
  AiFillStar as StarIcon,
  AiOutlineStar as StarBorderIcon,
  AiFillDelete as BulkDeleteIcon,
  AiOutlineReload as RefreshIcon,
  AiOutlineSearch as SearchIcon,
  AiFillFund as TrendingUpIcon,
  AiFillFileText as AssessmentIcon,
} from "react-icons/ai";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { getAvatarUrl, getProductImageUrl } from "../../utils/mediaUtils";
// Simple date formatting function to replace date-fns
const formatDate = (date, formatStr) => {
  const d = new Date(date);
  const month = d.toLocaleString('default', { month: 'short' });
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  
  if (formatStr === "MMM dd, yyyy") {
    return `${month} ${day}, ${year}`;
  } else if (formatStr === "MMMM dd, yyyy 'at' hh:mm a") {
    const time = d.toLocaleString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    return `${month} ${day}, ${year} at ${time}`;
  }
  return d.toLocaleDateString();
};

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    marginBottom: theme.spacing(3),
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    color: "white",
  },
  statsGrid: {
    marginBottom: theme.spacing(3),
  },
  statsCard: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "white",
    borderRadius: theme.spacing(2),
    height: "100%",
  },
  dataGrid: {
    backgroundColor: "white",
    borderRadius: theme.spacing(2),
    border: "1px solid #e2e8f0",
    "& .MuiDataGrid-root": {
      border: "none",
      fontSize: "14px",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "1px solid #f0f0f0",
      padding: theme.spacing(1),
      display: "flex",
      alignItems: "center",
      minHeight: "60px",
      maxHeight: "80px",
      overflow: "hidden",
    },
    "& .MuiDataGrid-row": {
      minHeight: "60px !important",
      maxHeight: "80px !important",
      "&:hover": {
        backgroundColor: "#f8fafc",
      },
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#f8fafc",
      borderBottom: "2px solid #e2e8f0",
      minHeight: "56px !important",
      "& .MuiDataGrid-columnHeader": {
        padding: theme.spacing(1),
        fontWeight: 600,
      },
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: 600,
      fontSize: "14px",
    },
    "& .MuiDataGrid-viewport": {
      overflow: "hidden auto",
    },
  },
  filterContainer: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: "white",
    borderRadius: theme.spacing(1),
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "center",
    flexWrap: "wrap",
  },
  reviewDialog: {
    "& .MuiDialog-paper": {
      borderRadius: theme.spacing(2),
      maxWidth: 600,
    },
  },
  ratingDisplay: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  productInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  actionButton: {
    minWidth: "auto",
    padding: theme.spacing(0.5),
  },
}));

const AdminReviewManager = () => {
  const classes = useStyles();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [viewReviewDialog, setViewReviewDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalReviews: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    rating: "",
    sortBy: "newest",
    search: "",
  });

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [pagination.page, filters.rating, filters.sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: 12,
        sortBy: filters.sortBy,
        ...(filters.rating && { rating: filters.rating }),
      });

      const response = await axios.get(
        `${server}/review/get-all-reviews?${queryParams}`
      );

      if (response.data.success) {
        // Map reviews to include id field for DataGrid
        const reviewsWithId = response.data.reviews.map(review => ({
          ...review,
          id: review._id, // DataGrid requires 'id' field
        }));
        setReviews(reviewsWithId);
        setPagination({
          page: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalReviews: response.data.totalReviews,
        });
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
      const response = await axios.delete(
        `${server}/review/admin/delete-review/${productId}/${reviewId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Review deleted successfully");
        fetchReviews();
        fetchStats();
        setDeleteDialog(false);
        setReviewToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete review"
      );
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
        if (response.data.errorCount > 0) {
          toast.warning(`${response.data.errorCount} reviews failed to delete`);
        }
        fetchReviews();
        fetchStats();
        setBulkDeleteDialog(false);
        setSelectedReviews([]);
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete reviews"
      );
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index}>
        {index < rating ? (
          <StarIcon style={{ color: "#ffd700", fontSize: 16 }} />
        ) : (
          <StarBorderIcon style={{ color: "#ddd", fontSize: 16 }} />
        )}
      </span>
    ));
  };

  const columns = [
    {
      field: "product",
      headerName: "Product",
      width: 250,
      renderCell: (params) => (
        <div className={classes.productInfo}>
          <Avatar
            src={getProductImageUrl(params.row.product?.image)}
            alt={params.row.product?.name}
            style={{ width: 32, height: 32 }}
          />
          <div>
            <Typography variant="body2" style={{ fontWeight: 500 }}>
              {params.row.product?.name?.substring(0, 30)}...
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {params.row.product?.shop?.name}
            </Typography>
          </div>
        </div>
      ),
    },
    {
      field: "user",
      headerName: "User",
      width: 200,
      renderCell: (params) => (
        <div className={classes.userInfo}>
          <Avatar
            src={getAvatarUrl(params.row.user?.avatar)}
            alt={params.row.user?.name}
            style={{ width: 32, height: 32 }}
          />
          <div>
            <Typography variant="body2" style={{ fontWeight: 500 }}>
              {params.row.user?.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {params.row.user?.email}
            </Typography>
          </div>
        </div>
      ),
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 120,
      renderCell: (params) => (
        <div className={classes.ratingDisplay}>
          {renderStars(params.row.rating)}
          <Typography variant="body2" style={{ marginLeft: 8 }}>
            {params.row.rating}
          </Typography>
        </div>
      ),
    },
    {
      field: "comment",
      headerName: "Comment",
      width: 300,
      renderCell: (params) => (
        <Tooltip title={params.row.comment}>
          <Typography variant="body2" style={{ fontSize: 12 }}>
            {params.row.comment?.substring(0, 50)}
            {params.row.comment?.length > 50 && "..."}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" style={{ fontSize: 12 }}>
          {formatDate(new Date(params.row.createdAt), "MMM dd, yyyy")}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <div>
          <Tooltip title="View Review">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedReview(params.row);
                setViewReviewDialog(true);
              }}
              className={classes.actionButton}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Review">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => {
                setReviewToDelete(params.row);
                setDeleteDialog(true);
              }}
              className={classes.actionButton}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className={classes.root}>
      {/* Header */}
      <Card className={classes.header}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <div>
              <Typography variant="h4" style={{ fontWeight: 600, marginBottom: 8 }}>
                Review Management
              </Typography>
              <Typography variant="body1" style={{ opacity: 0.9 }}>
                Monitor and manage all product reviews across the platform
              </Typography>
            </div>
            <AssessmentIcon style={{ fontSize: 64, opacity: 0.3 }} />
          </Box>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} className={classes.statsGrid}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent style={{ textAlign: "center" }}>
              <TrendingUpIcon style={{ fontSize: 48, marginBottom: 8 }} />
              <Typography variant="h4" style={{ fontWeight: 600 }}>
                {stats.totalReviews || 0}
              </Typography>
              <Typography variant="body2">Total Reviews</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent style={{ textAlign: "center" }}>
              <StarIcon style={{ fontSize: 48, marginBottom: 8 }} />
              <Typography variant="h4" style={{ fontWeight: 600 }}>
                {stats.averageRating || 0}
              </Typography>
              <Typography variant="body2">Average Rating</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent style={{ textAlign: "center" }}>
              <div className={classes.ratingDisplay} style={{ justifyContent: "center", marginBottom: 8 }}>
                {renderStars(5)}
              </div>
              <Typography variant="h4" style={{ fontWeight: 600 }}>
                {stats.ratingDistribution?.[5] || 0}
              </Typography>
              <Typography variant="body2">5-Star Reviews</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent style={{ textAlign: "center" }}>
              <div className={classes.ratingDisplay} style={{ justifyContent: "center", marginBottom: 8 }}>
                {renderStars(1)}
              </div>
              <Typography variant="h4" style={{ fontWeight: 600 }}>
                {stats.ratingDistribution?.[1] || 0}
              </Typography>
              <Typography variant="body2">1-Star Reviews</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card className={classes.filterContainer}>
        <TextField
          label="Search reviews"
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          InputProps={{
            startAdornment: <SearchIcon color="action" />,
          }}
          style={{ minWidth: 200 }}
        />
        
        <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
          <InputLabel>Rating</InputLabel>
          <Select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            label="Rating"
          >
            <MenuItem value="">All Ratings</MenuItem>
            <MenuItem value={5}>5 Stars</MenuItem>
            <MenuItem value={4}>4 Stars</MenuItem>
            <MenuItem value={3}>3 Stars</MenuItem>
            <MenuItem value={2}>2 Stars</MenuItem>
            <MenuItem value={1}>1 Star</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            label="Sort By"
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="highest">Highest Rating</MenuItem>
            <MenuItem value="lowest">Lowest Rating</MenuItem>
          </Select>
        </FormControl>

        <div style={{ flexGrow: 1 }} />

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            fetchReviews();
            fetchStats();
          }}
          disabled={loading}
        >
          Refresh
        </Button>

        {selectedReviews.length > 0 && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<BulkDeleteIcon />}
            onClick={() => setBulkDeleteDialog(true)}
          >
            Delete Selected ({selectedReviews.length})
          </Button>
        )}
      </Card>

      {/* Reviews DataGrid */}
      <Card className={classes.dataGrid}>
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={reviews}
            columns={columns}
            pageSize={12}
            rowsPerPageOptions={[12]}
            checkboxSelection
            disableSelectionOnClick
            loading={loading}
            onSelectionModelChange={(newSelection) => {
              setSelectedReviews(newSelection);
            }}
            selectionModel={selectedReviews}
            pagination
            page={pagination.page - 1}
            pageCount={pagination.totalPages}
            onPageChange={(params) => {
              setPagination({ ...pagination, page: params.page + 1 });
            }}
            components={{
              LoadingOverlay: () => (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <CircularProgress />
                </div>
              ),
            }}
          />
        </div>
      </Card>

      {/* View Review Dialog */}
      <Dialog
        open={viewReviewDialog}
        onClose={() => setViewReviewDialog(false)}
        className={classes.reviewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Review Details</Typography>
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card style={{ padding: 16, backgroundColor: "#f8fafc" }}>
                  <Typography variant="h6" gutterBottom>
                    Product Information
                  </Typography>
                  <div className={classes.productInfo}>
                    <Avatar
                      src={getProductImageUrl(selectedReview.product?.image)}
                      alt={selectedReview.product?.name}
                      style={{ width: 60, height: 60 }}
                    />
                    <div>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        {selectedReview.product?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Shop: {selectedReview.product?.shop?.name}
                      </Typography>
                    </div>
                  </div>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card style={{ padding: 16, backgroundColor: "#f8fafc" }}>
                  <Typography variant="h6" gutterBottom>
                    Customer Information
                  </Typography>
                  <div className={classes.userInfo}>
                    <Avatar
                      src={getAvatarUrl(selectedReview.user?.avatar)}
                      alt={selectedReview.user?.name}
                      style={{ width: 60, height: 60 }}
                    />
                    <div>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        {selectedReview.user?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedReview.user?.email}
                      </Typography>
                    </div>
                  </div>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card style={{ padding: 16 }}>
                  <Typography variant="h6" gutterBottom>
                    Review Content
                  </Typography>
                  <div className={classes.ratingDisplay} style={{ marginBottom: 16 }}>
                    {renderStars(selectedReview.rating)}
                    <Typography variant="h6" style={{ marginLeft: 8 }}>
                      {selectedReview.rating} out of 5
                    </Typography>
                  </div>
                  <Typography variant="body1" style={{ marginBottom: 16 }}>
                    {selectedReview.comment}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Posted on {formatDate(new Date(selectedReview.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewReviewDialog(false)}>Close</Button>
          {selectedReview && (
            <Button
              color="secondary"
              onClick={() => {
                setReviewToDelete(selectedReview);
                setViewReviewDialog(false);
                setDeleteDialog(true);
              }}
            >
              Delete Review
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this review? This action cannot be undone.
          </Typography>
          {reviewToDelete && (
            <Card style={{ marginTop: 16, padding: 16, backgroundColor: "#f8fafc" }}>
              <div className={classes.ratingDisplay} style={{ marginBottom: 8 }}>
                {renderStars(reviewToDelete.rating)}
                <Typography variant="body2" style={{ marginLeft: 8 }}>
                  {reviewToDelete.rating} stars
                </Typography>
              </div>
              <Typography variant="body2" style={{ marginBottom: 8 }}>
                "{reviewToDelete.comment}"
              </Typography>
              <Typography variant="caption" color="textSecondary">
                By {reviewToDelete.user?.name} on {reviewToDelete.product?.name}
              </Typography>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            color="secondary"
            onClick={() => {
              if (reviewToDelete) {
                handleDeleteReview(reviewToDelete.product._id, reviewToDelete._id);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialog} onClose={() => setBulkDeleteDialog(false)}>
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedReviews.length} selected reviews? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteDialog(false)}>Cancel</Button>
          <Button color="secondary" onClick={handleBulkDelete}>
            Delete {selectedReviews.length} Reviews
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminReviewManager;