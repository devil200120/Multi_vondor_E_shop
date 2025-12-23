import axios from "axios";
import { server } from "../../server";

// get all sellers --- admin
export const getAllSellers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllSellersRequest",
    });

    const { data } = await axios.get(`${server}/shop/admin-all-sellers`, {
      withCredentials: true,
    });

    dispatch({
      type: "getAllSellersSuccess",
      payload: data.sellers,
    });
  } catch (error) {
    dispatch({
      type: "getAllSellerFailed",
      //   payload: error.response.data.message,
    });
  }
};

// get pending sellers --- admin
export const getPendingSellers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getPendingSellersRequest",
    });

    const { data } = await axios.get(`${server}/shop/admin-pending-sellers`, {
      withCredentials: true,
    });

    dispatch({
      type: "getPendingSellersSuccess",
      payload: data.sellers,
    });
  } catch (error) {
    dispatch({
      type: "getPendingSellersFailed",
      payload: error.response?.data?.message || "Failed to fetch pending sellers",
    });
  }
};

// get seller statistics --- admin
export const getSellerStats = () => async (dispatch) => {
  try {
    dispatch({
      type: "getSellerStatsRequest",
    });

    const { data } = await axios.get(`${server}/shop/admin-seller-stats`, {
      withCredentials: true,
    });

    dispatch({
      type: "getSellerStatsSuccess",
      payload: data.stats,
    });
  } catch (error) {
    dispatch({
      type: "getSellerStatsFailed",
      payload: error.response?.data?.message || "Failed to fetch seller statistics",
    });
  }
};
