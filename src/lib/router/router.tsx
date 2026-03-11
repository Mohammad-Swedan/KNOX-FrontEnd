import { createBrowserRouter } from "react-router-dom";
import App from "../../app/App";
import HomePage from "../../features/home/pages/HomePage";
import AboutPage from "../../features/home/pages/AboutPage";
import NotFoundPage from "@/features/home/pages/NotFoundPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import VerifyAccountPage from "@/features/auth/pages/VerifyAccountPage";
import AuthLayout from "@/shared/layout/AuthLayout";
import CoursesPage from "@/features/courses/pages/CoursesPage";
import CourseInfoPage from "@/features/courses/pages/CourseInfoPage";
import FolderPage from "@/features/materials/pages/FolderPage";
import QuizzesPage from "@/features/quizzes/pages/QuizzesPage";
import QuizQuestionsPage from "@/features/quizzes/pages/QuizQuestionPage";
import AddQuizPage from "@/features/quizzes/pages/AddQuizPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import EditProfilePage from "@/features/profile/pages/EditProfilePage";
import { ProtectedRoute } from "@/lib/router/ProtectedRoute";
import DashboardLayout from "@/shared/layout/DashboardLayout";
import AnalyticsPage from "@/features/dashboard/pages/AnalyticsPage";
import ManageUniversitiesPage from "@/features/universities/pages/ManageUniversitiesPage";
import UniversityDetailsPage from "@/features/universities/pages/UniversityDetailsPage";
import FacultyDetailsPage from "@/features/universities/pages/FacultyDetailsPage";
import ManageUsersPage from "@/features/users/pages/ManageUsersPage";
import WriterStatisticsPage from "@/features/dashboard/pages/WriterStatisticsPage";
import MajorCoursesPage from "@/features/courses/pages/MajorCoursesPage";
import MaterialExplorerPage from "@/features/materials/pages/MaterialExplorerPage";
import ManageResourcesPage from "@/features/courses/pages/ManageResourcesPage";

