import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  singleQuiz: {},
};

export const singleQuizSlice = createSlice({
  name: "singleQuizSlice",
  initialState,
  reducers: {
    addQuiz: (state, action) => {
      state.singleQuiz = action.payload;
    },
  },
});

export const { addQuiz } = singleQuizSlice.actions;

export default singleQuizSlice.reducer;
