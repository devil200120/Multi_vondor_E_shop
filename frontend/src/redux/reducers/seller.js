import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

export const sellerReducer = createReducer(initialState, {
  LoadSellerRequest: (state) => {
    state.isLoading = true;
  },
  LoadSellerSuccess: (state, action) => {
    state.isSeller = true;
    state.isLoading = false;
    state.seller = action.payload;
  },
  LoadSellerFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.isSeller = false;
  },

  // logout seller
  LogoutSellerSuccess: (state, action) => {
    state.isSeller = false;
    state.seller = null;
    state.isLoading = false;
  },
  LogoutSellerFail: (state, action) => {
    state.error = action.payload;
  },
  // get all sellers ---admin
  getAllSellersRequest: (state) => {
    state.isLoading = true;
  },
  getAllSellersSuccess: (state, action) => {
    state.isLoading = false;
    state.sellers = action.payload;
  },
  getAllSellerFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // get pending sellers ---admin
  getPendingSellersRequest: (state) => {
    state.pendingLoading = true;
  },
  getPendingSellersSuccess: (state, action) => {
    state.pendingLoading = false;
    state.pendingSellers = action.payload;
  },
  getPendingSellersFailed: (state, action) => {
    state.pendingLoading = false;
    state.pendingError = action.payload;
  },

  // get seller statistics ---admin
  getSellerStatsRequest: (state) => {
    state.statsLoading = true;
  },
  getSellerStatsSuccess: (state, action) => {
    state.statsLoading = false;
    state.sellerStats = action.payload;
  },
  getSellerStatsFailed: (state, action) => {
    state.statsLoading = false;
    state.statsError = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
    state.pendingError = null;
    state.statsError = null;
  },
});

// reducer -> logic (state change)
