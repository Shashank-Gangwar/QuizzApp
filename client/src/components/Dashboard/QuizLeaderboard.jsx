import { useSelector } from "react-redux";

function QuizLeaderboard({ id }) {
  const { globalLeaderboard } = useSelector((state) => state.leaderboard);
  return (
    <div className="d-flex flex-column  align-items-center justify-content-center me-5 mt-5 ">
      <div className="list-group w-100 ">
        <div
          className={`list-group-item  d-flex  p-0 rounded-0 ${
            !globalLeaderboard.length && "d-none"
          }`}
        >
          <div className="d-flex gap-2 w-100 justify-content-between py-1 px-2 ">
            <h6> Rank </h6>
            <h6 className="ms-5"> User </h6>
            <h6 className="text-nowrap">Score</h6>
          </div>
        </div>
      </div>
      <div className="list-group w-100 leaderboardList ">
        {globalLeaderboard.map((leaders, index) => {
          return (
            <div className="list-group-item  d-flex p-0" key={leaders?.rank}>
              <div className="d-flex gap-2 w-100 justify-content-between leaderboardListItem">
                <h6> {leaders?.rank} </h6>
                <h6 className="ms-5"> {leaders?.username} </h6>
                <h6 className="text-nowrap">{leaders?.average_score}</h6>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default QuizLeaderboard;
