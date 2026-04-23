import Layout from "@/components/Layout/Layout";
import { ROUTENAME } from "@/core/Constants/RouteName";
import ForgetPassword from "@/modules/auth/view/ForgetPassword";
import Login from "@/modules/auth/view/Login";
import ResetPassword from "@/modules/auth/view/ResetPassword";
import Signup from "@/modules/auth/view/Signin";
import { ProcessVerification } from "@/modules/users/profile/view/ProcessVerification";
import { Profile } from "@/modules/users/profile/view/Profile";
import { SubjectDetailModule } from "@/modules/subject/view/SubjectUpdateModule";
import { SubjectModule } from "@/modules/subject/view/SubjectModule";
import { SubjectRegisterModule } from "@/modules/subject/view/SubjectRegister";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserManagementView from "@/modules/users/view/UserManagementView";
import UserDetailsView from "@/modules/users/view/UserDetailsView";
import CreateStaffView from "@/modules/users/view/CreateStaffView";
import SystemSettingsView from "@/modules/settings/view/SystemSettingsView";
import SubjectAssignmentView from "@/modules/subject-mapping/view/SubjectAssignmentView";
import AssignmentListView from "@/modules/assignment/view/AssignmentListView";
import AssignmentCreateView from "@/modules/assignment/view/AssignmentCreateView";
import AssignmentDetailView from "@/modules/assignment/view/AssignmentDetailView";
import AssignmentEditView from "@/modules/assignment/view/AssignmentEditView";
import MyAssignmentsView from "@/modules/assignment/view/MyAssignmentsView";

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
          <Route path={ROUTENAME.SUBJECTS} element={<SubjectModule />} />
          <Route
            path={ROUTENAME.ADD_SUBJECT}
            element={<SubjectRegisterModule />}
          />
          <Route
            path={ROUTENAME.SUBJECT_DETAILS}
            element={<SubjectDetailModule />}
          />

          <Route
            path={ROUTENAME.ASSIGN_SUBJECT}
            element={<SubjectAssignmentView />}
          />

          <Route path={ROUTENAME.ASSIGNMENT} element={<AssignmentListView />} />
          <Route
            path={ROUTENAME.ADD_ASSIGNMENT}
            element={<AssignmentCreateView />}
          />
          <Route
            path={ROUTENAME.EDIT_ASSIGNMENT}
            element={<AssignmentEditView />}
          />
          <Route
            path={ROUTENAME.VIEW_ASSIGNMENT}
            element={<AssignmentDetailView />}
          />
          <Route path={ROUTENAME.SETTING} element={<SystemSettingsView />} />
          <Route
            path={ROUTENAME.MY_ASSIGNMENT}
            element={<MyAssignmentsView />}
          />
          <Route path={ROUTENAME.BRANCH} element={<div>BRANCH Page</div>} />
          <Route
            path={ROUTENAME.ADD_BRANCH}
            element={<div>ADD_BRANCH Page</div>}
          />
          <Route path={ROUTENAME.ALL_USERS} element={<UserManagementView />} />
          <Route path={ROUTENAME.ADD_STAFF} element={<CreateStaffView />} />
          <Route path={ROUTENAME.USER_DETAILS} element={<UserDetailsView />} />

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