// Product Courses
import ProductCourseListPage from "@/features/product-courses/pages/ProductCourseListPage";
import CreateProductCoursePage from "@/features/product-courses/pages/CreateProductCoursePage";
import EditProductCoursePage from "@/features/product-courses/pages/EditProductCoursePage";
import ProductCourseDetailPage from "@/features/product-courses/pages/ProductCourseDetailPage";
import ManageLessonsPage from "@/features/product-courses/pages/ManageLessonsPage";
import AddVideoLessonPage from "@/features/product-courses/pages/AddVideoLessonPage";
import AddQuizLessonPage from "@/features/product-courses/pages/AddQuizLessonPage";
import AddMaterialLessonPage from "@/features/product-courses/pages/AddMaterialLessonPage";
import PrepaidCodesPage from "@/features/product-courses/pages/PrepaidCodesPage";
import ProductCourseCatalog from "@/features/product-courses/pages/ProductCourseCatalog";
import MyEnrollmentsPage from "@/features/product-courses/pages/MyEnrollmentsPage";
import CertificateVerifyPage from "@/features/product-courses/pages/CertificateVerifyPage";
import CoursePlayerPage from "@/features/product-courses/pages/CoursePlayerPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Has Header + Footer
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "*", element: <NotFoundPage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "courses/:courseId/info", element: <CourseInfoPage /> },
      {
        path: "courses/:courseId/materials",
        element: <MaterialExplorerPage />,
      },
      { path: "courses/:courseId/folder/:folderId", element: <FolderPage /> },
      { path: "courses/:courseId/quizzes", element: <QuizzesPage /> },
      { path: "courses/:courseId/quizzes/add", element: <AddQuizPage /> },
      { path: "courses/:courseId/quizzes/new", element: <QuizQuestionsPage /> },
      {
        path: "courses/:courseId/quizzes/:quizId",
        element: <QuizQuestionsPage />,
      },
      // Product Courses — Public routes
      {
        path: "browse/product-courses",
        element: <ProductCourseCatalog />,
      },
      {
        path: "browse/product-courses/:id/:slug",
        element: <ProductCourseDetailPage />,
      },
      {
        path: "certificates/verify",
        element: <CertificateVerifyPage />,
      },
      {
        path: "product-courses/:id/learn",
        element: (
          <ProtectedRoute>
            <CoursePlayerPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-learning",
        element: (
          <ProtectedRoute>
            <MyEnrollmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/edit",
        element: (
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/change-password",
        element: (
          <ProtectedRoute>
            <ResetPasswordPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />, // No Header/Footer, just Outlet
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "verify-account", element: <VerifyAccountPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute
        requiredRoles={["Writer", "Admin", "SuperAdmin", "Instructor"]}
      >
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute requiredRoles={["SuperAdmin"]}>
            <AnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "universities",
        element: (
          <ProtectedRoute requiredRoles={["SuperAdmin"]}>
            <ManageUniversitiesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "universities/:id",
        element: (
          <ProtectedRoute requiredRoles={["SuperAdmin"]}>
            <UniversityDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "universities/:universityId/faculties/:facultyId",
        element: <FacultyDetailsPage />,
      },
      {
        path: "universities/:universityId/faculties/:facultyId/majors/:majorId",
        element: <MajorCoursesPage />,
      },
      // Dashboard management routes for materials, quizzes, and resources
      {
        path: "courses/:courseId/materials",
        element: <MaterialExplorerPage mode="manage" />,
      },
      {
        path: "courses/:courseId/folder/:folderId",
        element: <FolderPage mode="manage" />,
      },
      {
        path: "courses/:courseId/quizzes",
        element: <QuizzesPage mode="manage" />,
      },
      {
        path: "courses/:courseId/quizzes/add",
        element: <AddQuizPage />,
      },
      {
        path: "courses/:courseId/resources",
        element: <ManageResourcesPage />,
      },
      // Product Courses — Dashboard management routes
      {
        path: "courses/:academicCourseId/product-courses",
        element: (
          <ProtectedRoute requiredRoles={["Admin", "SuperAdmin", "Instructor"]}>
            <ProductCourseListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:academicCourseId/product-courses/create",
        element: (
          <ProtectedRoute requiredRoles={["Admin", "SuperAdmin", "Instructor"]}>
            <CreateProductCoursePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "product-courses/:id",
        element: <ProductCourseDetailPage />,
      },
      {
        path: "product-courses/:id/edit",
        element: (
          <ProtectedRoute requiredRoles={["Admin", "SuperAdmin", "Instructor"]}>
            <EditProductCoursePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "product-courses/:id/lessons",
        element: <ManageLessonsPage />,
      },
      {
        path: "product-courses/:id/lessons/add-video",
        element: (
          <ProtectedRoute requiredRoles={["Admin", "SuperAdmin", "Instructor"]}>
            <AddVideoLessonPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "product-courses/:id/topics/:topicId/lessons/add-video",
        element: (
          <ProtectedRoute requiredRoles={["Admin", "SuperAdmin", "Instructor"]}>
            <AddVideoLessonPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "product-courses/:id/lessons/add-quiz",
        element: (
          <ProtectedRoute requiredRoles={["Admin", "SuperAdmin", "Instructor"]}>
            <AddQuizLessonPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "product-courses/:id/topics/:topicId/lessons/add-quiz",
        element: (
          <ProtectedRoute requiredRoles={["Admin", "SuperAdmin", "Instructor"]}>
            <AddQuizLessonPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "product-courses/:id/lessons/add-material",
        element: (
          <ProtectedRoute requiredRoles={["Admin", "SuperAdmin", "Instructor"]}>
            <AddMaterialLessonPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "product-courses/:id/topics/:topicId/lessons/add-material",
        element: (
          <ProtectedRoute requiredRoles={["Admin", "SuperAdmin", "Instructor"]}>
            <AddMaterialLessonPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "product-courses/:id/prepaid-codes",
        element: (
          <ProtectedRoute requiredRoles={["Admin", "SuperAdmin", "Instructor"]}>
            <PrepaidCodesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute requiredRoles={["SuperAdmin"]}>
            <ManageUsersPage />
          </ProtectedRoute>
        ),
      },
      { path: "writer-statistics", element: <WriterStatisticsPage /> },
    ],
  },
]);
