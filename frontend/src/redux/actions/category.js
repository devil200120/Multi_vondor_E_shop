import axios from "axios";
import { server } from "../../server";

// Get all categories for frontend (public access)
export const getAllCategoriesPublic = () => async (dispatch) => {
  try {
    dispatch({
      type: "GetAllCategoriesRequest",
    });
    
    const { data } = await axios.get(
      `${server}/category/all-categories?includeInactive=false&limit=100`,
      {
        withCredentials: false, // Public access
      }
    );
    
    dispatch({
      type: "GetAllCategoriesSuccess",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "GetAllCategoriesFail",
      payload: error.response?.data?.message || "Failed to get categories",
    });
  }
};

// Get root categories only (public access)
export const getRootCategoriesPublic = () => async (dispatch) => {
  try {
    dispatch({
      type: "GetAllCategoriesRequest",
    });
    
    const { data } = await axios.get(
      `${server}/category/root-categories?includeInactive=false&limit=100`,
      {
        withCredentials: false, // Public access
      }
    );
    
    dispatch({
      type: "GetAllCategoriesSuccess",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "GetAllCategoriesFail",
      payload: error.response?.data?.message || "Failed to get root categories",
    });
  }
};

// Get subcategories by parent ID (public access)
export const getSubcategoriesPublic = (parentId) => async (dispatch) => {
  try {
    dispatch({
      type: "GetSubcategoriesRequest",
    });
    
    const { data } = await axios.get(
      `${server}/category/subcategories/${parentId}?includeInactive=false&limit=100`,
      {
        withCredentials: false, // Public access
      }
    );
    
    dispatch({
      type: "GetSubcategoriesSuccess",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "GetSubcategoriesFail",
      payload: error.response?.data?.message || "Failed to get subcategories",
    });
  }
};

// Get all categories
export const getAllCategories = (params = {}) => async (dispatch) => {
  try {
    dispatch({
      type: "GetAllCategoriesRequest",
    });
    
    // Clean params to avoid sending invalid values
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== "") {
        cleanParams[key] = value;
      }
    });
    
    const queryString = new URLSearchParams(cleanParams).toString();
    const { data } = await axios.get(
      `${server}/category/all-categories${queryString ? `?${queryString}` : ""}`,
      {
        withCredentials: true,
      }
    );
    
    dispatch({
      type: "GetAllCategoriesSuccess",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "GetAllCategoriesFail",
      payload: error.response?.data?.message || "Failed to get categories",
    });
  }
};

// Get category tree
export const getCategoryTree = () => async (dispatch) => {
  try {
    dispatch({
      type: "GetCategoryTreeRequest",
    });
    
    const { data } = await axios.get(`${server}/category/all-categories?tree=true`, {
      withCredentials: true,
    });
    
    dispatch({
      type: "GetCategoryTreeSuccess",
      payload: data.categories,
    });
  } catch (error) {
    dispatch({
      type: "GetCategoryTreeFail",
      payload: error.response?.data?.message || "Failed to get category tree",
    });
  }
};

// Get single category
export const getCategoryById = (id, params = {}) => async (dispatch) => {
  try {
    dispatch({
      type: "GetCategoryByIdRequest",
    });
    
    const queryString = new URLSearchParams(params).toString();
    const { data } = await axios.get(
      `${server}/category/category/${id}${queryString ? `?${queryString}` : ""}`,
      {
        withCredentials: true,
      }
    );
    
    dispatch({
      type: "GetCategoryByIdSuccess",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "GetCategoryByIdFail",
      payload: error.response?.data?.message || "Failed to get category",
    });
  }
};

// Create category
export const createCategory = (categoryData) => async (dispatch) => {
  try {
    dispatch({
      type: "CreateCategoryRequest",
    });
    
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    };
    
    const { data } = await axios.post(
      `${server}/category/create-category`,
      categoryData,
      config
    );
    
    dispatch({
      type: "CreateCategorySuccess",
      payload: {
        message: data.message,
        category: data.category,
      },
    });
  } catch (error) {
    dispatch({
      type: "CreateCategoryFail",
      payload: error.response?.data?.message || "Failed to create category",
    });
  }
};

// Update category
export const updateCategory = (id, categoryData) => async (dispatch) => {
  try {
    dispatch({
      type: "UpdateCategoryRequest",
    });
    
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    };
    
    const { data } = await axios.put(
      `${server}/category/update-category/${id}`,
      categoryData,
      config
    );
    
    dispatch({
      type: "UpdateCategorySuccess",
      payload: {
        message: data.message,
        category: data.category,
      },
    });
  } catch (error) {
    dispatch({
      type: "UpdateCategoryFail",
      payload: error.response?.data?.message || "Failed to update category",
    });
  }
};

