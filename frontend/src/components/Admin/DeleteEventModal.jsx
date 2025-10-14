import React from "react";
import { AiOutlineClose, AiOutlineDelete } from "react-icons/ai";
import { BsExclamationTriangle } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { deleteEventAdmin } from "../../redux/actions/event";

const DeleteEventModal = ({ isOpen, onClose, event }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.events);

  const handleDelete = async () => {
    if (event?._id) {
      await dispatch(deleteEventAdmin(event._id));
      onClose();
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Delete Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <BsExclamationTriangle className="h-12 w-12 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Are you sure you want to delete this event?
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  <strong>Event:</strong> {event.name}
                </p>
                <p className="mt-1">
                  This action cannot be undone. The event and all its associated
                  data will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          {/* Event Preview */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              {event.images && event.images.length > 0 && (
                <img
                  src={event.images[0].url}
                  alt={event.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{event.name}</p>
                <p className="text-sm text-gray-600">
                  Price: ₹{event.discountPrice} | Stock: {event.stock}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(event.start_Date).toLocaleDateString()} -{" "}
                  {new Date(event.Finish_Date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <AiOutlineDelete size={16} />
            <span>{isLoading ? "Deleting..." : "Delete Event"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventModal;
