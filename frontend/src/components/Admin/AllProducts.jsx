import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect, useState } from "react";
import {
  AiOutlineEye,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlinePlus,
} from "react-icons/ai";
import { MdPublish, MdUnpublished } from "react-icons/md";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../redux/actions/category";
import Loader from "../Layout/Loader";
import axios from "axios";
import { server } from "../../server";
import styles from "../../styles/styles";
import ProductFormModal from "./ProductFormModal";
import { toast } from "react-toastify";
import { useCurrency } from "../../context/CurrencyContext";

const AllProducts = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);
  const { formatPrice } = useCurrency();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${server}/product/admin-all-products`, {
        withCredentials: true,
      });
      setData(res.data.products);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    console.log("Categories loaded:", categories);
  }, [categories]);

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await axios.delete(
          `${server}/product/admin-delete-product/${product._id}`,
          {
            withCredentials: true,
          }
        );
        toast.success("Product deleted successfully!");
        fetchProducts(); // Refresh the list
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleTogglePublish = async (product) => {
    const newStatus = !product.isPublished;
    const action = newStatus ? "publish" : "unpublish";

    if (
      window.confirm(`Are you sure you want to ${action} "${product.name}"?`)
    ) {
      try {
        await axios.patch(
          `${server}/product/admin-toggle-product-status/${product._id}`,
          {
            isPublished: newStatus,
          },
          {
            withCredentials: true,
          }
        );
        toast.success(`Product ${action}ed successfully!`);
        fetchProducts(); // Refresh the list
      } catch (error) {
        console.error("Toggle status error:", error);
        toast.error(`Failed to ${action} product`);
      }
    }
  };

  const handleSubmit = async (formData, productId) => {
    setFormLoading(true);
    try {
      if (isEdit && productId) {
        await axios.put(
          `${server}/product/admin-update-product/${productId}`,
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Product updated successfully!");
      } else {
        await axios.post(`${server}/product/admin-create-product`, formData, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Product created successfully!");
      }
      fetchProducts(); // Refresh the list
      setIsModalOpen(false);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        isEdit ? "Failed to update product" : "Failed to create product"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setIsEdit(false);
  };

  const columns = [
    {
      field: "id",
      headerName: "Product Id",
      minWidth: 200,
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div
          className="text-xs font-mono text-gray-600 truncate"
          title={params.value}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      minWidth: 250,
      flex: 1.5,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <div
          className="font-medium text-gray-900 truncate"
          title={params.value}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 120,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="font-semibold text-primary-600">{params.value}</div>
      ),
    },
    {
      field: "Stock",
      headerName: "Stock",
      type: "number",
      minWidth: 100,
      flex: 0.6,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div
          className={`font-medium px-2 py-1 rounded-full text-xs ${
            params.value > 50
              ? "bg-green-100 text-green-800"
              : params.value > 10
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "sold",
      headerName: "Sold",
      type: "number",
      minWidth: 100,
      flex: 0.6,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="font-medium text-gray-700">{params.value || 0}</div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 0.7,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const product = data?.find((p) => p._id === params.id);
        const isPublished = product?.isPublished !== false; // Default to true if undefined

        return (
          <div
            className={`font-medium px-2 py-1 rounded-full text-xs capitalize ${
              isPublished
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {isPublished ? "Published" : "Unpublished"}
          </div>
        );
      },
    },
    {
      field: "seller",
      headerName: "Type",
      minWidth: 150,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const product = data?.find((p) => p._id === params.id);
        const isSellerProduct = product?.isSellerProduct;
        const isAdminTagged = product?.isAdminTagged;

        if (isSellerProduct && product.sellerShop) {
          return (
            <div className="space-y-1">
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isAdminTagged
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {isAdminTagged ? "👑 Admin Tagged" : "🏪 Seller Product"}
              </div>
              <div
                className="text-xs text-gray-600 truncate"
                title={product.sellerShop.name}
              >
                {product.sellerShop.name}
              </div>
            </div>
          );
        }

        return (
          <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
            Own Product
          </div>
        );
      },
    },
    {
      field: "Preview",
      flex: 1,
      minWidth: 200,
      headerName: "Actions",
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const product = data?.find((p) => p._id === params.id);
        const isPublished = product?.isPublished !== false;

        return (
          <div className="flex justify-center space-x-2">
            <Link to={`/product/${params.id}`}>
              <Button
                className="!min-w-0 !p-2 !text-blue-600 hover:!bg-blue-50 !rounded-lg transition-all duration-200"
                title="View Product"
              >
                <AiOutlineEye size={16} />
              </Button>
            </Link>
            <Button
              className="!min-w-0 !p-2 !text-green-600 hover:!bg-green-50 !rounded-lg transition-all duration-200"
              title="Edit Product"
              onClick={() => handleEdit(product)}
            >
              <AiOutlineEdit size={16} />
            </Button>
            <Button
              className={`!min-w-0 !p-2 !rounded-lg transition-all duration-200 ${
                isPublished
                  ? "!text-orange-600 hover:!bg-orange-50"
                  : "!text-green-600 hover:!bg-green-50"
              }`}
              title={isPublished ? "Unpublish Product" : "Publish Product"}
              onClick={() => handleTogglePublish(product)}
            >
              {isPublished ? (
                <MdUnpublished size={16} />
              ) : (
                <MdPublish size={16} />
              )}
            </Button>
            <Button
              className="!min-w-0 !p-2 !text-red-600 hover:!bg-red-50 !rounded-lg transition-all duration-200"
              title="Delete Product"
              onClick={() => handleDelete(product)}
            >
              <AiOutlineDelete size={16} />
            </Button>
          </div>
        );
      },
    },
  ];

  const row = [];

  data &&
    data.forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        price: formatPrice(item.discountPrice),

        Stock: item.stock,
        sold: item?.sold_out,
      });
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 400px:grid-cols-2 800px:grid-cols-4 gap-4 mb-6">
        <div className={`${styles.card} ${styles.card_padding} text-center`}>
          <div className="text-2xl font-bold text-primary-600">
            {data.length}
          </div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        <div className={`${styles.card} ${styles.card_padding} text-center`}>
          <div className="text-2xl font-bold text-green-600">
            {data.filter((item) => item.stock > 10).length}
          </div>
          <div className="text-sm text-gray-600">In Stock</div>
        </div>
        <div className={`${styles.card} ${styles.card_padding} text-center`}>
          <div className="text-2xl font-bold text-yellow-600">
            {data.filter((item) => item.stock <= 10 && item.stock > 0).length}
          </div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </div>
        <div className={`${styles.card} ${styles.card_padding} text-center`}>
          <div className="text-2xl font-bold text-red-600">
            {data.filter((item) => item.stock === 0).length}
          </div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </div>
      </div>

      {/* Products Table */}
      <div className={`${styles.card} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Products List
            </h3>
            <p className="text-sm text-gray-600">
              Manage all products in your marketplace
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="!bg-primary-600 !text-white !px-4 !py-2 !rounded-lg hover:!bg-primary-700 !flex !items-center !space-x-2 !normal-case !font-medium"
          >
            <AiOutlinePlus size={18} />
            <span>Create Product</span>
          </Button>
        </div>

        <div className="h-[600px] w-full">
          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            autoHeight={false}
            className="!border-0"
            sx={{
              "& .MuiDataGrid-main": {
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  "& .MuiDataGrid-columnHeader": {
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#374151",
                    padding: "12px",
                  },
                },
                "& .MuiDataGrid-cell": {
                  padding: "12px",
                  borderBottom: "1px solid #f1f5f9",
                  fontSize: "0.875rem",
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                  },
                },
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              },
            }}
          />
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        open={isModalOpen}
        onClose={handleModalClose}
        product={selectedProduct}
        onSubmit={handleSubmit}
        isEdit={isEdit}
        loading={formLoading}
        categories={categories || []}
      />
    </div>
  );
};

export default AllProducts;
