import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Error404 from "./components/Error404";
import Home from "./components/Home";

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
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
