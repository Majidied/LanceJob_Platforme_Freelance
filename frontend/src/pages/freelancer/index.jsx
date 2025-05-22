// /src/pages/freelancer/index.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar/freelancer";

export default function FreelancerLayout() {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="flex w-full h-full">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="h-full w-full bg-[#88a9ab16] dark:!bg-navy-900">
        <main className="mx-[12px] h-full flex-none transition-all md:pr-2 xl:ml-[313px]">
          <div className="h-full">
            <Navbar
              onOpenSidenav={() => setOpen(true)}
              logoText={"Horizon UI Tailwind React"}
              brandText={"Freelancer Dashboard"}
              secondary={false}
            />
            <div className="pt-5s mx-auto mb-auto h-full min-h-[89.2vh] p-2 md:pr-2">
              <Outlet /> {/* ⬅️ C'est ici que les sous-routes vont s'afficher */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
