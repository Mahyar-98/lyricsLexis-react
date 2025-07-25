import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Error404 from "./pages/Error404";
import Home from "./pages/Home";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Library from "./pages/Library";

const Router = () => {
  const router = createBrowserRouter([
    {
      errorElement: <Error404 />,
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/about",
          element: <About />,
        },
        {
          path: "/signin",
          element: <SignIn />,
        },
        {
          path: "/signup",
          element: <SignUp />,
        },
        {
          path: "/library",
          element: <Library />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