// Delete category
export const deleteCategory = (id, force = false) => async (dispatch) => {
  try {
    dispatch({
      type: "DeleteCategoryRequest",
    });
    
    const { data } = await axios.delete(
      `${server}/category/delete-category/${id}${force ? "?force=true" : ""}`,
      {
        withCredentials: true,
      }
    );
    
    dispatch({
      type: "DeleteCategorySuccess",
      payload: {
        message: data.message,
        categoryId: id,
      },
    });
  } catch (error) {
    dispatch({
      type: "DeleteCategoryFail",
      payload: error.response?.data?.message || "Failed to delete category",
    });
  }
};

// Toggle category status
export const toggleCategoryStatus = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "ToggleCategoryStatusRequest",
    });
    
    const { data } = await axios.patch(
      `${server}/category/toggle-status/${id}`,
      {},
      {
        withCredentials: true,
      }
    );
    
    dispatch({
      type: "ToggleCategoryStatusSuccess",
      payload: {
        message: data.message,
        category: data.category,
      },
    });
  } catch (error) {
    dispatch({
      type: "ToggleCategoryStatusFail",
      payload: error.response?.data?.message || "Failed to toggle category status",
    });
  }
};

// Bulk category actions
export const bulkCategoryAction = (action, categoryIds) => async (dispatch) => {
  try {
    dispatch({
      type: "BulkCategoryActionRequest",
    });
    
    const { data } = await axios.patch(
      `${server}/category/bulk-action`,
      { action, categoryIds },
      {
        withCredentials: true,
      }
    );
    
    dispatch({
      type: "BulkCategoryActionSuccess",
      payload: {
        message: data.message,
        action,
        categoryIds,
        modifiedCount: data.modifiedCount,
      },
    });
  } catch (error) {
    dispatch({
      type: "BulkCategoryActionFail",
      payload: error.response?.data?.message || "Failed to perform bulk action",
    });
  }
};

// Reorder categories
export const reorderCategories = (categories) => async (dispatch) => {
  try {
    dispatch({
      type: "ReorderCategoriesRequest",
    });
    
    const { data } = await axios.patch(
      `${server}/category/reorder`,
      { categories },
      {
        withCredentials: true,
      }
    );
    
    dispatch({
      type: "ReorderCategoriesSuccess",
      payload: {
        message: data.message,
        categories,
      },
    });
  } catch (error) {
    dispatch({
      type: "ReorderCategoriesFail",
      payload: error.response?.data?.message || "Failed to reorder categories",
    });
  }
};

// Get category statistics
export const getCategoryStats = () => async (dispatch) => {
  try {
    dispatch({
      type: "GetCategoryStatsRequest",
    });
    
    const { data } = await axios.get(`${server}/category/stats`, {
      withCredentials: true,
    });
    
    dispatch({
      type: "GetCategoryStatsSuccess",
      payload: data.stats,
    });
  } catch (error) {
    dispatch({
      type: "GetCategoryStatsFail",
      payload: error.response?.data?.message || "Failed to get category statistics",
    });
  }
};

// Update product counts
export const updateProductCounts = () => async (dispatch) => {
  try {
    dispatch({
      type: "UpdateProductCountsRequest",
    });
    
    const { data } = await axios.patch(
      `${server}/category/update-product-counts`,
      {},
      {
        withCredentials: true,
      }
    );
    
    dispatch({
      type: "UpdateProductCountsSuccess",
      payload: {
        message: data.message,
        updatedCount: data.updatedCount,
      },
    });
  } catch (error) {
    dispatch({
      type: "UpdateProductCountsFail",
      payload: error.response?.data?.message || "Failed to update product counts",
    });
  }
};

// Clear category errors
export const clearCategoryErrors = () => async (dispatch) => {
  dispatch({
    type: "ClearCategoryErrors",
  });
};

// Clear category messages
export const clearCategoryMessages = () => async (dispatch) => {
  dispatch({
    type: "ClearCategoryMessages",
  });
};

// Set selected category
export const setSelectedCategory = (category) => async (dispatch) => {
  dispatch({
    type: "SetSelectedCategory",
    payload: category,
  });
};

// Clear selected category
export const clearSelectedCategory = () => async (dispatch) => {
  dispatch({
    type: "ClearSelectedCategory",
  });
};