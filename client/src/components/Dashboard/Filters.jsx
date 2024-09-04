import { useRef, useState } from "react";
import { FiFilter } from "react-icons/fi";
import {
  apiCallWithAuth,
  getAllQuizzes,
  getFilterQuizzes,
} from "../../APIs/apiCalls";
import { showToast } from "../Toast";
import toast from "react-hot-toast";
import { setAllQuiz } from "../../store/quizSlice";
import { useDispatch } from "react-redux";

function Filters() {
  const [tags, setTags] = useState([]);
  const [time, setTime] = useState("23:59:59");
  const difficultyRef = useRef();
  const dispatch = useDispatch();

  const handleFilterQuiz = async () => {
    const difficulty = difficultyRef.current.value;

    // converting hh:mm:ss srting into seconds number
    const [hours, minutes, seconds] = time.split(":").map(Number);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (!difficulty && !tags.length && totalSeconds === 86399) {
      showToast("No filter Applied", "error");
      return;
    }

    if (totalSeconds < 60) {
      showToast("Time Should be greater than 60 second", "error");
      return;
    }
    showToast("Applying Filters", "loading");
    //console.log(tags);
    const response = await apiCallWithAuth(() =>
      getFilterQuizzes(tags, totalSeconds, difficulty)
    );
    if (response.status == 200) {
      //console.log(response.data);
      dispatch(setAllQuiz(response.data.quizzes));
      toast.dismiss();
      showToast("Quizzes filtered successfuly", "success");
    } else {
      showToast("Filtering quiz failed", "error");
      //console.log(response);
    }
  };

  const handleReloadInventory = async () => {
    showToast("refreshing", "loading");
    const response = await apiCallWithAuth(getAllQuizzes);
    if (response.status == 200) {
      //console.log(response.data);
      dispatch(setAllQuiz(response.data));
      toast.dismiss();
      setTags([]);
      setTime("23:59:59");
      difficultyRef.current.value = "";
      showToast("Refreshed Successful", "success");
    } else {
      showToast("Refresh Failed", "error");
      //console.log(response);
    }
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

  return (
    <div className="p-3 bg-body-secondary rounded-3 mt-4 fiterDiv w-25">
      <span className="fs-5 fw-bold">
        <FiFilter /> Filter Quiz
      </span>
      <hr />
      <div className="w-100">
        <span className="ms-2 w-100 fw-bold">Difficulty</span>
        <select
          className="form-select bg-light focus-ring focus-ring-light "
          id="difficulty"
          ref={difficultyRef}
        >
          <option value="">None</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="w-100 mt-3">
        <label htmlFor="" className="ms-2 fw-bold w-100 ">
          Max Time
        </label>
        <input
          type="time"
          value={time}
          className="form-control"
          placeholder="Time"
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <div className="mt-3">
        <span className="px-2 fw-bold">Tags</span>
        <div className="rounded tagsInput p-1 mt-1">
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
            placeholder="Enter tag here..."
            onKeyDown={handleAddTag}
          />
        </div>
      </div>

      <div className="w-100 gap-2 d-flex justify-content-end mt-4">
        <button
          className=" btn text-light"
          style={{ backgroundColor: "#3C096C" }}
          type="button"
          onClick={handleReloadInventory}
        >
          Refresh
        </button>
        <button
          className="btn text-light"
          style={{ backgroundColor: "#3C096C" }}
          type="button"
          onClick={handleFilterQuiz}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export default Filters;
