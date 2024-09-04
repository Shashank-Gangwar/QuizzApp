import axios from "axios";
import {
  AllQuizes_url,
  createNewQuiz_Url,
  endQuiz_Url,
  fiterQuizzes_Url,
  getMyQuizzes_Url,
  getQuizById_Url,
  globalLeaderboard_url,
  loginUsingToken_Url,
  logout_Url,
  myAttmeptedQuiz_Url,
  refreshAccessToken_Url,
  startQuiz_Url,
  updateEmail_Url,
  updatePassword_Url,
  updateUsername_Url,
} from "./api";

// wraper function for making server calls with handling access_token and refresh_token expiry
export const apiCallWithAuth = async (apiCall) => {
  try {
    // 1-> Attempt to make the API call with the current access token, if success -> return
    const response = await apiCall();
    return response;
  } catch (error) {
    //console.log(error);
    try {
      // 2-> Attempt to refresh the access token
      await refreshAccessToken();

      // 3-> Retry the API call with the new token, if success -> return
      const response = await apiCall();
      return response;
    } catch (error) {
      // 4-> When couldn't refresh access token , return error
      // calling function will redirect page to login

      //console.log(error);
      return error;
    }
  }
};

// Login automatically if access token in localstorage
export const loginUsingAccessToken = async () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    // Handle the case where there's no token, e.g., redirect to login
    throw new Error("Access Token not found");
  }
  return await axios
    .get(loginUsingToken_Url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      const { access_token, refresh_token: newRefreshToken } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", newRefreshToken);
      // Handle successful login, e.g., update state or store user info
      return response;
    })
    .catch((error) => {
      //console.error("An error occurred during login:", error);
      throw error;
    });
};

// refreshing the access_token using the existed refresh_token in local storage
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }
  //console.log("refreshing access token start");

  await axios
    .get(refreshAccessToken_Url, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    })
    .then((response) => {
      //console.log(response);
      const { access_token, refresh_token: newRefreshToken } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", newRefreshToken);
    })
    .catch((error) => {
      //console.log(error);
      throw error;
    });
};

export const leaderboardApi = async () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    // Handle the case where there's no token
    throw new Error("Access Token not found");
  }

  return await axios
    .get(globalLeaderboard_url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // //console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error("An error occurred during login:", error);
      throw error;
    });
};

export const updateNewUsername = async (username) => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    throw new Error("Access Token not found");
  }

  return await axios
    .put(
      `${updateUsername_Url}${username}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      // //console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error("An error while updating username:", error);
      throw error;
    });
};

export const updateNewEmail = async (email) => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    throw new Error("Access Token not found");
  }

  return await axios
    .put(
      `${updateEmail_Url}${email}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      // //console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error("An error while updating email:", error);
      throw error;
    });
};

export const updatePassword = async (old_password, new_password) => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    throw new Error("Access Token not found");
  }

  return await axios
    .put(
      updatePassword_Url,
      { old_password, new_password },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      // //console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error("An error while updating password:", error);
      throw error;
    });
};

export const getAllQuizzes = async () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    throw new Error("Access Token not found");
  }

  return await axios
    .get(AllQuizes_url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // //console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error("An error while getting your quizzes:", error);
      throw error;
    });
};

export const getMyQuizzes = async () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    throw new Error("Access Token not found");
  }

  return await axios
    .get(getMyQuizzes_Url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error("An error while getting your quizzes:", error);
      throw error;
    });
};

export const getAttemptedQuizzes = async () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    throw new Error("Access Token not found");
  }

  return await axios
    .get(myAttmeptedQuiz_Url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error("An error while getting your quizzes:", error);
      throw error;
    });
};

export const createNewQuiz = async (quiz) => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    throw new Error("Access Token not found");
  }

  return await axios
    .post(createNewQuiz_Url, quiz, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error("An error while creating new quiz:", error);
      throw error;
    });
};

export const getFilterQuizzes = async (tags, time, difficulty) => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    throw new Error("Access Token not found");
  }

  // Construct the query parameters
  let queryParams = [];

  if (tags && tags.length > 0) {
    queryParams.push(`filter_tag=${tags.join(",")}`);
  }
  if (time && time !== 86399) {
    queryParams.push(`time=${time}`);
  }
  if (difficulty) {
    queryParams.push(`difficulty=${difficulty}`);
  }

  // Joinnig the query parameters
  const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";

  //console.log(queryString);

  return await axios
    .get(`${fiterQuizzes_Url}${queryString}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error("An error while filtering quizzes:", error);
      throw error;
    });
};

export const getQuizById = async (id) => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    throw new Error("Access Token not found");
  }

  return await axios
    .get(`${getQuizById_Url}${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error(`An error while getting quiz ${id}`, error);
      throw error;
    });
};

export const startQuiz = async (id) => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    throw new Error("Access Token not found");
  }

  return await axios
    .post(
      `${startQuiz_Url}${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      // console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error(`An error while starting quiz ${id}`, error);
      throw error;
    });
};

export const endQuiz = async (quiz_attempt_id, score) => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    throw new Error("Access Token not found");
  }

  return await axios
    .post(
      `${endQuiz_Url}${quiz_attempt_id}&score=${score}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      // console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error(`An error while ending quiz ${id}`, error);
      throw error;
    });
};

export const loggingOut = async () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    //console.error("No access token found");
    throw new Error("Access Token not found");
  }

  return await axios
    .get(logout_Url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // console.log(response.data);
      return response;
    })
    .catch((error) => {
      //console.error("An error while Logging out:", error);
      throw error;
    });
};
