import { useEffect, useRef } from "react";
import {
  Navigate,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import ParticleNetwork from "./components/ParticleNetwork";
import LoadingScreen from "./components/LoadingScreen";

import "./App.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const startupHandled = useRef(false);

  useEffect(() => {
    if (startupHandled.current) return;
    startupHandled.current = true;
    window.scrollTo(0, 0);

    if (location.pathname !== "/" || location.search || location.hash) {
      navigate("/", { replace: true });
    }

    window.scrollTo(0, 0);
  }, [location.hash, location.pathname, location.search, navigate]);

  return (
    <>
      <LoadingScreen onDone={() => window.scrollTo(0, 0)} />

      <ParticleNetwork />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
