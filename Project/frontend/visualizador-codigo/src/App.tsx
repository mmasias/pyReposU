import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/common/Layout";
import Dashboard from "./pages/Dashboard";
import Visualizador from "./pages/VisualizadorCodigo/Visualizador";
import Playback from "./pages/VisualizadorCodigo/Playback";
import Analisis from "./pages/anaisisMultidimensional/Analisis";
import MapaHeatmap from "./pages/MapaContribuciones/MapaHeatmap";
import MapaBubbleChart from "./pages/mapaEvolucionRepo/MapaBubbleChart";

const App: React.FC = () => (
  <Router>
    <Layout> 
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/visualizador" element={<Visualizador />} />
        <Route path="/playback/:repoUrl/:filePath" element={<Playback />} />
        <Route path="/analisis-multidimensional" element={<Analisis />} />
        <Route path="/mapa-heatmap" element={<MapaHeatmap />} />
        <Route path="/mapa-bubblechart" element={<MapaBubbleChart />} />
      </Routes>
    </Layout>
  </Router>
);

export default App;
