import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/layout/MainLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { CourseNavigation } from "./pages/courses/CourseNavigation";
import { CourseResources } from "./pages/courses/CourseResources";
import { Dashboard } from "./pages/home/Dashboard";
import { LandingPage } from "./pages/home/LandingPage";
import { SavedResources } from "./pages/library/SavedResources";
import { EditProfile } from "./pages/profile/EditProfile";
import { UserProfile } from "./pages/profile/UserProfile";
import { ResourceDetail } from "./pages/resources/ResourceDetail";
import { ResourceListing } from "./pages/resources/ResourceListing";
import { UploadResource } from "./pages/resources/UploadResource";

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
