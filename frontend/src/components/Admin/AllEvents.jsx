import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import { server } from "../../server";
import Loader from "../Layout/Loader";
import styles from "../../styles/styles";

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${server}/event/admin-all-events`, { withCredentials: true })
      .then((res) => {
        setEvents(res.data.events);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      });
  }, []);

  const columns = [
    {
      field: "id",
      headerName: "Event Id",
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
      headerName: "Event Name",
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
        const now = new Date();
        const startDate = new Date(params.row.startDate);
        const endDate = new Date(params.row.endDate);

        let status = "upcoming";
        let statusClass = "bg-blue-100 text-blue-800";

        if (now >= startDate && now <= endDate) {
          status = "active";
          statusClass = "bg-green-100 text-green-800";
        } else if (now > endDate) {
          status = "ended";
          statusClass = "bg-gray-100 text-gray-800";
        }

        return (
          <div
            className={`font-medium px-2 py-1 rounded-full text-xs capitalize ${statusClass}`}
          >
            {status}
          </div>
        );
      },
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
            <Link to={`/product/${params.id}?isEvent=true`}>
              <Button
                className="!min-w-0 !p-2 !text-primary-600 hover:!bg-primary-50 !rounded-lg transition-all duration-200"
                title="View Event"
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

  events &&
    events.forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        price: "₹" + item.discountPrice,
        Stock: item.stock,
        sold: item.sold_out,
        startDate: item.start_Date,
        endDate: item.Finish_Date,
      });
    });

  // Calculate event statistics
  const now = new Date();
  const activeEvents = events.filter((event) => {
    const startDate = new Date(event.start_Date);
    const endDate = new Date(event.Finish_Date);
    return now >= startDate && now <= endDate;
  }).length;

  const upcomingEvents = events.filter((event) => {
    const startDate = new Date(event.start_Date);
    return now < startDate;
  }).length;

  const endedEvents = events.filter((event) => {
    const endDate = new Date(event.Finish_Date);
    return now > endDate;
  }).length;

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
            {events.length}
          </div>
          <div className="text-sm text-gray-600">Total Events</div>
        </div>
        <div className={`${styles.card} ${styles.card_padding} text-center`}>
          <div className="text-2xl font-bold text-green-600">
            {activeEvents}
          </div>
          <div className="text-sm text-gray-600">Active Events</div>
        </div>
        <div className={`${styles.card} ${styles.card_padding} text-center`}>
          <div className="text-2xl font-bold text-blue-600">
            {upcomingEvents}
          </div>
          <div className="text-sm text-gray-600">Upcoming Events</div>
        </div>
        <div className={`${styles.card} ${styles.card_padding} text-center`}>
          <div className="text-2xl font-bold text-gray-600">{endedEvents}</div>
          <div className="text-sm text-gray-600">Ended Events</div>
        </div>
      </div>

      {/* Events Table */}
      <div className={`${styles.card} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Events List</h3>
          <p className="text-sm text-gray-600">
            Manage all events in your marketplace
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

export default AllEvents;
