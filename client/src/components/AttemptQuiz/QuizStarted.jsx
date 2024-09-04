import { useEffect, useState } from "react";
import { IoMdStopwatch } from "react-icons/io";
import { showToast } from "../Toast";
import { useNavigate } from "react-router-dom";

function QuizStarted({ quiz, onEnd, setScore }) {
  const [timeLeft, setTimeLeft] = useState(quiz.max_time);
  const [userAnswers, setUserAnswers] = useState({});
  const [leaveQuiz, setLeaveQuiz] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmitQuiz();
      // Logic to handle what happens when time is up
      showToast("Quiz ended", "success");
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const handleOptionChange = (questionIndex, selectedOption) => {
    //console.log(selectedOption);
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: selectedOption,
    }));
  };

  const handleSubmitQuiz = () => {
    //console.log(userAnswers);
    let score = 0;

    quiz.questions.forEach((question, index) => {
      const correctAnswer = question.correct_answer;
      const userAnswer = userAnswers[index];
      //console.log(correctAnswer, userAnswer);

      if (userAnswer === correctAnswer) {
        score += 10; // Each correct answer gives 10 marks
      }
    });
    setScore(score);
    onEnd(score);
    showToast(`Quiz Ended!`, "success");
  };
  return (
    <div className="atmptQuizContainer">
      <div className="container py-5 d-flex justify-content-center">
        {leaveQuiz ? (
          <div className="row p-4 pb-0  pt-lg-5 align-items-center rounded-3 border shadow-lg atmptQuizInside ">
            <span className="text-center fs-5">
              Are You Sure, You want to leave the Quiz
            </span>{" "}
            <div className="w-100 d-flex gap-3">
              <div
                className="btn btn-large text-white fs-4   my-5 w-50"
                style={{
                  backgroundColor: "#3C096C",
                }}
                onClick={() => navigate("/")}
              >
                Yes
              </div>
              <div
                className="btn btn-large text-white fs-4   my-5 w-50"
                style={{
                  backgroundColor: "#3C096C",
                }}
                onClick={() => setLeaveQuiz(false)}
              >
                No
              </div>
            </div>
          </div>
        ) : (
          <div className="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg atmptQuizInside">
            <div className="d-flex align-items-center justify-content-between mb-5 pe-5">
              <h1>{quiz.name}</h1>
              <span
                className="rounded px-4 py-1 text-white d-flex align-items-center gap-2"
                style={{ backgroundColor: "#3C096C" }}
              >
                <IoMdStopwatch />
                <span>{timeLeft}</span>
              </span>
            </div>

            <hr className="w-100" />
            {quiz.questions.map((question, index) => {
              const options = [
                question.option1,
                question.option2,
                question.option3,
                question.option4,
              ];
              return (
                <>
                  <div className="mb-4">
                    <div className="fs-4">
                      <span>{index + 1}.</span>{" "}
                      <span className="ms-3">{question.text}</span>
                    </div>
                    <div className="my-3 ms-5 fs-5">
                      {options.map((option, optionIndex) => {
                        return (
                          <div className="form-check mb-1">
                            <input
                              id={optionIndex}
                              name={`options${index}`}
                              type="radio"
                              value={option}
                              className="form-check-input focus-ring focus-ring-light"
                              onChange={(e) =>
                                handleOptionChange(index, e.target.value)
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={optionIndex}
                            >
                              {option}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })}
            <div className="d-flex justify-content-between px-5">
              <div
                className="btn btn-large text-white fs-4  my-5"
                style={{
                  backgroundColor: "#3C096C",
                  width: "max-content",
                }}
                onClick={handleSubmitQuiz}
              >
                Submit
              </div>
              <div
                className="btn btn-large text-white fs-4   my-5"
                style={{
                  backgroundColor: "#3C096C",
                }}
                onClick={() => setLeaveQuiz(true)}
              >
                Exit Quiz
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizStarted;
