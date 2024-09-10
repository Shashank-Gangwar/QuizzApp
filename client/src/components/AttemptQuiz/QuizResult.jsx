import { useNavigate } from "react-router-dom";

function QuizResult({ score }) {
  const navigate = useNavigate();

  return (
    <div className="atmptQuizContainer">
      <div className="container py-5 d-flex justify-content-center">
        <div className="px-5 pt-5 d-flex w-100 align-items-center justify-content-center flex-column rounded-3 border shadow-lg atmptQuizInside">
          <h2 className="fs-1">Quiz Result</h2>
          <img src="/QuizDone.png" alt="Done" height={150} width={150} />
          <span className="fs-3 fw-bold mt-4">Your Score is : {score}</span>

          <div
            className="btn btn-large text-white fs-4   my-5 px-5"
            style={{
              backgroundColor: "#3C096C",
            }}
            onClick={() => navigate("/")}
          >
            Leave
          </div>
        </div>
      </div>
    </div>
  );
}
export default QuizResult;
