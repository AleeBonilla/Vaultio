import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MainLayout } from "./components/layouts/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { CourseNavigation } from "./pages/CourseNavigation";
import { ResourceListing } from "./pages/ResourceListing";
import { CourseResources } from "./pages/CourseResources";
import { ResourceDetail } from "./pages/ResourceDetail";
import { UploadResource } from "./pages/UploadResource";
import { UserProfile } from "./pages/UserProfile";
import { EditProfile } from "./pages/EditProfile";
import { SavedResources } from "./pages/SavedResources";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/app",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "courses", element: <CourseNavigation /> },
      { path: "courses/:careerId", element: <CourseNavigation /> },
      { path: "courses/:careerId/:courseId", element: <CourseResources /> },
      { path: "resources", element: <ResourceListing /> },
      { path: "resources/:id", element: <ResourceDetail /> },
      { path: "upload", element: <UploadResource /> },
      { path: "profile", element: <UserProfile /> },
      { path: "profile/edit", element: <EditProfile /> },
      { path: "saved", element: <SavedResources /> },
    ],
  },
]);