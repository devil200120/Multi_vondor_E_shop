import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  categories: [],
  subcategories: [],
  parentCategory: null,
  subcategoriesLoading: false,
  categoryTree: [],
  selectedCategory: null,
  stats: null,
  error: null,
  message: null,
  totalPages: 0,
  currentPage: 1,
  total: 0,
};

export const categoryReducer = createReducer(initialState, (builder) => {
  // Get all categories
  builder.addCase("GetAllCategoriesRequest", (state) => {
    state.isLoading = true;
    state.error = null;
  });
  builder.addCase("GetAllCategoriesSuccess", (state, action) => {
    state.isLoading = false;
    state.categories = action.payload.categories;
    state.total = action.payload.total;
    state.currentPage = action.payload.page || 1;
    state.totalPages = action.payload.totalPages || 1;
    state.error = null;
  });
  builder.addCase("GetAllCategoriesFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Get category tree
  builder.addCase("GetCategoryTreeRequest", (state) => {
    state.isLoading = true;
    state.error = null;
  });
  builder.addCase("GetCategoryTreeSuccess", (state, action) => {
    state.isLoading = false;
    state.categoryTree = action.payload;
    state.error = null;
  });
  builder.addCase("GetCategoryTreeFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Get subcategories
  builder.addCase("GetSubcategoriesRequest", (state) => {
    state.subcategoriesLoading = true;
    state.error = null;
  });
  builder.addCase("GetSubcategoriesSuccess", (state, action) => {
    state.subcategoriesLoading = false;
    state.subcategories = action.payload.subcategories;
    state.parentCategory = action.payload.parentCategory;
    state.error = null;
  });
  builder.addCase("GetSubcategoriesFail", (state, action) => {
    state.subcategoriesLoading = false;
    state.error = action.payload;
  });

  // Get category by ID
  builder.addCase("GetCategoryByIdRequest", (state) => {
    state.isLoading = true;
    state.error = null;
  });
  builder.addCase("GetCategoryByIdSuccess", (state, action) => {
    state.isLoading = false;
    state.selectedCategory = action.payload.category;
    state.error = null;
  });
  builder.addCase("GetCategoryByIdFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Create category
  builder.addCase("CreateCategoryRequest", (state) => {
    state.isLoading = true;
    state.error = null;
    state.message = null;
  });
  builder.addCase("CreateCategorySuccess", (state, action) => {
    state.isLoading = false;
    state.categories = [action.payload.category, ...state.categories];
    state.message = action.payload.message;
    state.error = null;
  });
  builder.addCase("CreateCategoryFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Update category
  builder.addCase("UpdateCategoryRequest", (state) => {
    state.isLoading = true;
    state.error = null;
    state.message = null;
  });
  builder.addCase("UpdateCategorySuccess", (state, action) => {
    state.isLoading = false;
    const updatedCategory = action.payload.category;
    
    // Update in categories array
    state.categories = state.categories.map((category) =>
      category._id === updatedCategory._id ? updatedCategory : category
    );
    
    // Update selected category if it's the one being updated
    if (state.selectedCategory && state.selectedCategory._id === updatedCategory._id) {
      state.selectedCategory = updatedCategory;
    }
    
    state.message = action.payload.message;
    state.error = null;
  });
  builder.addCase("UpdateCategoryFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Delete category
  builder.addCase("DeleteCategoryRequest", (state) => {
    state.isLoading = true;
    state.error = null;
    state.message = null;
  });
  builder.addCase("DeleteCategorySuccess", (state, action) => {
    state.isLoading = false;
    state.categories = state.categories.filter(
      (category) => category._id !== action.payload.categoryId
    );
    
    // Clear selected category if it was deleted
    if (state.selectedCategory && state.selectedCategory._id === action.payload.categoryId) {
      state.selectedCategory = null;
    }
    
    state.message = action.payload.message;
    state.error = null;
  });
  builder.addCase("DeleteCategoryFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Toggle category status
  builder.addCase("ToggleCategoryStatusRequest", (state) => {
    state.isLoading = true;
    state.error = null;
    state.message = null;
  });
  builder.addCase("ToggleCategoryStatusSuccess", (state, action) => {
    state.isLoading = false;
    const updatedCategory = action.payload.category;
    
    // Update in categories array
    state.categories = state.categories.map((category) =>
      category._id === updatedCategory._id ? updatedCategory : category
    );
    
    // Update selected category if it's the one being updated
    if (state.selectedCategory && state.selectedCategory._id === updatedCategory._id) {
      state.selectedCategory = updatedCategory;
    }
    
    state.message = action.payload.message;
    state.error = null;
  });
  builder.addCase("ToggleCategoryStatusFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Bulk category actions
  builder.addCase("BulkCategoryActionRequest", (state) => {
    state.isLoading = true;
    state.error = null;
    state.message = null;
  });
  builder.addCase("BulkCategoryActionSuccess", (state, action) => {
    state.isLoading = false;
    const { action: bulkAction, categoryIds } = action.payload;
    
    if (bulkAction === "delete") {
      // Remove deleted categories
      state.categories = state.categories.filter(
        (category) => !categoryIds.includes(category._id)
      );
      
      // Clear selected category if it was deleted
      if (state.selectedCategory && categoryIds.includes(state.selectedCategory._id)) {
        state.selectedCategory = null;
      }
    } else if (bulkAction === "activate" || bulkAction === "deactivate") {
      // Update status for bulk action
      const newStatus = bulkAction === "activate";
      state.categories = state.categories.map((category) =>
        categoryIds.includes(category._id)
          ? { ...category, isActive: newStatus }
          : category
      );
      
      // Update selected category if affected
      if (state.selectedCategory && categoryIds.includes(state.selectedCategory._id)) {
        state.selectedCategory = { ...state.selectedCategory, isActive: newStatus };
      }
    }
    
    state.message = action.payload.message;
    state.error = null;
  });
  builder.addCase("BulkCategoryActionFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Reorder categories
  builder.addCase("ReorderCategoriesRequest", (state) => {
    state.isLoading = true;
    state.error = null;
    state.message = null;
  });
  builder.addCase("ReorderCategoriesSuccess", (state, action) => {
    state.isLoading = false;
    
    // Update sort order for categories
    const reorderedCategories = action.payload.categories;
    state.categories = state.categories.map((category) => {
      const reorderedCat = reorderedCategories.find((cat) => cat.id === category._id);
      return reorderedCat ? { ...category, sortOrder: reorderedCategories.indexOf(reorderedCat) } : category;
    });
    
    state.message = action.payload.message;
    state.error = null;
  });
  builder.addCase("ReorderCategoriesFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Get category statistics
  builder.addCase("GetCategoryStatsRequest", (state) => {
    state.isLoading = true;
    state.error = null;
  });
  builder.addCase("GetCategoryStatsSuccess", (state, action) => {
    state.isLoading = false;
    state.stats = action.payload;
    state.error = null;
  });
  builder.addCase("GetCategoryStatsFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Update product counts
  builder.addCase("UpdateProductCountsRequest", (state) => {
    state.isLoading = true;
    state.error = null;
    state.message = null;
  });
  builder.addCase("UpdateProductCountsSuccess", (state, action) => {
    state.isLoading = false;
    state.message = action.payload.message;
    state.error = null;
  });
  builder.addCase("UpdateProductCountsFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Utility actions
  builder.addCase("ClearCategoryErrors", (state) => {
    state.error = null;
  });
  builder.addCase("ClearCategoryMessages", (state) => {
    state.message = null;
  });
  builder.addCase("SetSelectedCategory", (state, action) => {
    state.selectedCategory = action.payload;
  });
  builder.addCase("ClearSelectedCategory", (state) => {
    state.selectedCategory = null;
  });
});