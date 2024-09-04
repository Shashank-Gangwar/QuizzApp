import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  navigation: "inventory",
};

export const navigationSlice = createSlice({
  name: "navigationSlice",
  initialState,
  reducers: {
    updateNavigation: (state, action) => {
      state.navigation = action.payload;
    },
  },
});

export const { updateNavigation } = navigationSlice.actions;

export default navigationSlice.reducer;
