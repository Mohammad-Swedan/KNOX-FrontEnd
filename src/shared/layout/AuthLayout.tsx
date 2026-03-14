import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="bg-background min-h-screen">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
