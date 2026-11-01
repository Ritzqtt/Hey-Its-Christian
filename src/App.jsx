import { useEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import ParticleNetwork from "./components/ParticleNetwork";
import LoadingScreen from "./components/LoadingScreen";

import "./App.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const startupHandled = useRef(false);
  const wasReloaded = useRef(false);

  useEffect(() => {
    if (startupHandled.current) return;
    startupHandled.current = true;
    window.scrollTo(0, 0);

    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const isReload = navigationEntry
      ? navigationEntry.type === "reload"
      : performance.navigation?.type === 1;

    if (!isReload) return;

    wasReloaded.current = true;

    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    if (location.pathname !== "/") {
      navigate("/", { replace: true });
    }

    window.scrollTo(0, 0);
  }, [location.pathname, navigate]);

  const handleLoadingDone = () => {
    if (wasReloaded.current) {
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <LoadingScreen onDone={handleLoadingDone} />

      <ParticleNetwork />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
