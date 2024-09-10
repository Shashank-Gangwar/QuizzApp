import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateEmail, updateUsername } from "../../store/userSlice";
import { showToast } from "../Toast";
import {
  apiCallWithAuth,
  updateNewEmail,
  updateNewUsername,
  updatePassword,
} from "../../APIs/apiCalls";
import toast from "react-hot-toast";

function Profile() {
  const { userDetails } = useSelector((state) => state.user);
  const [changePwd, setChangePwd] = useState(false);
  const dispatch = useDispatch();
  const usernameRef = useRef();
  const emailRef = useRef();
  const currentPwdRef = useRef();
  const newPwdRef = useRef();
  const confirmNewPwdRef = useRef();

  const handleChangePwd = async (e) => {
    e.preventDefault();
    const oldPassword = currentPwdRef.current.value;
    const newPassword = newPwdRef.current.value;
    const confirmNewPassword = confirmNewPwdRef.current.value;

    if (oldPassword.length < 6) {
      showToast("Invalid Old password", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast("Confirm password Doesn't match", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New Password should have at least 6 charaters", "error");
      return;
    }
    showToast("Updating Password", "loading");
    const { response, status } = await apiCallWithAuth(() =>
      updatePassword(oldPassword, newPassword)
    );
    if (status == 200) {
      toast.dismiss();
      showToast("Password Updated Successfully", "success");
      setChangePwd(false);
    } else {
      toast.dismiss();
      showToast(response?.data?.detail, "error");
      // //console.log(response);
    }
  };

  const handleUpdateUserDetails = async () => {
    const newUsername = usernameRef.current.value;
    const newEmail = emailRef.current.value;
    if (newUsername === "" && newEmail === "") {
      return;
    }

    if (newUsername) {
      if (newUsername === userDetails.username) {
        showToast("Please write New Username to make changes!", "error");
        return;
      }
      // showToast("Updating Username", "loading");
      const { response, status, data } = await apiCallWithAuth(() =>
        updateNewUsername(newUsername)
      );
      if (status == 200) {
        // toast.dismiss();
        showToast("Username Updated Successfully", "success");
        dispatch(updateUsername(newUsername));
        localStorage.setItem("access_token", data.access_token);
      } else {
        // toast.dismiss("");
        if (response.data.detail) {
          showToast(response.data.detail, "error");
        } else showToast("Failed to Update Username ", "error");
        //console.log(response);
        return;
      }
    }

    if (newEmail) {
      if (newEmail === userDetails.email) {
        showToast("Please write New Email to make changes!", "error");
        return;
      }
      // showToast("Updating email", "loading");
      const { response, status } = await apiCallWithAuth(() =>
        updateNewEmail(newEmail)
      );
      if (status == 200) {
        // toast.dismiss();
        showToast("Email Updated Successfully", "success");
        dispatch(updateEmail(newEmail));
      } else {
        // toast.dismiss();
        if (response.data.detail) {
          showToast(response.data.detail, "error");
        } else showToast("Failed to Update Email ", "error");
        //console.log(response);
        return;
      }
    }
  };

  return (
    <>
      <div
        className={`${
          changePwd && "d-none"
        } mx-3 p-5 text-center bg-body-tertiary rounded-3 d-flex align-items-center justify-content-start gap-4 border w-100`}
      >
        <div className="profileImg">{userDetails?.username?.charAt(0)}</div>
        <div className="pb-4 d-flex flex-column align-items-start justify-content-center">
          <div className="d-flex  align-items-center justify-content-start gap-4 my-3">
            <h1>{userDetails.username}</h1>
            <span
              className=" py-1 px-3 rounded-2 text-white "
              style={{ backgroundColor: "#3C096C" }}
            >
              {userDetails.role} Account
            </span>
          </div>
          <h4>{userDetails.email}</h4>
          <span>
            Created On{": "} {userDetails?.created_at?.slice(11, 19)}
            {", "}
            {userDetails?.created_at?.slice(0, 10)}
          </span>
        </div>
      </div>

      <div
        className={`${
          changePwd && "d-none"
        } mx-3 my-2 p-3 text-center bg-body-tertiary rounded-3 d-flex align-items-start justify-content-center flex-column gap-4 border w-100`}
      >
        <h4 className="border-bottom pb-4 w-100 text-start">Update Profile</h4>
        <div className="d-flex gap-4 align-items-end">
          <div className="text-start">
            <label htmlFor="username" className="form-label fs-5">
              New Username
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Username"
                autoComplete="off"
                ref={usernameRef}
              />
            </div>
          </div>

          <div className="text-start">
            <label htmlFor="email" className="form-label fs-5">
              New Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="you@example.com"
              autoComplete="off"
              ref={emailRef}
            />
          </div>
          <div
            className="btn rounded-3 px-3 py-2 text-white"
            style={{ backgroundColor: "#3C096C" }}
            onClick={handleUpdateUserDetails}
          >
            Save Changes
          </div>
        </div>
        <div
          className=" btn rounded-3 px-3 py-2 text-white"
          style={{ backgroundColor: "#3C096C" }}
          onClick={() => setChangePwd(true)}
        >
          Change Password
        </div>
      </div>

      <div
        className={`${!changePwd && "d-none"} modal-dialog position-absolute `}
      >
        <div className="modal-content rounded-4 shadow">
          <div className="modal-header p-5 pb-4 border-bottom-0">
            <h1 className="fw-bold mb-0 fs-2">Change Password</h1>
            <button
              type="button"
              className="btn-close ms-5"
              onClick={() => setChangePwd(false)}
            ></button>
          </div>

          <div className="modal-body p-5 pt-0">
            <form className="">
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control rounded-3"
                  id="floatingOldPwd"
                  placeholder="Old Password"
                  ref={currentPwdRef}
                />
                <label htmlFor="floatingOldPwd">Old Password</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control rounded-3"
                  id="floatingNewPwd"
                  placeholder="New Password"
                  ref={newPwdRef}
                />
                <label htmlFor="floatingNewPwd">New Password</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control rounded-3"
                  id="floatingconfirmNewPwd"
                  placeholder="Confirm New Password"
                  ref={confirmNewPwdRef}
                />
                <label htmlFor="floatingconfirmNewPwd">
                  Confirm New Password
                </label>
              </div>
              <button
                className="w-100 mb-2 btn btn-lg text-white rounded-3"
                type="submit"
                style={{ backgroundColor: "#3C096C" }}
                onClick={handleChangePwd}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
