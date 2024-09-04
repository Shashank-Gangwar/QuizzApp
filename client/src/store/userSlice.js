import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userDetails: {},
  loggedIn: false,
};

export const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.userDetails = action.payload;
      state.loggedIn = true;
    },
    updateUsername: (state, action) => {
      state.userDetails.username = action.payload;
    },
    updateEmail: (state, action) => {
      state.userDetails.email = action.payload;
    },
    updateLoggingOut: (state, action) => {
      state.userDetails = action.payload;
      state.loggedIn = false;
    },
  },
});

export const { addUser, updateUsername, updateEmail, updateLoggingOut } =
  userSlice.actions;

export default userSlice.reducer;
