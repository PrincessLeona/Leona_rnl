import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Genders from "./pages/gender/Genders";
import EditGender from "./pages/gender/EditGender";
import DeleteGender from "./pages/gender/DeleteGender";
import User from "./pages/user/Users";
import Login from "./pages/login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Feedback from "./components/forms/automate/Feedback";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/genders",
    element: (
      <ProtectedRoute>
        <Genders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/gender/edit/:gender_id",
    element: (
      <ProtectedRoute>
        <EditGender />
      </ProtectedRoute>
    ),
  },
  {
    path: "/gender/delete/:gender_id",
    element: (
      <ProtectedRoute>
        <DeleteGender />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute>
        <User />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feedback",
    element: (
      <ProtectedRoute>
        <Feedback />
      </ProtectedRoute>
    ),
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;