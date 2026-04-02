import Layout from "@/components/Layout/Layout";
import { ROUTENAME } from "@/core/Constants/RouteName";
import ForgetPassword from "@/modules/auth/view/ForgetPassword";
import Login from "@/modules/auth/view/Login";
import ResetPassword from "@/modules/auth/view/ResetPassword";
import Signup from "@/modules/auth/view/Signin";
import { ProcessVerification } from "@/modules/profile/view/ProcessVerification";
import { Profile } from "@/modules/profile/view/Profile";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Dashboard Routes */}
          <Route
            path={ROUTENAME.DASHBOARD}
            element={<div>Dashboard Page</div>}
          />
          <Route path={ROUTENAME.SUBJECTS} element={<div>SUBJECTS Page</div>} />
          <Route
            path={ROUTENAME.ADD_SUBJECT}
            element={<div>ADD_SUBJECT Page</div>}
          />
          <Route
            path={ROUTENAME.PROFESSOR_ASSIGN_SUBJECT_POST}
            element={<div>PROFESSOR_ASSIGN_SUBJECT_POST Page</div>}
          />
          <Route
            path={ROUTENAME.PROFESSOR_ASSIGNED_SUBJECT_GET}
            element={<div>PROFESSOR_ASSIGNED_SUBJECT_GET Page</div>}
          />

          <Route
            path={ROUTENAME.ASSIGNMENT}
            element={<div>ASSIGNMENT Page</div>}
          />
          <Route
            path={ROUTENAME.ADD_ASSIGNMENT}
            element={<div>ADD_ASSIGNMENT Page</div>}
          />
          <Route
            path={ROUTENAME.MY_ASSIGNMENT}
            element={<div>MY_ASSIGNMENT Page</div>}
          />
          <Route path={ROUTENAME.BRANCH} element={<div>BRANCH Page</div>} />
          <Route
            path={ROUTENAME.ADD_BRANCH}
            element={<div>ADD_BRANCH Page</div>}
          />
          <Route
            path={ROUTENAME.ALL_USERS}
            element={<div>ALL_USERS Page</div>}
          />
          <Route path={ROUTENAME.ADD_HOD} element={<div>ADD_HOD Page</div>} />
          <Route
            path={ROUTENAME.ADD_PROFESSOR}
            element={<div>ADD_PROFESSOR Page</div>}
          />
          <Route
            path={ROUTENAME.ALL_PROFESSOR}
            element={<div>ALL_PROFESSOR Page</div>}
          />
          <Route
            path={ROUTENAME.ALL_STUDENT}
            element={<div>ALL_STUDENT Page</div>}
          />

          {/* Profile Routes */}
          <Route path={ROUTENAME.PROFILE} element={<Profile />} />
          <Route
            path={ROUTENAME.RESET_PASSWORD}
            element={<div>Reset Password</div>}
          />
          <Route
            path={ROUTENAME.VERIFY_EMAIL}
            element={<div>Verify Email</div>}
          />
        </Route>

        {/* protected Routes */}
        <Route
          path={ROUTENAME.AUTH_RESET_PASSWORD}
          element={<ResetPassword />}
        />
        {/* Public Routes */}
        <Route path="/verify-email" element={<ProcessVerification />} />
        <Route path={ROUTENAME.SIGNIN} element={<Signup />} />
        <Route path={ROUTENAME.LOGIN} element={<Login />} />
        <Route path={ROUTENAME.FORGET_PASSWORD} element={<ForgetPassword />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
