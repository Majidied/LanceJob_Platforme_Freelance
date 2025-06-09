//pages/freelancer/index.jsx - Mis à jour pour gérer les routes cachées
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { FreelancerProvider } from "../../context/FreelancerContext";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar/freelancer";
import routes from "../../components/sidebar/freelancer/routesfr";
import routesbtn from "./routeBtn";

export default function FreelancerLayout(props) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState("Main Dashboard");
  
  React.useEffect(() => {
    window.addEventListener("resize", () =>
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
    );
  }, []);
  
  React.useEffect(() => {
    getActiveRoute(routes);
  }, [location.pathname]);
  
  const getActiveRoute = (routes) => {
    let activeRoute = "Main Dashboard";
    for (let i = 0; i < routes.length; i++) {
      // Gérer les routes avec paramètres comme propose/:jobId
      const routePath = routes[i].layout + "/" + routes[i].path;
      if (routes[i].path.includes(':')) {
        // Pour les routes avec paramètres, on vérifie si l'URL contient le début de la route
        const baseRoutePath = routes[i].layout + "/" + routes[i].path.split(':')[0];
        if (window.location.href.indexOf(baseRoutePath) !== -1) {
          setCurrentRoute(routes[i].name);
        }
      } else {
        // Pour les routes normales
        if (window.location.href.indexOf(routePath) !== -1) {
          setCurrentRoute(routes[i].name);
        }
      }
    }
    return activeRoute;
  };
  
  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].secondary;
      }
    }
    return activeNavbar;
  };
  
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/freelancer") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };
  
  document.documentElement.dir = "ltr";
  
  return (
    <FreelancerProvider>
      <div className="flex w-full h-full">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        {/* Navbar & Main Content */}
        <div className="h-full w-full bg-[#88a9ab16] dark:!bg-navy-900 ">
          {/* Main Content */}
          <main
            className={`mx-[12px] h-full flex-none transition-all md:pr-2 xl:ml-[313px] `}
          >
            {/* Routes */}
            <div className="h-full ">
              <Navbar
                onOpenSidenav={() => setOpen(true)}
                logoText={"Horizon UI Tailwind React"}
                brandText={currentRoute}
                secondary={getActiveNavbar(routes)}
                {...rest}
              />
              <div className="pt-5s mx-auto mb-auto h-full min-h-[89.2vh] p-2 md:pr-2">
                <Routes>
                  {getRoutes(routes)}
                  {getRoutes(routesbtn)}
                  <Route
                    path="/user"
                    element={<Navigate to="/user/home" replace />}
                  />
                  <Route
                    path="/freelancer"
                    element={<Navigate to="/freelancer/home" replace />}
                  />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </div>
    </FreelancerProvider>
  );
}