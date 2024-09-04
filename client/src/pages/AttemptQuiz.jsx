import { useEffect, useState } from "react";
import QuizInstructions from "../components/AttemptQuiz/QuizInstructions";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../components/Toast";
import {
  apiCallWithAuth,
  endQuiz,
  getAttemptedQuizzes,
  getQuizById,
  startQuiz,
} from "../APIs/apiCalls";
import QuizStarted from "../components/AttemptQuiz/QuizStarted";
import QuizResult from "../components/AttemptQuiz/QuizResult";
import { setAttemptedQuiz } from "../store/quizSlice";

function AttemptQuiz() {
  const { quizId } = useParams();
  const { loggedIn } = useSelector((state) => state.user);
  const [pageLoading, setPageLoading] = useState(true);
  const [quiz, setQuiz] = useState({});
  const navigate = useNavigate();
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(-1);
  const [quiz_Attempt_id, setQuiz_Attempt_id] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    //console.log(Number(quizId));
    if (!loggedIn) {
      showToast("UnAuthorized", "error");
      navigate("/login");
      setPageLoading(false);
    } else {
      setPageLoading(false);
      handleGetQuiz();
    }
  }, []);

  const handleGetQuiz = async () => {
    setPageLoading(true);
    const response = await apiCallWithAuth(() => getQuizById(Number(quizId)));
    if (response.status == 200) {
      //console.log(response);
      setQuiz(response.data);
      setPageLoading(false);
    } else {
      showToast("Failed to start Quiz, Please Try again Later", "error");
      //console.log(response);
      navigate("/");
      setPageLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    setPageLoading(true);
    const response = await apiCallWithAuth(() => startQuiz(Number(quizId)));
    if (response.status == 200) {
      //console.log(response);
      setQuiz_Attempt_id(response.data.quiz_attempt_id);
      setQuizStarted(true);
      setPageLoading(false);
    } else {
      showToast("Failed to start Quiz, Please Try again Later", "error");
      //console.log(response);
      navigate("/");
      setPageLoading(false);
    }
  };

  const handleEndQuiz = async (score) => {
    setPageLoading(true);
    const response = await apiCallWithAuth(() =>
      endQuiz(Number(quiz_Attempt_id), Number(score))
    );
    if (response.status == 200) {
      //console.log(response);
      setQuizCompleted(true);
      handleRefreshAttemptQuizzes();
      setPageLoading(false);
    } else {
      showToast("Failed to end Quiz, Your Quiz might be lost", "error");
      //console.log(response);
      navigate("/");
      setPageLoading(false);
    }
  };

  const handleRefreshAttemptQuizzes = async () => {
    const response = await apiCallWithAuth(getAttemptedQuizzes);
    if (response.status == 200) {
      //console.log(response.data);
      dispatch(setAttemptedQuiz(response.data));
    } else {
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
    <div>
      {!quizStarted ? (
        <QuizInstructions quiz={quiz} onStart={handleStartQuiz} />
      ) : !quizCompleted ? (
        <QuizStarted quiz={quiz} setScore={setScore} onEnd={handleEndQuiz} />
      ) : (
        <QuizResult score={score} />
      )}
    </div>
  );
}

export default AttemptQuiz;
