import { FaRegThumbsUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function QuizInstructions({ quiz, onStart }) {
  const navigate = useNavigate();
  const handleTimeConversion = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="container py-5">
      <div
        className="w-100 text-light fs-2 text-center"
        style={{ backgroundColor: "#3C096C" }}
      >
        {" "}
        Instructions{" "}
      </div>
      <div className="p-5 bg-body-tertiary rounded-3">
        <h2 className="text-center w-100 mb-5">{quiz.name}</h2>
        <div className="d-flex w-100 flex-column">
          <h4 className="my-2">● Welcome to the Online Quiz</h4>
          <h4 className="my-2">
            ● Quiz has Total of {quiz?.questions?.length} Questions
          </h4>
          <h4 className="my-2">
            ● Total Time for the Quiz is {handleTimeConversion(quiz?.max_time)}{" "}
            Minutes
          </h4>
          <h4 className="my-2">
            ● Difficulty level of this Quiz is {quiz?.difficulty}
          </h4>
          <h4 className="my-2">● Once you start, you can't pause the timer</h4>
          <h4 className="my-5 d-flex align-items-center">
            <span className="me-3">All The Best For The Quiz</span>{" "}
            <FaRegThumbsUp />
          </h4>
        </div>
        <div className="w-100 d-flex justify-content-center gap-3">
          <div
            className="btn btn-lg btn-outline-danger px-5 w-50"
            onClick={() => navigate("/")}
          >
            Exit
          </div>
          <div
            className="btn btn-lg text-white px-5 w-50"
            style={{ backgroundColor: "#3C096C" }}
            onClick={() => onStart()}
          >
            Start
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizInstructions;
