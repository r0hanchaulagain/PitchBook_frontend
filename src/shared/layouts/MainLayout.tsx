import Header from "@/shared/components/layoutComponents/Header";
import { Outlet } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-zinc-800 p-4 text-xl text-white">
      Footer
    </footer>
  );
}

export default function MainLayout() {
  return (
    <div className="">
      <Header />
      <main className="bg-background min-h-[80.75vh] flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
