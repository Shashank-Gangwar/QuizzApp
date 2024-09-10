import { useEffect, useRef, useState } from "react";
import { IoArrowBackOutline, IoCheckmarkDone } from "react-icons/io5";
import { FaDeleteLeft } from "react-icons/fa6";
import Accordion from "react-bootstrap/Accordion";
import { showToast } from "../components/Toast.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiCallWithAuth, createNewQuiz } from "../APIs/apiCalls.js";

function CreateQuiz() {
  const { loggedIn, userDetails } = useSelector((state) => state.user);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  //console.log("CreateQuiz");
  useEffect(() => {
    if (!loggedIn) {
      if (localStorage.getItem("access_token")) {
        navigate("/");
        setPageLoading(false);
      } else {
        navigate("/login");
        setPageLoading(false);
      }
    } else if (userDetails.role !== "admin") {
      showToast("Unauthorized", "error");
      navigate("/");
      setPageLoading(false);
    } else {
      setPageLoading(false);
    }
  }, [loggedIn]);

  const [tags, setTags] = useState([]);
  const [time, setTime] = useState("00:01");
  const [difficulty, setDifficulty] = useState("easy");
  const [questions, setQuestions] = useState([
    {
      text: "",
      options: ["", "", "", ""],
      correct_answer: "",
      tags: [],
    },
  ]);
  const quizNameRef = useRef("");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: ["", "", "", ""],
        correct_answer: "",
        tags: [],
      },
    ]);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index, text) => {
    // //console.log(index, text);
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = text;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, optionText) => {
    // console.log(questionIndex, optionIndex, optionText);
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = optionText;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, answer) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correct_answer = answer;
    setQuestions(updatedQuestions);
  };

  const handleAddTag = (e) => {
    if (e.key == "Enter") {
      setTags([...tags, e.target.value]);
      e.target.value = "";
    }
  };

  const handleRemoveTag = (e) => {
    const removeTag = e.target.id;
    setTags(tags.filter((tag, index) => index !== Number(removeTag)));
  };

  const handleCreateQuiz = async () => {
    const name = quizNameRef.current.value;
    // structuring the questions according to server requests
    const transformedQuestions = questions.map((question) => {
      const [option1, option2, option3, option4] = question.options;

      return {
        text: question.text,
        option1,
        option2,
        option3,
        option4,
        correct_answer: question.correct_answer,
        tags: question.tags,
      };
    });

    // Validating the the whole quiz
    if (name === "") {
      showToast("Please enter the quiz name.", "error");
      return;
    }
    if (time === "00:00") {
      showToast("Time cannot be 00:00", "error");
      return;
    }
    if (tags.length === 0) {
      showToast("Please enter at least one Tag.", "error");
      return;
    }
    // validating for questions
    for (let i = 0; i < transformedQuestions.length; i++) {
      const ques = transformedQuestions[i];
      // Check if the question text is empty
      if (ques.text === "") {
        showToast(`Enter question${i + 1}`, "error");
        return;
      }
      // Check if all options are given
      if (!ques.option1 || !ques.option2 || !ques.option3 || !ques.option4) {
        showToast(`All options are needed for question ${i + 1}`, "error");
        return;
      }
      // Check if the correct answer is given
      if (!ques.correct_answer) {
        showToast(
          `Please select the correct answer for question ${i + 1}`,
          "error"
        );
        return;
      }
    }

    // converting hh:mm srting into seconds number
    const [hours, minutes] = time.split(":").map(Number);
    const totalSeconds = hours * 3600 + minutes * 60;

    const quiz = {
      name: name,
      max_time: totalSeconds,
      difficulty: difficulty,
      tags: tags,
      questions: transformedQuestions,
    };
    // console.log(quiz);
    setPageLoading(true);

    const response = await apiCallWithAuth(() => createNewQuiz(quiz));
    if (response.status == 200) {
      showToast("Quiz Created Successfully", "success");
      setPageLoading(false);
      //console.log(response);
      setDifficulty("easy");
      setTags([]);
      setTime("00:01");
      setQuestions([
        {
          text: "",
          options: ["", "", "", ""],
          correct_answer: "",
          tags: [],
        },
      ]);
    } else {
      //console.log(response);
      showToast("Error : Failed to Create Quiz", "success");
      setPageLoading(false);
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
    <div className="w-100" style={{ overflowX: "hidden" }}>
      <div className="container ">
        <header className="d-flex justify-content-between align-items-center py-3">
          <div>
            <a
              href="/"
              className=" d-flex align-items-center me-md-auto text-decoration-none logo "
            >
              <img
                src="/Quizard_logo_lavander.png"
                alt="logo"
                height={60}
                width={60}
              />
              <span className="fs-1 px-2" style={{ color: "#5d2295" }}>
                Quizzard
              </span>
            </a>
          </div>
          <div
            className="btn btn-lg text-white rounded py-2 px-3"
            style={{ backgroundColor: "#3C096C" }}
            onClick={() => navigate(-1)}
          >
            <IoArrowBackOutline />
            <span className="ms-1">Go Back</span>
          </div>
        </header>
      </div>
      <div className="container  mb-5">
        <div className="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow mx-1 mx-md-0">
          <div className="p-3 p-lg-5 pt-lg-3">
            <input
              className=" btn fw-bold lh-1 fs-2 fs-lg-1  text-start w-100"
              placeholder="Enter Your Quiz name here"
              ref={quizNameRef}
            />
            <div className="mt-3">
              <div className="rounded tagsInput p-1 mt-1 ">
                <ul className="taglist ">
                  {tags.map((tag, index) => {
                    return (
                      <li className="tag rounded user-select-none" key={index}>
                        <span className="p-2 ">{tag}</span>
                        <button
                          type="button"
                          className="btn-close bg-white p-1 me-1"
                          id={index}
                          onClick={handleRemoveTag}
                        ></button>
                      </li>
                    );
                  })}
                </ul>

                <input
                  type="text"
                  className="form-control focus-ring focus-ring-light"
                  placeholder="Enter Quiz tags here..."
                  style={{ width: "max-content" }}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>
            <div className="w-100 mt-3 d-flex align-items-center gap-2">
              <label htmlFor="" className="ms-2 ">
                Max Time (hh:mm) :
              </label>
              <input
                type="time"
                value={time}
                className="form-control"
                placeholder="Time"
                style={{ width: "max-content" }}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="d-flex gap-3 mt-3">
              <span className="ms-2">Difficulty :</span>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDifficulty"
                  id="easy"
                  value="easy"
                  checked={difficulty == "easy"}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={
                    difficulty === "easy"
                      ? { backgroundColor: "#3C096C", borderColor: "#3C096C" }
                      : {}
                  }
                />
                <label className="form-check-label" htmlFor="easy">
                  Easy
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDifficulty"
                  id="medium"
                  value="medium"
                  checked={difficulty == "medium"}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={
                    difficulty === "medium"
                      ? { backgroundColor: "#3C096C", borderColor: "#3C096C" }
                      : {}
                  }
                />
                <label className="form-check-label" htmlFor="medium">
                  Medium
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDifficulty"
                  id="hard"
                  value="hard"
                  checked={difficulty == "hard"}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={
                    difficulty === "hard"
                      ? { backgroundColor: "#3C096C", borderColor: "#3C096C" }
                      : {}
                  }
                />
                <label className="form-check-label" htmlFor="hard">
                  Hard
                </label>
              </div>
            </div>
          </div>

          <Accordion defaultActiveKey="0">
            {questions.map((question, index) => {
              return (
                <Accordion.Item eventKey={index} key={index}>
                  <Accordion.Button>
                    Q{index + 1}.{" "}
                    <input
                      type="text"
                      className="form-control focus-ring focus-ring-light mx-3 border-0"
                      placeholder="Enter Question here..."
                      value={question.text}
                      onKeyDown={(e) => {
                        if (e.key === " ") {
                          e.stopPropagation();
                        }
                      }}
                      onChange={(e) =>
                        handleQuestionChange(index, e.target.value)
                      }
                    />{" "}
                    <div
                      className="btn rounded-2 btn-outline-light text-danger border-0 mx-4 p-0 px-2 fs-4"
                      style={{ width: "max-content" }}
                      onClick={() => removeQuestion(index)}
                    >
                      <FaDeleteLeft />
                    </div>
                  </Accordion.Button>

                  <Accordion.Body>
                    <div>
                      {question.options.map((option, optionindex) => {
                        return (
                          <div
                            className="form-check d-flex align-items-center"
                            key={optionindex}
                          >
                            <input
                              className="form-check-input rounded-1"
                              type="radio"
                              name={`options${index}`}
                              value={option}
                              checked={
                                option !== "" &&
                                option == question.correct_answer
                              }
                              id={`flexCheckOption${optionindex + 1}`}
                              onChange={() =>
                                handleCorrectAnswerChange(index, option)
                              }
                            />
                            <input
                              type="text"
                              htmlFor={`flexCheckOption${optionindex + 1}`}
                              value={option}
                              className="form-control focus-ring focus-ring-light mx-3"
                              placeholder={`Option ${optionindex + 1}`}
                              onChange={(e) =>
                                handleOptionChange(
                                  index,
                                  optionindex,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>
          <div
            className="btn btn-secondary w-25 ms-2 my-3"
            onClick={addQuestion}
          >
            Add Question
          </div>
        </div>
        <div
          className=" btn btn-lg text-white rounded py-2 px-4 w-100 mt-5"
          style={{ backgroundColor: "#3C096C" }}
          onClick={handleCreateQuiz}
        >
          <IoCheckmarkDone /> Create
        </div>
      </div>
    </div>
  );
}

export default CreateQuiz;
