import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import MyPage from "../pages/MyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      {
        path: "/my-page",
        element: <MyPage />,
      },
    ],
  },
]);
