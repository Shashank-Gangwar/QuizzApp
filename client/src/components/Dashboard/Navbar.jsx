import { useState } from "react";
import { IoPersonOutline, IoLogOutOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { updateNavigation } from "../../store/navigationSlice";
import { showToast } from "../Toast";
import { useNavigate } from "react-router-dom";
import { updateLoggingOut } from "../../store/userSlice";
import toast from "react-hot-toast";
import { apiCallWithAuth, loggingOut } from "../../APIs/apiCalls";

function Navbar() {
  const [dropProfile, setDropProfile] = useState(false);
  const { userDetails } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    showToast("Logging Out", "loading");
    const response = await apiCallWithAuth(loggingOut);
    if (response.status == 200) {
      //console.log(response.data);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      toast.dismiss();
      dispatch(updateLoggingOut({}));
      navigate("/login");
      showToast("Logout Successful", "success");
    } else {
      showToast("Couldn't able to logout", "error");
      //console.log(response);
    }
  };
  return (
    <>
      <header className="p-4 py-sm-3 myHeader">
        <div className="d-flex align-items-center justify-content-between justify-content-md-end">
          <a
            href="/"
            className=" d-flex d-md-none align-items-center me-md-auto text-white text-decoration-none logo "
          >
            <img
              src="..\public\Quizard_logo_white.png"
              alt="logo"
              height={60}
              width={60}
            />
            <span className="fs-1 px-2">Quizzard</span>
          </a>

          <div className="d-flex align-items-center ">
            <div
              className="border rounded px-5 py-2  px-sm-3 py-sm-1 bg-light mx-4"
              style={{ cursor: "pointer" }}
              onClick={() => {
                dispatch(updateNavigation("quizCode"));
              }}
            >
              Enter Code
            </div>

            <div
              className="position-relative rounded-3 ps-2  fs-5 text-white"
              style={{ backgroundColor: "#3C096C" }}
              onClick={() => setDropProfile(!dropProfile)}
            >
              {userDetails.username} {"▾"}
              <div
                className={`${
                  !dropProfile && "d-none"
                } position-absolute end-0 top-100 mt-2`}
              >
                <ul
                  className="dropdown-menu d-block position-static mx-0 shadow w-220px "
                  style={{ cursor: "pointer" }}
                >
                  <li>
                    <a
                      className=" btn text-black d-flex gap-2 align-items-center "
                      onClick={() => {
                        dispatch(updateNavigation("profile"));
                      }}
                    >
                      <IoPersonOutline />
                      Profile
                    </a>
                  </li>

                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a
                      className=" btn text-danger d-flex gap-2 align-items-center "
                      onClick={handleLogout}
                    >
                      <IoLogOutOutline />
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;
