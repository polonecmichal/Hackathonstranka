import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CreateTicket from "./pages/CreateTicket";
import CustomerDashboard from "./pages/CustomerDashboard";
import DemoData from "./pages/DemoData";
import SetupGuide from "./pages/SetupGuide";
import DatabaseSetup from "./pages/DatabaseSetup";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/admin",
    Component: Admin,
  },
  {
    path: "/employee/login",
    Component: EmployeeLogin,
  },
  {
    path: "/employee/dashboard",
    Component: EmployeeDashboard,
  },
  {
    path: "/customer/dashboard",
    Component: CustomerDashboard,
  },
  {
    path: "/create-ticket",
    Component: CreateTicket,
  },
  {
    path: "/demo-data",
    Component: DemoData,
  },
  {
    path: "/setup",
    Component: SetupGuide,
  },
  {
    path: "/db-setup",
    Component: DatabaseSetup,
  },
]);