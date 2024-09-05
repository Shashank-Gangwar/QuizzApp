import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginRegister from "./pages/LoginRegister.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import NotFound from "./components/NotFound.jsx";
import CreateQuiz from "./pages/CreateQuiz.jsx";
import AttemptQuiz from "./pages/AttemptQuiz.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/login", element: <LoginRegister /> },
      { path: "/create-quiz", element: <CreateQuiz /> },
      { path: "/attempt-quiz/:quizId", element: <AttemptQuiz /> },
      {
        path: "/*",
        element: <NotFound />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
