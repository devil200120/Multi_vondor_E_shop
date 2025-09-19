import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import axios from "axios";
import { server } from "../../server";
import { useState } from "react";
import styles from "../../styles/styles";

const AllProducts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${server}/product/admin-all-products`, { withCredentials: true })
      .then((res) => {
        setData(res.data.products);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

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
      field: "Preview",
      flex: 0.5,
      minWidth: 80,
      headerName: "Actions",
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        return (
          <div className="flex justify-center">
            <Link to={`/product/${params.id}`}>
              <Button
                className="!min-w-0 !p-2 !text-primary-600 hover:!bg-primary-50 !rounded-lg transition-all duration-200"
                title="View Product"
              >
                <AiOutlineEye size={18} />
              </Button>
            </Link>
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
                price: "₹" + item.discountPrice,

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
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Products List</h3>
          <p className="text-sm text-gray-600">
            Manage all products in your marketplace
          </p>
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
    </div>
  );
};

export default AllProducts;
