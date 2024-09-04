import { configureStore } from "@reduxjs/toolkit";
import singleQuizSlice from "./singleQuizSlice.js";
import userSlice from "./userSlice.js";
import navigationSlice from "./navigationSlice.js";
import quizSlice from "./quizSlice.js";
import leaderBoardSlice from "./leaderBoardSlice.js";

export const store = configureStore({
  reducer: {
    singleQuiz: singleQuizSlice,
    quiz: quizSlice,
    user: userSlice,
    navigation: navigationSlice,
    leaderboard: leaderBoardSlice,
  },
});
