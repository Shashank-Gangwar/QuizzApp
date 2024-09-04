import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { updateNavigation } from "../../store/navigationSlice";
import { useNavigate } from "react-router-dom";
import { showToast } from "../Toast";

function QuizCode() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const quizCodeRef = useRef(0);

  const handleStartQuiz = () => {
    const code = quizCodeRef.current.value;
    if (code < 1) {
      showToast("Please enter valid code", "error");
      return;
    }
    navigate(`/attempt-quiz/${code}`);
  };
  return (
    <div
      className="modal-content rounded-4 shadow w-100 mt-5 bg-white"
      style={{ maxWidth: "300px" }}
    >
      <div className="modal-body p-4 pt-0 mt-4">
        <div className="form-floating mb-3">
          <input
            type="number"
            className="form-control rounded-3 focus-ring focus-ring-light"
            id="floatingInput"
            placeholder="Enter Code Here ..."
            autoComplete="off"
            ref={quizCodeRef}
          />
          <label htmlFor="floatingInput">Enter Code Here ...</label>
        </div>
        <div className="d-flex gap-2">
          <button
            className="w-100 mb-2 btn  rounded-3 btn-danger"
            onClick={() => {
              dispatch(updateNavigation("inventory"));
            }}
          >
            Close
          </button>
          <button
            className="w-100 mb-2 btn  rounded-3 text-white"
            style={{ backgroundColor: "#3C096C" }}
            onClick={handleStartQuiz}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizCode;
