import axios from "axios";
import { server } from "../../server";

// create event
export const createevent = (newForm) => async (dispatch) => {
  try {
    dispatch({
      type: "eventCreateRequest",
    });

    const config = { headers: { "Content-Type": "multipart/form-data" } };

    const { data } = await axios.post(
      `${server}/event/create-event`,
      newForm,
      config
    );
    dispatch({
      type: "eventCreateSuccess",
      payload: data.event,
    });
  } catch (error) {
    dispatch({
      type: "eventCreateFail",
      payload: error.response.data.message,
    });
  }
};

// get all events of a shop
export const getAllEventsShop = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getAlleventsShopRequest",
    });

    const { data } = await axios.get(`${server}/event/get-all-events/${id}`);
    dispatch({
      type: "getAlleventsShopSuccess",
      payload: data.events,
    });
  } catch (error) {
    dispatch({
      type: "getAlleventsShopFailed",
      payload: error.response.data.message,
    });
  }
};

// delete event of a shop
export const deleteEvent = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteeventRequest",
    });

    const { data } = await axios.delete(
      `${server}/event/delete-shop-event/${id}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "deleteeventSuccess",
      payload: {
        message: data.message,
        eventId: id
      },
    });
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Delete failed';
    const statusCode = error.response?.status;
    
    if (statusCode !== 401) {
      dispatch({
        type: "deleteeventFailed",
        payload: errorMessage,
      });
    } else {
      console.log('Event deletion unauthorized - user is not the owner');
    }
  }
};

// get all events
export const getAllEvents = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAlleventsRequest",
    });

    const { data } = await axios.get(`${server}/event/get-all-events`);
    dispatch({
      type: "getAlleventsSuccess",
      payload: data.events,
    });
  } catch (error) {
    dispatch({
      type: "getAlleventsFailed",
      payload: error.response.data.message,
    });
  }
};

// Admin get all events
export const getAllEventsAdmin = () => async (dispatch) => {
  try {
    dispatch({
      type: "adminGetAllEventsRequest",
    });

    const { data } = await axios.get(`${server}/event/admin-all-events`, {
      withCredentials: true,
    });
    dispatch({
      type: "adminGetAllEventsSuccess",
      payload: data.events,
    });
  } catch (error) {
    dispatch({
      type: "adminGetAllEventsFailed",
      payload: error.response.data.message,
    });
  }
};

// Admin create event
export const createEventAdmin = (eventData) => async (dispatch) => {
  try {
    dispatch({
      type: "adminCreateEventRequest",
    });

    const { data } = await axios.post(
      `${server}/event/admin-create-event`,
      eventData,
      {
        withCredentials: true,
      }
    );
    dispatch({
      type: "adminCreateEventSuccess",
      payload: data.event,
    });
  } catch (error) {
    dispatch({
      type: "adminCreateEventFailed",
      payload: error.response.data.message,
    });
  }
};

// Admin update event
export const updateEventAdmin = (id, eventData) => async (dispatch) => {
  try {
    dispatch({
      type: "adminUpdateEventRequest",
    });

    const { data } = await axios.put(
      `${server}/event/admin-update-event/${id}`,
      eventData,
      {
        withCredentials: true,
      }
    );
    dispatch({
      type: "adminUpdateEventSuccess",
      payload: data.event,
    });
  } catch (error) {
    dispatch({
      type: "adminUpdateEventFailed",
      payload: error.response.data.message,
    });
  }
};

// Admin delete event
export const deleteEventAdmin = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "adminDeleteEventRequest",
    });

    const { data } = await axios.delete(
      `${server}/event/admin-delete-event/${id}`,
      {
        withCredentials: true,
      }
    );
    dispatch({
      type: "adminDeleteEventSuccess",
      payload: { message: data.message, eventId: id },
    });
  } catch (error) {
    dispatch({
      type: "adminDeleteEventFailed",
      payload: error.response.data.message,
    });
  }
};

// Get single event for admin
export const getEventAdmin = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "adminGetEventRequest",
    });

    const { data } = await axios.get(
      `${server}/event/admin-get-event/${id}`,
      {
        withCredentials: true,
      }
    );
    dispatch({
      type: "adminGetEventSuccess",
      payload: data.event,
    });
  } catch (error) {
    dispatch({
      type: "adminGetEventFailed",
      payload: error.response.data.message,
    });
  }
};
