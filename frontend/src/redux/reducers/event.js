import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

export const eventReducer = createReducer(initialState, {
  eventCreateRequest: (state) => {
    state.isLoading = true;
  },
  eventCreateSuccess: (state, action) => {
    state.isLoading = false;
    state.event = action.payload;
    state.success = true;
  },
  eventCreateFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  // get all events of shop
  getAlleventsShopRequest: (state) => {
    state.isLoading = true;
  },
  getAlleventsShopSuccess: (state, action) => {
    state.isLoading = false;
    state.events = action.payload;
  },
  getAlleventsShopFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // delete event of a shop
  deleteeventRequest: (state) => {
    state.isLoading = true;
  },
  deleteeventSuccess: (state, action) => {
    state.isLoading = false;
    state.message = action.payload.message;
    // Remove the deleted event from the events array
    if (state.events && action.payload.eventId) {
      state.events = state.events.filter(
        event => event._id !== action.payload.eventId
      );
    }
  },
  deleteeventFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // get all events
  getAlleventsRequest: (state) => {
    state.isLoading = true;
  },
  getAlleventsSuccess: (state, action) => {
    state.isLoading = false;
    state.allEvents = action.payload;
  },
  getAlleventsFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // Admin get all events
  adminGetAllEventsRequest: (state) => {
    state.isLoading = true;
  },
  adminGetAllEventsSuccess: (state, action) => {
    state.isLoading = false;
    state.adminEvents = action.payload;
  },
  adminGetAllEventsFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // Admin create event
  adminCreateEventRequest: (state) => {
    state.isLoading = true;
  },
  adminCreateEventSuccess: (state, action) => {
    state.isLoading = false;
    state.success = true;
    state.message = "Event created successfully!";
    // Add new event to the list
    if (state.adminEvents) {
      state.adminEvents.unshift(action.payload);
    }
  },
  adminCreateEventFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  // Admin update event
  adminUpdateEventRequest: (state) => {
    state.isLoading = true;
  },
  adminUpdateEventSuccess: (state, action) => {
    state.isLoading = false;
    state.success = true;
    state.message = "Event updated successfully!";
    // Update event in the list
    if (state.adminEvents) {
      const index = state.adminEvents.findIndex(event => event._id === action.payload._id);
      if (index !== -1) {
        state.adminEvents[index] = action.payload;
      }
    }
  },
  adminUpdateEventFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  // Admin delete event
  adminDeleteEventRequest: (state) => {
    state.isLoading = true;
  },
  adminDeleteEventSuccess: (state, action) => {
    state.isLoading = false;
    state.message = action.payload.message;
    // Remove deleted event from the list
    if (state.adminEvents && action.payload.eventId) {
      state.adminEvents = state.adminEvents.filter(
        event => event._id !== action.payload.eventId
      );
    }
  },
  adminDeleteEventFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // Admin get single event
  adminGetEventRequest: (state) => {
    state.isLoading = true;
  },
  adminGetEventSuccess: (state, action) => {
    state.isLoading = false;
    state.selectedEvent = action.payload;
  },
  adminGetEventFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
  
  clearMessages: (state) => {
    state.message = null;
    state.error = null;
    state.success = false;
  },
});
