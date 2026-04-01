import { Outlet } from "react-router-dom";
import Navbar from "../shared/components/Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}
