import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  apiCallWithAuth,
  getAllQuizzes,
  loginUsingAccessToken,
} from "../APIs/apiCalls";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/Dashboard/SideBar.jsx";
import Navbar from "../components/Dashboard/Navbar.jsx";
import Inventory from "../components/Dashboard/Inventory.jsx";
import { addUser } from "../store/userSlice.js";
import MyQuizzes from "../components/Dashboard/MyQuizzes.jsx";
import LeaderBoard from "../components/Dashboard/LeaderBoard.jsx";
import { setAllQuiz } from "../store/quizSlice.js";
import Profile from "../components/Dashboard/Profile.jsx";
import QuizCode from "../components/Dashboard/QuizCode.jsx";
import MyAttempts from "../components/Dashboard/MyAttempts.jsx";

function Dashboard() {
  const { loggedIn } = useSelector((state) => state.user);
  const { navigation } = useSelector((state) => state.navigation);

  const { allQuizzes } = useSelector((state) => state.quiz);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // console.log("dashboard");

  useEffect(() => {
    if (!loggedIn) {
      if (localStorage.getItem("access_token")) {
        handleTokenLogin();
      } else {
        navigate("/login");
        setPageLoading(false);
      }
    } else {
      setPageLoading(false);
    }
    if (!allQuizzes.length) {
      handleGetQuizes();
    }
  }, [loggedIn]);

  const handleTokenLogin = async () => {
    const response = await apiCallWithAuth(loginUsingAccessToken);
    if (response.status == 200) {
      dispatch(addUser(response.data.user));
      setPageLoading(false);
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
      setPageLoading(false);
    }
  };

  const handleGetQuizes = async () => {
    setPageLoading(true);
    const response = await apiCallWithAuth(getAllQuizzes);
    if (response.status == 200) {
      //console.log(response.data);
      dispatch(setAllQuiz(response.data));
      setPageLoading(false);
    } else {
      setPageLoading(false);
      //console.log(response);
    }
  };

  return pageLoading ? (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh", width: "100vw" }}
    >
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ) : (
    <>
      <div className="d-flex dashboard">
        <SideBar />
        <div className="d-flex flex-column w-100">
          <Navbar />

          <div className="d-flex flex-column align-items-center w-100 contentArea">
            {navigation === "inventory" ? (
              <Inventory />
            ) : navigation === "myQuizzes" ? (
              <MyQuizzes />
            ) : navigation === "myAttempts" ? (
              <MyAttempts />
            ) : navigation === "leaderboard" ? (
              <LeaderBoard />
            ) : navigation === "profile" ? (
              <Profile />
            ) : navigation === "quizCode" ? (
              <QuizCode />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
