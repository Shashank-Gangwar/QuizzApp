import { useSelector } from "react-redux";
import Quizes from "./Quizes";
import { useState } from "react";
import { GrScorecard } from "react-icons/gr";
import { GoStopwatch } from "react-icons/go";
import { MdOutlineSignalCellularAlt } from "react-icons/md";
import { PiRankingFill } from "react-icons/pi";

function MyAttempts() {
  const { attemptedQuizzes } = useSelector((state) => state.quiz);

  function secondsToMinutes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds} min`;
  }

  return attemptedQuizzes.length == 0 ? (
    <div className="w-75 d-flex align-items-center justify-content-center fs-3 mt-5">
      No Quiz to Show.
    </div>
  ) : (
    <center className="w-100 quizContainer mt-4">
      <div className=" py-1 px-0 px-md-2 gap-3 d-flex flex-wrap justify-content-center">
        {attemptedQuizzes.map((quiz, index) => {
          return (
            <div
              className="px-4 py-2 d-flex flex-column  border rounded-3 w-auto bg-light quizBox"
              key={index}
              style={{ width: "max-content" }}
            >
              <h3 className="fw-bold mb-0 fs-5 cursorText">{quiz.quiz_name}</h3>
              <div
                className="d-flex flex-column justify-content-between"
                style={{ height: "100%" }}
              >
                <div className="mt-2">
                  <div className="d-flex align-items-center  rounded  mb-1 cursorText">
                    <GoStopwatch />
                    <span className="ms-1">
                      {secondsToMinutes(quiz.max_time)}
                    </span>
                  </div>
                  <div className=" d-flex align-items-center rounded mb-1 cursorText">
                    <MdOutlineSignalCellularAlt />
                    <span className="ms-1">{quiz.difficulty}</span>
                  </div>
                  <div className=" d-flex align-items-center rounded  mb-4 cursorText">
                    <GrScorecard />
                    <span className="ms-1">Score: {quiz.score}</span>
                  </div>
                </div>
                <div className=" d-flex gap-2 ">
                  <div
                    className="btn py-1 text-light"
                    style={{ backgroundColor: "#3C096C" }}
                  >
                    Leaderboard
                    <span className="ms-1 pb-1">
                      <PiRankingFill />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </center>
  );
}

export default MyAttempts;
