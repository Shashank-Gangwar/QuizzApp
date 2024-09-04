import React from "react";
import { useSelector } from "react-redux";

function LeaderBoard() {
  const { globalLeaderboard } = useSelector((state) => state.leaderboard);
  const topThree = globalLeaderboard.slice(0, 3);
  const others = globalLeaderboard.slice(3);
  console.log(topThree);

  return (
    <div className="leaderboard w-100 d-flex flex-column align-items-center">
      <div className=" mb-3 text-center w-100 me-0 me-lg-5 d-flex justify-content-center ">
        <div className="mt-5 podium">
          <img
            src="../public/silver_medal.png"
            alt="Silver"
            width={100}
            height={100}
          />
          <h1 className="w-auto">
            {Math.round(topThree[1]?.average_score * 100) / 100}
          </h1>
          <h6 className="w-auto">{topThree[1]?.username}</h6>
        </div>
        <div className=" podium">
          <img
            src="../public/gold_medal.png"
            alt="Silver"
            width={100}
            height={100}
          />
          <h1 className="w-auto ">
            {Math.round(topThree[0]?.average_score * 100) / 100}
          </h1>
          <h6 className="w-auto ">{topThree[0]?.username}</h6>
        </div>
        <div className="mt-5 podium">
          <img
            src="../public/bronze_medal.png"
            alt="Silver"
            width={100}
            height={100}
          />
          <h1 className="w-auto">
            {Math.round(topThree[2]?.average_score * 100) / 100}
          </h1>
          <h6 className="w-auto">{topThree[2]?.username}</h6>
        </div>
      </div>

      <div className="d-flex flex-column  align-items-center justify-content-center w-75 me-5 mt-5 ">
        <div className="list-group w-100 ">
          <div
            className={`list-group-item  d-flex  p-0 rounded-0 ${
              !others.length && "d-none"
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
          {others.map((leaders, index) => {
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
    </div>
  );
}

export default LeaderBoard;
