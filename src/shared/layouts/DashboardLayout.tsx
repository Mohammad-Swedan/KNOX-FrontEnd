import { useLocation, useNavigate } from "react-router-dom";
import {
  ChartBarIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  FolderTree,
  Users,
  PenTool,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui/sidebar";

import ProfileDropdown from "@/features/dashboard/componenets/dropdown-profile";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActivePage = () => {
    if (location.pathname === "/dashboard") return "analytics";
    if (location.pathname.startsWith("/dashboard/universities"))
      return "universities";
    if (location.pathname.startsWith("/dashboard/courses"))
      return "universities";
    if (location.pathname.startsWith("/dashboard/users")) return "users";
    if (location.pathname.startsWith("/dashboard/writer-statistics"))
      return "writer-statistics";
    return "analytics";
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs: { label: string; href?: string }[] = [];

    if (path === "/dashboard") {
      breadcrumbs.push({ label: "Platform Statistics" });
    } else if (path.startsWith("/dashboard/users")) {
      breadcrumbs.push({ label: "Manage Users" });
    } else if (path.startsWith("/dashboard/writer-statistics")) {
      breadcrumbs.push({ label: "Writer Statistics" });
    } else if (path.startsWith("/dashboard/courses")) {
      // Handle courses materials and folders
      const parts = path.split("/").filter(Boolean);
      breadcrumbs.push({
        label: "Content Management",
        href: "/dashboard/universities",
      });

      if (parts.includes("materials")) {
        // /dashboard/courses/:courseId/materials
        breadcrumbs.push({ label: "Course Materials" });
      } else if (parts.includes("folder")) {
        // /dashboard/courses/:courseId/folder/:folderId
        breadcrumbs.push({
          label: "Course Materials",
          href: `/dashboard/courses/${parts[2]}/materials`,
        });
        breadcrumbs.push({ label: "Folder Contents" });
      } else if (parts.includes("quizzes")) {
        // /dashboard/courses/:courseId/quizzes
        breadcrumbs.push({ label: "Course Quizzes" });
      }
    } else if (path.includes("/universities")) {
      const parts = path.split("/").filter(Boolean);
      breadcrumbs.push({
        label: "Content Management",
        href: "/dashboard/universities",
      });

      if (parts.length === 2) {
        // /dashboard/universities
        breadcrumbs.push({ label: "Universities" });
      } else if (parts.length === 3) {
        // /dashboard/universities/:id
        breadcrumbs.push({
          label: "Universities",
          href: "/dashboard/universities",
        });
        breadcrumbs.push({ label: "University Details" });
      } else if (parts.length === 5 && parts[3] === "faculties") {
        // /dashboard/universities/:id/faculties/:facultyId
        const universityId = parts[2];
        breadcrumbs.push({
          label: "Universities",
          href: "/dashboard/universities",
        });
        breadcrumbs.push({
          label: "University Details",
          href: `/dashboard/universities/${universityId}`,
        });
        breadcrumbs.push({ label: "Faculty Details" });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={getActivePage() === "analytics"}
                      onClick={() => navigate("/dashboard")}
                    >
                      <ChartBarIcon />
                      <span>Platform Statistics</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={getActivePage() === "universities"}
                      onClick={() => navigate("/dashboard/universities")}
                    >
                      <FolderTree />
                      <span>Content Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={getActivePage() === "users"}
                      onClick={() => navigate("/dashboard/users")}
                    >
                      <Users />
                      <span>Manage Users</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={getActivePage() === "writer-statistics"}
                      onClick={() => navigate("/dashboard/writer-statistics")}
                    >
                      <PenTool />
                      <span>Writer Statistics</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="bg-card sticky top-0 z-50 border-b">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="[&_svg]:size-5!" />
                {breadcrumbs.length > 0 && (
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((crumb, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {index > 0 && <BreadcrumbSeparator />}
                          <BreadcrumbItem>
                            {crumb.href ? (
                              <BreadcrumbLink
                                onClick={() => navigate(crumb.href!)}
                                className="cursor-pointer"
                              >
                                {crumb.label}
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                        </div>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <ProfileDropdown
                  trigger={
                    <Button variant="ghost" size="icon" className="size-9.5">
                      <Avatar className="size-9.5 rounded-md">
                        <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
              </div>
            </div>
          </header>
          <main className="mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
            <Outlet />
          </main>
          <footer>
            <div className="text-muted-foreground mx-auto flex size-full max-w-7xl items-center justify-between gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6">
              <p className="text-sm text-balance max-sm:text-center">
                {`©${new Date().getFullYear()}`}{" "}
                <a href="#" className="text-primary">
                  Uni-Hub
                </a>
                , Empowering students worldwide
              </p>
              <div className="flex items-center gap-5">
                <a href="#">
                  <FacebookIcon className="size-4" />
                </a>
                <a href="#">
                  <InstagramIcon className="size-4" />
                </a>
                <a href="#">
                  <LinkedinIcon className="size-4" />
                </a>
                <a href="#">
                  <TwitterIcon className="size-4" />
                </a>
              </div>
            </div>
          </footer>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
