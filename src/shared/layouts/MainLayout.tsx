import Header from "@/shared/components/layoutComponents/Header";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="">
      <Header />
      <main className="bg-background min-h-[80.75vh] flex-1">
        <Outlet />
      </main>
    </div>
  );
}
