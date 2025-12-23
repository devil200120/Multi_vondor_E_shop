import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye, AiOutlinePlus } from "react-icons/ai";
import { MdVideoLibrary, MdVisibility, MdThumbUp } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";

const AllVideoBanners = () => {
  const { seller } = useSelector((state) => state.seller);
  const [videoBanners, setVideoBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVideoBanners();
  }, [currentPage]);

  const fetchVideoBanners = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${server}/video-banner/my-video-banners?page=${currentPage}&limit=10`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setVideoBanners(response.data.videoBanners);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching video banners:", error);
      toast.error(error.response?.data?.message || "Failed to fetch video banners");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm("Are you sure you want to delete this video banner?")) {
      try {
        await axios.delete(
          `${server}/video-banner/delete-video-banner/${bannerId}`,
          { withCredentials: true }
        );
        toast.success("Video banner deleted successfully!");
        fetchVideoBanners();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete video banner");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return "✅";
      case "pending":
        return "⏳";
      case "rejected":
        return "❌";
      case "inactive":
        return "⏸️";
      default:
        return "📝";
    }
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (loading && videoBanners.length === 0) {
    return (
      <div className="w-full mx-8 pt-1 mt-8 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-8 pt-1 mt-8 bg-white">
      <div className="w-full p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Banners</h1>
            <p className="text-gray-600">Manage your promotional video banners</p>
          </div>
          <Link
            to="/dashboard-create-video-banner"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          >
            <AiOutlinePlus className="mr-2" size={20} />
            Create Video Banner
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <MdVideoLibrary className="text-3xl mr-4" />
              <div>
                <p className="text-blue-100">Total Banners</p>
                <p className="text-2xl font-bold">{videoBanners.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <MdThumbUp className="text-3xl mr-4" />
              <div>
                <p className="text-green-100">Approved</p>
                <p className="text-2xl font-bold">
                  {videoBanners.filter(b => b.approvalStatus === "approved").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <MdVisibility className="text-3xl mr-4" />
              <div>
                <p className="text-yellow-100">Pending</p>
                <p className="text-2xl font-bold">
                  {videoBanners.filter(b => b.approvalStatus === "pending").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <MdVisibility className="text-3xl mr-4" />
              <div>
                <p className="text-purple-100">Total Views</p>
                <p className="text-2xl font-bold">
                  {videoBanners.reduce((sum, banner) => sum + (banner.views || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Banners List */}
        {videoBanners.length === 0 ? (
          <div className="text-center py-16">
            <MdVideoLibrary className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No video banners yet</h3>
            <p className="text-gray-500 mb-6">Create your first video banner to promote your products</p>
            <Link
              to="/dashboard-create-video-banner"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <AiOutlinePlus className="mr-2" size={20} />
              Create Your First Video Banner
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoBanners.map((banner) => (
                <div key={banner._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-gray-100">
                    {banner.thumbnailUrl ? (
                      <img
                        src={banner.thumbnailUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MdVideoLibrary className="text-4xl text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(banner.approvalStatus)}`}>
                        <span className="mr-1">{getStatusIcon(banner.approvalStatus)}</span>
                        {banner.approvalStatus ? banner.approvalStatus.charAt(0).toUpperCase() + banner.approvalStatus.slice(1) : 'Pending'}
                      </span>
                    </div>
                    {banner.videoUrl && (
                      <button
                        onClick={() => {
                          setSelectedBanner(banner);
                          setShowPreviewModal(true);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-200"
                      >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-4 border-l-blue-600 border-y-2 border-y-transparent ml-1"></div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {banner.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {banner.description}
                    </p>

                    {/* Product Info */}
                    {banner.productId && (
                      <div className="mb-3 p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500 mb-1">Linked Product:</p>
                        <p className="text-sm font-medium text-gray-900">
                          {banner.productId.name}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>👁️ {banner.views || 0} views</span>
                      <span>👆 {banner.clicks || 0} clicks</span>
                      <span>{formatDate(banner.createdAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedBanner(banner);
                          setShowPreviewModal(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <AiOutlineEye className="mr-1" />
                        Preview
                      </button>
                      <div className="flex space-x-2">
                        <Link
                          to={`/dashboard-edit-video-banner/${banner._id}`}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <AiOutlineEdit className="mr-1" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-50"
                        >
                          <AiOutlineDelete className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Preview Modal */}
        {showPreviewModal && selectedBanner && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{selectedBanner.title}</h3>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      setSelectedBanner(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                {selectedBanner.videoUrl && (
                  <div className="aspect-video mb-4">
                    <video
                      src={selectedBanner.videoUrl}
                      controls
                      className="w-full h-full rounded"
                      poster={selectedBanner.thumbnailUrl}
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Description:</h4>
                    <p className="text-gray-600">{selectedBanner.description}</p>
                  </div>
                  
                  {selectedBanner.productId && (
                    <div>
                      <h4 className="font-medium text-gray-900">Linked Product:</h4>
                      <p className="text-gray-600">{selectedBanner.productId.name}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Priority:</h4>
                      <p className="text-gray-600">{selectedBanner.priority}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Status:</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBanner.approvalStatus)}`}>
                        {selectedBanner.approvalStatus ? selectedBanner.approvalStatus.charAt(0).toUpperCase() + selectedBanner.approvalStatus.slice(1) : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllVideoBanners;