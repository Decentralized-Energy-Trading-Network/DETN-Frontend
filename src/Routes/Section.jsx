import React, { lazy, Suspense } from "react";
import { Outlet, useRoutes } from "react-router-dom";
import Layout from "../Layout/Nav-Bar/Layout";
import Signin from "../Pages/Signin";
import Signup from "../Pages/Signup";
import Dashboard from "../Pages/Dashboard";
import EnergyProductionDashboard from "../Pages/EnergyProduction";
import SolarGeospatialAdmin from "../Pages/SolarGeospatial";
import UserManagement from "../Pages/User";

function Router() {
  const routes = useRoutes([
    {
      path: "/",
      element: (
        <Layout>
          <Outlet />
        </Layout>
      ),
      children: [
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "/production/monitor",
          element: <EnergyProductionDashboard />,
        },
        {
          path: "/community/map",
          element: <SolarGeospatialAdmin />,
        },
        {
          path: "/community/users",
          element: <UserManagement />,
        },
        
      ],
    },
    {
      path: "/signin",
      element: <Signin />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
  ]);

  return routes;
}

export default Router;
