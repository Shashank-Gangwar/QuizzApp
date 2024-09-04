import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { IoPersonOutline } from "react-icons/io5";
import { MdLockOutline, MdLock, MdOutlineEmail } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";
import { Login_url, Register_url } from "../APIs/api.js";
import { showToast } from "../components/Toast.jsx";

function LoginRegister() {
  const { loggedIn } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("Login");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("user");
  const [autoLog, setAutoLog] = useState(true);
  const usernameRef = useRef("");
  const pwdRef = useRef("");
  const confirmPwdRef = useRef("");
  const emailRef = useRef("");

  useEffect(() => {
    loggedIn && navigate("/");
    setLoading(false);
  }, []);

  const handleOnsubmit = (e) => {
    e.preventDefault();
    if (checkIn == "Login") {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  };

  const handleLogin = async () => {
    const username = usernameRef.current.value;
    const password = pwdRef.current.value;

    if (username.length < 1) {
      setErrorMsg("Username invalid");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password should have at leat 6 character");
      return;
    }

    pwdRef.current.value = "";
    setErrorMsg("");
    setLoading(true);

    await axios
      .post(
        Login_url,
        {
          username: username,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((response) => {
        //console.log("Login successful", response.data);
        showToast("Login successful", "success");
        // Store tokens or user data as needed
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);

        dispatch(addUser(response.data.user));
        navigate("/");
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        //console.log(error);
        if (error.response) {
          showToast(error.response.data.detail, "error");
        } else {
          showToast(error.message, "error");
        }

        // console.error(
        //   "Error during login:",
        //   error.response && error.response.data
        // );
      });
  };

  const handleRegister = async () => {
    const username = usernameRef.current.value;
    const password = pwdRef.current.value;
    const confirmPassword = confirmPwdRef.current.value;
    const email = emailRef.current.value;

    if (username.length < 1) {
      setErrorMsg("Username invalid");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password should have at leat 6 character");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Confirm password doesn't match.");
      return;
    }

    pwdRef.current.value = "";
    confirmPwdRef.current.value = "";
    setErrorMsg("");
    setLoading(true);

    await axios
      .post(
        Register_url,
        {
          username,
          email,
          password,
          role,
          login: autoLog,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        //console.log("Register successful", response?.data);
        showToast("Register successful", "success");
        if (autoLog) {
          // Store tokens or user data as needed
          localStorage.setItem("access_token", response.data?.access_token);
          localStorage.setItem("refresh_token", response.data?.refresh_token);

          dispatch(addUser(response?.data?.user));
          navigate("/");
        } else {
          usernameRef.current.value = "";
          emailRef.current.value = "";
          setCheckIn("Login");
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        showToast(error.message, "error");
        //console.error(
        //   "Error during login:",
        //   error.response ? error.response.data : error.message
        // );
      })
      .finally(() => setLoading(false));
  };

  return loading ? (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh", width: "100vw" }}
    >
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ) : (
    <div className="loginPage">
      <div className="loginRegister">
        <div className="d-flex align-items-center justify-content-center mb-5 ">
          <img
            src="..\public\Quizard_logo_lavander.png"
            alt="logo"
            height={80}
            width={80}
          />
          <h1 className="  logoLogin">Qizzard</h1>
        </div>

        <form onSubmit={handleOnsubmit} className="mx-5">
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control border-0 border-bottom focus-ring focus-ring-light"
              id="floatingUsername"
              placeholder="Username"
              autoComplete="off"
              ref={usernameRef}
            />
            <label htmlFor="floatingUsername">
              <IoPersonOutline /> Username
            </label>
          </div>

          {checkIn === "Register" && (
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control border-0 border-bottom focus-ring focus-ring-light mb-2"
                id="floatingEmail"
                placeholder="email"
                ref={emailRef}
              />
              <label htmlFor="floatingEmail">
                <MdOutlineEmail /> Email
              </label>
            </div>
          )}

          <div className="form-floating">
            <input
              type="password"
              className="form-control border-0 border-bottom focus-ring focus-ring-light"
              id="floatingPassword"
              placeholder="Password"
              ref={pwdRef}
            />
            <label htmlFor="floatingPassword">
              <MdLockOutline /> Password
            </label>
          </div>

          {checkIn === "Register" && (
            <>
              <div className="form-floating">
                <input
                  type="password"
                  className="form-control border-0 border-bottom focus-ring focus-ring-light mt-2 mb-2"
                  id="floatingConfirmPassword"
                  placeholder="ConfirmPassword"
                  ref={confirmPwdRef}
                />
                <label htmlFor="floatingConfirmPassword">
                  <MdLock /> Confirm Password
                </label>
              </div>

              <div className="form-floating d-flex align-items-center mt-4">
                <span className="text-nowrap me-4">Register As </span>

                <div className="form-check mx-2">
                  <input
                    value="user"
                    name="loginAs"
                    type="radio"
                    className="form-check-input"
                    checked={role == "user"}
                    onChange={(e) => setRole(e.target.value)}
                    style={
                      role === "user"
                        ? { backgroundColor: "#3C096C", borderColor: "#3C096C" }
                        : {}
                    }
                  />
                  <label className="form-check-label" htmlFor="credit">
                    User
                  </label>
                </div>
                <div className="form-check mx-2">
                  <input
                    value="admin"
                    name="loginAs"
                    type="radio"
                    className="form-check-input"
                    checked={role == "admin"}
                    onChange={(e) => setRole(e.target.value)}
                    style={
                      role === "admin"
                        ? { backgroundColor: "#3C096C", borderColor: "#3C096C" }
                        : {}
                    }
                  />
                  <label className="form-check-label" htmlFor="debit">
                    Admin
                  </label>
                </div>
              </div>

              <div className="form-check mt-4">
                <label className="form-check-label" htlmfor="autoLogin">
                  Auto Login ?
                </label>
                <input
                  className="form-check-input"
                  style={
                    autoLog
                      ? { backgroundColor: "#3C096C", borderColor: "#3C096C" }
                      : {}
                  }
                  type="checkbox"
                  id="autoLogin"
                  checked={autoLog}
                  onChange={(e) => setAutoLog(!autoLog)}
                />
              </div>
            </>
          )}

          <div className="form-floating my-3">
            <span className={`${!errorMsg && "d-none"} text-danger ms-1`}>
              {errorMsg}
            </span>
          </div>

          <button
            className="btn w-100 py-2 mt-2 text-white"
            type="submit"
            style={{ backgroundColor: "#3C096C" }}
          >
            {checkIn === "Register" ? "Register" : "Login"}
          </button>

          <div
            className={`${
              checkIn === "Register" && "d-none"
            } mt-3 d-flex flex-column`}
          >
            Test Credentials{" "}
            <span>username : testadmin , password : testadmin123</span>
          </div>

          <p className="mt-5 mb-3 text-end">
            {checkIn === "Login" ? "New User?" : "Already have an Account?"}{" "}
            <a
              className="text-decoration-none "
              onClick={() => {
                checkIn === "Register"
                  ? setCheckIn("Login")
                  : setCheckIn("Register");
                setErrorMsg("");
              }}
              style={{ cursor: "pointer", color: "#5A189A" }}
            >
              {checkIn === "Login" ? "Register Here..." : "Login."}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginRegister;
