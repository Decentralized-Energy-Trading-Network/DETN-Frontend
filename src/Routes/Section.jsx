// Router.jsx
import React from "react";
import { Outlet, useRoutes } from "react-router-dom";
import Layout from "../Layout/Nav-Bar/Layout";
import ClientLayout from "../Layout/ClientLayout"; 

// Admin Pages
import Signin from "../Pages/Signin";
import Signup from "../Pages/Signup";
import Dashboard from "../Pages/Dashboard";
import EnergyProductionDashboard from "../Pages/EnergyProduction";
import SolarGeospatialAdmin from "../Pages/SolarGeospatial";
import UserManagement from "../Pages/User";
import Equipment from "../Pages/Equipment";
import OrderBook from "../Pages/OrderBook";
import TransactionHistory from "../Pages/Clients/Transaction";
import PriceManagement from "../Pages/Pricing";
import MarketplaceOverview from "../Pages/OverviewPrice";
import Notification from "../Pages/Notification";
import HelpCenter from "../Pages/Help";

// Client Pages
import SignupPage from "../Pages/Clients/SignUp";
import LoginPage from "../Pages/Clients/SignIn";
import MarketplaceDashboard from "../Pages/Clients/MarketPlaceDashboard";
import SellEnergy from "../Pages/Clients/SellEnergy";
import BuyEnergy from "../Pages/Clients/BuyEnergy";
import Wallet from "../Pages/Clients/Wallet"; // You'll need to create this
import ClientTransactions from "../Pages/Clients/ClientTransaction"; // You'll need to create this

function Router() {
  const routes = useRoutes([
    // Admin Routes with Admin Layout
    {
      path: "/",
      element: (
        <Layout>
          <Outlet />
        </Layout>
      ),
      children: [
        {
          index: true,
          element: <Dashboard />,
        },
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "/production/monitor",
          element: <EnergyProductionDashboard />,
        },
        {
          path: "/production/equipment",
          element: <Equipment />,
        },
        {
          path: "/community/map",
          element: <SolarGeospatialAdmin />,
        },
        {
          path: "/community/users",
          element: <UserManagement />,
        },
        {
          path: "/marketplace/orders",
          element: <OrderBook />,
        },
        {
          path: "/marketplace/transactions",
          element: <TransactionHistory />,
        },
        {
          path: "/marketplace/pricing",
          element: <PriceManagement />,
        },
        {
          path: "/marketplace/overview",
          element: <MarketplaceOverview />,
        },
        {
          path: "/notifications",
          element: <Notification />,
        },
        {
          path: "/help",
          element: <HelpCenter />,
        },
      ],
    },

    // Client Routes with Client Layout
    {
      path: "/clients",
      element: (
        <ClientLayout>
          <Outlet />
        </ClientLayout>
      ),
      children: [
        {
          path: "marketplace",
          element: <MarketplaceDashboard />,
        },
        {
          path: "sell",
          element: <SellEnergy />,
        },
        {
          path: "buy",
          element: <BuyEnergy />,
        },
        {
          path: "wallet",
          element: <Wallet />,
        },
        {
          path: "transactions",
          element: <ClientTransactions />,
        },
      ],
    },

    // Auth Routes (No Layout)
    {
      path: "/signin",
      element: <Signin />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/clients/signin",
      element: <LoginPage />,
    },
    {
      path: "/clients/signup",
      element: <SignupPage />,
    },
  ]);

  return routes;
}

export default Router;