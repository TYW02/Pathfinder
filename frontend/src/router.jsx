import { BrowserRouter, createBrowserRouter } from "react-router-dom";
import Signup from "./components/signup";
import Signin from "./components/signin";
import RoadMap from "./pages/roadmap";
import Pricing from "./pages/pricing";
import LandingPage from "./pages/landing_page";
import PrivateRoute from "./components/PrivateRoute";

export const router = createBrowserRouter([
    { path: "/", element: <LandingPage />},
    { path: "/signup", element: <Signup />},
    { path: "/signin", element: <Signin />},
    { path: "/pricing", element: <Pricing />},
    { path: "/roadmap", element: <PrivateRoute><RoadMap />{" "}</PrivateRoute>},
])