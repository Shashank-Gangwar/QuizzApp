import { BsStars } from "react-icons/bs";
import {
  IoStorefrontOutline,
  IoPersonOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { PiBooksLight, PiRankingFill, PiNotePencilFill } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { updateNavigation } from "../../store/navigationSlice";
import { setGblLeaderboard } from "../../store/leaderBoardSlice";
import { showToast } from "../Toast";
import {
  apiCallWithAuth,
  getAttemptedQuizzes,
  getMyQuizzes,
  leaderboardApi,
  loggingOut,
} from "../../APIs/apiCalls";
import { useNavigate } from "react-router-dom";
import { setAttemptedQuiz, setMyQuiz } from "../../store/quizSlice";
import { updateLoggingOut } from "../../store/userSlice";
import toast from "react-hot-toast";

function SideBar() {
  const { userDetails } = useSelector((state) => state.user);
  const { navigation } = useSelector((state) => state.navigation);
  const { globalLeaderboard } = useSelector((state) => state.leaderboard);
  const { myQuizzes, attemptedQuizzes } = useSelector((state) => state.quiz);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGetLeaderboard = async () => {
    dispatch(updateNavigation("leaderboard"));
    if (globalLeaderboard.length === 0) {
      showToast("Getting Global Leaderboard", "loading");
      const response = await apiCallWithAuth(leaderboardApi);
      if (response.status == 200) {
        //console.log(response.data.leaderboard);
        toast.dismiss();
        dispatch(setGblLeaderboard(response.data.leaderboard));
      } else {
        showToast("Failed to get global Leaderboard'", "error");
        //console.log(response);
      }
    }
  };

  const handleMyQuizzes = async () => {
    dispatch(updateNavigation("myQuizzes"));
    if (myQuizzes.length === 0) {
      showToast("Getting your Quizzes", "loading");
      const response = await apiCallWithAuth(getMyQuizzes);
      if (response.status == 200) {
        //console.log(response.data);
        toast.dismiss();
        dispatch(setMyQuiz(response.data));
      } else {
        //console.log(response);
        toast.dismiss();
        showToast("Couldn't get Your Quizzes", "error");
      }
    }
  };

  const handleMyAttempts = async () => {
    dispatch(updateNavigation("myAttempts"));
    if (attemptedQuizzes.length === 0) {
      showToast("Getting your Attempted Quizzes", "loading");
      const response = await apiCallWithAuth(getAttemptedQuizzes);
      if (response.status == 200) {
        //console.log(response.data);
        toast.dismiss();
        dispatch(setAttemptedQuiz(response.data));
      } else {
        showToast("Couldn't get Attempted quizzes", "error");
        //console.log(response);
      }
    }
  };

  const handleLogout = async () => {
    showToast("Logging Out", "loading");
    const response = await apiCallWithAuth(loggingOut);
    if (response.status == 200) {
      //console.log(response.data);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      toast.dismiss();
      dispatch(updateLoggingOut({}));
      navigate("/login");
      showToast("Logout Successful", "success");
    } else {
      showToast("Couldn't able to logout", "error");
      //console.log(response);
    }
  };

  return (
    <div className="d-none d-md-flex flex-column py-3 px-3 sidebar ">
      <a
        href="/"
        className="d-none d-md-flex flex-column align-items-center me-md-auto text-white text-decoration-none logo "
      >
        <img src="/Quizard_logo_white.png" alt="logo" height={60} width={60} />
        <span className="fs-1 px-2">Quizzard</span>
      </a>
      <hr />
      <div className="d-flex flex-column mx-2 mx-sm-0 mb-4">
        <span
          className="px-2 fs-5 fs-sm-6 text-white rounded"
          style={{ backgroundColor: "#3C096C", width: "fit-content" }}
        >
          {userDetails?.username}
        </span>
        <span className=" px-1 py-1 text-white">
          {!Object.keys(userDetails).length
            ? ""
            : userDetails?.role[0]?.toUpperCase() +
              userDetails?.role?.slice(1)}{" "}
          Account
        </span>
      </div>
      <div
        className={`${
          userDetails?.role !== "admin" && "d-none"
        } createNav text-center fs-2 mb-3 rounded-3 pe-4 pe-sm-1`}
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/create-quiz")}
      >
        <BsStars /> Create
      </div>
      <ul className="nav nav-pills flex-column mb-auto">
        <li
          className={`${navigation === "inventory" && "navItem"} rounded mb-1`}
          onClick={() => {
            dispatch(updateNavigation("inventory"));
          }}
        >
          <a
            href="#"
            className="nav-link text-white d-flex align-items-center "
          >
            <IoStorefrontOutline />
            <span className="d-none d-md-inline ms-1">Inventory</span>
          </a>
        </li>
        <li
          className={`${navigation === "myQuizzes" && "navItem"} ${
            userDetails?.role !== "admin" && "d-none"
          } rounded mb-1`}
          onClick={() => {
            dispatch(handleMyQuizzes);
          }}
        >
          <a
            href="#"
            className="nav-link text-white d-flex align-items-center "
          >
            <PiBooksLight />
            <span className="d-none d-md-inline ms-1">My Quizzes</span>
          </a>
        </li>
        <li
          className={`${navigation === "myAttempts" && "navItem"} rounded mb-1`}
          onClick={() => {
            dispatch(handleMyAttempts);
          }}
        >
          <a
            href="#"
            className="nav-link text-white d-flex align-items-center "
          >
            <PiNotePencilFill />
            <span className="d-none d-md-inline ms-1">My Attempts</span>
          </a>
        </li>
        <li
          className={`${
            navigation === "leaderboard" && "navItem"
          } rounded mb-1`}
          onClick={handleGetLeaderboard}
        >
          <a
            href="#"
            className="nav-link text-white d-flex align-items-center "
          >
            <PiRankingFill />
            <span className="d-none d-md-inline ms-1">Leaderboard</span>
          </a>
        </li>
        <li
          className={`${navigation === "profile" && "navItem"} rounded mb-1`}
          onClick={() => {
            dispatch(updateNavigation("profile"));
          }}
        >
          <a
            href="#"
            className="nav-link text-white d-flex align-items-center "
          >
            <IoPersonOutline />
            <span className="d-none d-md-inline ms-1">Profile</span>
          </a>
        </li>
      </ul>
      <hr />
      <div
        className="btn text-white fs-5"
        style={{ background: "#3C096C" }}
        onClick={handleLogout}
      >
        Logout <IoLogOutOutline />
      </div>
    </div>
  );
}

export default SideBar;
