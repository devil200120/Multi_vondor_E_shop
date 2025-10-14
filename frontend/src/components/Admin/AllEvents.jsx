import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect, useState } from "react";
import {
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlineEdit,
  AiOutlinePlus,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  deleteEventAdmin,
  getAllEventsAdmin,
  createEventAdmin,
  updateEventAdmin,
} from "../../redux/actions/event";
import { toast } from "react-toastify";
import Loader from "../Layout/Loader";
import styles from "../../styles/styles";
import EventFormModal from "./EventFormModal";

const AllEvents = () => {
  const { allEvents, isLoading, message, error } = useSelector(
    (state) => state.events
  );

  const dispatch = useDispatch();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    dispatch(getAllEventsAdmin());
  }, [dispatch]);

  // Handle delete success/error messages
  useEffect(() => {
    if (message) {
      toast.success(message);
      // Clear the message after showing
      dispatch({ type: "clearMessages" });
    }
    if (error) {
      toast.error(error);
      // Clear the error after showing
      dispatch({ type: "clearMessages" });
    }
  }, [message, error, dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await dispatch(deleteEventAdmin(id));
        // Success message will be handled by useEffect when message state updates
      } catch (error) {
        // Error message will be handled by useEffect when error state updates
        console.error("Delete failed:", error);
      }
    }
  };

  const handleCreate = () => {
    setSelectedEvent(null);
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData, eventId) => {
    setFormLoading(true);
    try {
      if (isEdit && eventId) {
        await dispatch(updateEventAdmin(eventId, formData));
        toast.success("Event updated successfully!");
      } else {
        await dispatch(createEventAdmin(formData));
        toast.success("Event created successfully!");
      }
      dispatch(getAllEventsAdmin());
      setIsModalOpen(false);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(isEdit ? "Failed to update event" : "Failed to create event");
    } finally {
      setFormLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setIsEdit(false);
  };

  const columns = [
    { field: "id", headerName: "Product Id", minWidth: 150, flex: 0.7 },
    {
      field: "name",
      headerName: "Name",
      minWidth: 180,
      flex: 1.4,
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 100,
      flex: 0.6,
    },
    {
      field: "Stock",
      headerName: "Stock",
      type: "number",
      minWidth: 80,
      flex: 0.5,
    },

    {
      field: "sold",
      headerName: "Sold out",
      type: "number",
      minWidth: 130,
      flex: 0.6,
    },
    {
      field: "Preview",
      flex: 0.8,
      minWidth: 150,
      headerName: "Actions",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        const event = allEvents?.find((e) => e._id === params.id);
        return (
          <div className="flex space-x-2">
            <Link to={`/product/${params.id}?isEvent=true`}>
              <Button title="View Event">
                <AiOutlineEye size={20} />
              </Button>
            </Link>
            <Button title="Edit Event" onClick={() => handleEdit(event)}>
              <AiOutlineEdit size={20} />
            </Button>
          </div>
        );
      },
    },
    {
      field: "Delete",
      flex: 0.8,
      minWidth: 120,
      headerName: "",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Button onClick={() => handleDelete(params.id)}>
              <AiOutlineDelete size={20} />
            </Button>
          </>
        );
      },
    },
  ];

  const row = [];

  allEvents &&
    allEvents.forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        price: "₹" + item.discountPrice,
        Stock: item.stock,
        sold: item.sold_out,
      });
    });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          {/* Header with Create Button */}
          <div className="w-full flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Events Management
              </h2>
              <p className="text-gray-600">
                Manage all events in your marketplace
              </p>
            </div>
            <div
              className={`${styles.button} !w-max !h-[45px] px-3 !rounded-[5px] mr-3 mb-3 cursor-pointer`}
              onClick={handleCreate}
            >
              <span className="text-white flex items-center space-x-2">
                <AiOutlinePlus size={18} />
                <span>Create Event</span>
              </span>
            </div>
          </div>

          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      )}

      {/* Event Form Modal */}
      <EventFormModal
        open={isModalOpen}
        onClose={handleModalClose}
        event={selectedEvent}
        onSubmit={handleSubmit}
        isEdit={isEdit}
        loading={formLoading}
      />
    </>
  );
};

export default AllEvents;
