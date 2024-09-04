import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allQuizzes: [],
  myQuizzes: [],
  attemptedQuizzes: [],
};

export const quizSlice = createSlice({
  name: "quizSlice",
  initialState,
  reducers: {
    setAllQuiz: (state, action) => {
      state.allQuizzes = action.payload;
    },
    setMyQuiz: (state, action) => {
      state.myQuizzes = action.payload;
    },
    setAttemptedQuiz: (state, action) => {
      state.attemptedQuizzes = action.payload;
    },
    addQuiz: (state, action) => {
      const newquiz = {
        id: action.payload.id,
        text: action.payload.text,
      };
      state.myQuizzes.push(newquiz);
      state.allQuizzes.push(newquiz);
    },
    removeQuiz: (state, action) => {
      state.myQuizzes = state.myQuizzes.filter(
        (quiz) => quiz.id !== action.payload.id
      );
      state.allQuizzes = state.allQuizzes.filter(
        (quiz) => quiz.id !== action.payload.id
      );
    },
  },
});

export const { setAllQuiz, setMyQuiz, setAttemptedQuiz, addQuiz, removeQuiz } =
  quizSlice.actions;

export default quizSlice.reducer;
