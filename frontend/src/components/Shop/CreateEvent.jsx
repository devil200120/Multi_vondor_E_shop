import React, { useEffect, useState } from "react";
import {
  AiOutlinePlusCircle,
  AiOutlineCamera,
  AiOutlineClose,
  AiOutlineCalendar,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllCategoriesPublic } from "../../redux/actions/category";
import { toast } from "react-toastify";
import { createevent } from "../../redux/actions/event";
import { MdOutlineLocalOffer, MdDateRange } from "react-icons/md";
import { FiImage, FiDollarSign, FiPackage } from "react-icons/fi";

const CreateEvent = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.events);
  const { categories } = useSelector((state) => state.categories);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState();
  const [discountPrice, setDiscountPrice] = useState();
  const [stock, setStock] = useState();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (e) => {
    const startDate = new Date(e.target.value);
    const minEndDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    setStartDate(startDate);
    setEndDate(null);
    document.getElementById("end-date").min = minEndDate
      .toISOString()
      .slice(0, 10);
  };

  const handleEndDateChange = (e) => {
    const endDate = new Date(e.target.value);
    setEndDate(endDate);
  };

  const today = new Date().toISOString().slice(0, 10);

  const minEndDate = startDate
    ? new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    : "";

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(getAllCategoriesPublic());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success("Event created successfully!");
      navigate("/dashboard-events");
      window.location.reload();
    }
  }, [dispatch, error, success, navigate]);

  const handleImageChange = (e) => {
    e.preventDefault();

    let files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newForm = new FormData();

    images.forEach((image) => {
      newForm.append("images", image);
    });
    newForm.append("name", name);
    newForm.append("description", description);
    newForm.append("category", category);
    newForm.append("tags", tags);
    newForm.append("originalPrice", originalPrice);
    newForm.append("discountPrice", discountPrice);
    newForm.append("stock", stock);
    newForm.append("shopId", seller._id);
    newForm.append("start_Date", startDate.toISOString());
    newForm.append("Finish_Date", endDate.toISOString());
    dispatch(createevent(newForm));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-red-50/20 p-3 md:p-6 lg:ml-56">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <MdOutlineLocalOffer className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Create New Event
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Create a special promotional event for your products
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl">
          <form
            onSubmit={handleSubmit}
            className="p-4 md:p-8 space-y-6 md:space-y-8"
          >
            {/* Basic Information Section */}
            <div className="space-y-4 md:space-y-6">
              <div className="border-b border-gray-200/50 pb-3 md:pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <MdOutlineLocalOffer className="text-white" size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Event Information
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600">
                      Basic details about your event
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Name */}
              <div className="space-y-2">
                <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                  Event Name <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  required
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your event product name..."
                />
              </div>

              {/* Event Description */}
              <div className="space-y-2">
                <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                  Description <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={description}
                  required
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter your event product description..."
                />
              </div>

              {/* Category and Tags Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                    Category <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Choose a category</option>
                    {(categories || []).map((i) => (
                      <option value={i.name || i.title} key={i._id || i.id}>
                        {i.name || i.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm md:text-base font-bold text-gray-700">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={tags}
                    className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Enter your event product tags..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4 md:space-y-6">
              <div className="border-b border-gray-200/50 pb-3 md:pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="text-white" size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Pricing & Inventory
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600">
                      Set event pricing and stock information
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-sm md:text-base font-bold text-gray-700">
                    Original Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      name="originalPrice"
                      value={originalPrice}
                      className="w-full pl-8 pr-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                    Discount Price <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      name="discountPrice"
                      value={discountPrice}
                      required
                      className="w-full pl-8 pr-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                    Stock Quantity <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={stock}
                    required
                    className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Event Duration Section */}
            <div className="space-y-4 md:space-y-6">
              <div className="border-b border-gray-200/50 pb-3 md:pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <MdDateRange className="text-white" size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Event Duration
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600">
                      Set the event start and end dates
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                    Event Start Date{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <AiOutlineCalendar
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="date"
                      id="start-date"
                      value={
                        startDate ? startDate.toISOString().slice(0, 10) : ""
                      }
                      required
                      className="w-full pl-12 pr-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                      onChange={handleStartDateChange}
                      min={today}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                    Event End Date <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <AiOutlineCalendar
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="date"
                      id="end-date"
                      value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                      required
                      className="w-full pl-12 pr-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                      onChange={handleEndDateChange}
                      min={minEndDate}
                    />
                  </div>
                </div>
              </div>

              {startDate && endDate && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-xl p-4">
                  <p className="text-sm font-bold text-purple-700">
                    Event Duration:{" "}
                    {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))}{" "}
                    days
                  </p>
                </div>
              )}
            </div>

            {/* Event Images Section */}
            <div className="space-y-4 md:space-y-6">
              <div className="border-b border-gray-200/50 pb-3 md:pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                    <FiImage className="text-white" size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Event Images
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600">
                      Upload attractive images for your event
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label
                  htmlFor="upload"
                  className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-gray-50 to-orange-50/50 hover:from-orange-50 hover:to-red-50 transition-all duration-300 group shadow-sm hover:shadow-lg"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                      <AiOutlineCamera className="text-white" size={20} />
                    </div>
                    <p className="text-sm md:text-base text-gray-700 font-bold mb-1">
                      Upload Event Images
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </label>
                <input
                  type="file"
                  id="upload"
                  className="hidden"
                  multiple
                  onChange={handleImageChange}
                />

                {/* Image Preview */}
                {images && images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Event preview"
                          className="w-full h-20 md:h-24 object-cover rounded-xl border border-gray-300 shadow-sm group-hover:shadow-lg transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setImages(images.filter((_, i) => i !== index))
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200"
                        >
                          <AiOutlineClose size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 md:pt-8 border-t border-gray-200/50">
              <button
                type="button"
                onClick={() => navigate("/dashboard-events")}
                className="flex-1 sm:flex-none px-6 md:px-8 py-3 md:py-4 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-orange-700 hover:via-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
