import React, { useEffect, useState } from "react";
import Quizes from "./Quizes";
import Filters from "./Filters";
import { useSelector } from "react-redux";

function Inventory() {
  const { allQuizzes } = useSelector((state) => state.quiz);
  const [searchedQuiz, setSearchedQuiz] = useState(allQuizzes);

  useEffect(() => {
    setSearchedQuiz(allQuizzes);
  }, [allQuizzes]);

  const handleSearchQuiz = (e) => {
    const query = e.target.value.toLowerCase();

    const filteredQuizzes = allQuizzes.filter((quiz) =>
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
          <label htmlFor="floatingInput">Search Quiz in Inventory</label>
        </div>
        <button className="btn bg-white" type="button">
          {">"}
        </button>
      </div>

      <div className="d-block gap-4 d-md-flex w-100 ">
        <Filters />
        <Quizes quizzes={searchedQuiz} />
      </div>
    </>
  );
}

export default Inventory;
