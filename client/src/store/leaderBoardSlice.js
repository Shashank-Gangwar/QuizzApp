import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  globalLeaderboard: [],
  quizLeaderboard: [],
  allQuizLeaderboard: {},
};

export const leaderBoardSlice = createSlice({
  name: "leaderBoardSlice",
  initialState,
  reducers: {
    setGblLeaderboard: (state, action) => {
      state.globalLeaderboard = action.payload;
    },
    setQuizLeaderboard: (state, action) => {
      const { quiz_id, leaderboard } = action.payload;
      state.quizLeaderboard = leaderboard;
      state.allQuizLeaderboard[quiz_id] = leaderboard;
    },
  },
});

export const { setQuizLeaderboard, setGblLeaderboard } =
  leaderBoardSlice.actions;

export default leaderBoardSlice.reducer;
