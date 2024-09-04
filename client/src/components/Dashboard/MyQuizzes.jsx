import { useSelector } from "react-redux";
import Quizes from "./Quizes";
import { useEffect, useState } from "react";

function MyQuizzes() {
  const { myQuizzes } = useSelector((state) => state.quiz);
  const [searchedQuiz, setSearchedQuiz] = useState(myQuizzes);

  useEffect(() => {
    setSearchedQuiz(myQuizzes);
  }, [myQuizzes]);

  const handleSearchQuiz = (e) => {
    const query = e.target.value.toLowerCase();

    const filteredQuizzes = myQuizzes.filter((quiz) =>
      quiz.name.toLowerCase().includes(query)
    );

    // console.log(filteredQuizzes);
    setSearchedQuiz(filteredQuizzes);
  };
  return (
    <>
      <div className="d-flex flex-column flex-sm-row w-75 border rounded searchbar bg-white">
        <div className="form-floating w-100 ">
          <input
            type="text"
            className="form-control border-0 focus-ring focus-ring-light "
            id="floatingInput"
            placeholder="Search"
            autoComplete="off"
            onChange={handleSearchQuiz}
          />
          <label htmlFor="floatingInput">Search Quiz your Quizzes</label>
        </div>
        <button className="btn bg-white" type="button">
          {">"}
        </button>
      </div>

      <Quizes quizzes={searchedQuiz} />
    </>
  );
}

export default MyQuizzes;
