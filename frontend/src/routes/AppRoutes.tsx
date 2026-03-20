import Layout from "@/components/Layout/Layout";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTENAME.DASHBOARD} element={<Layout />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
