import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Visualizador from './pages/visualizadorCodigo/Visualizador';
import Playback from './pages/visualizadorCodigo/Playback';
import Analisis from './pages/anaisisMultidimensional/Analisis';

const App: React.FC = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/visualizador" element={<Visualizador />} />
            <Route path="/playback/:repoUrl/:filePath" element={<Playback />} />
            <Route path="/analisis-multidimensional" element={<Analisis />} />

        </Routes>
    </Router>
);

export default App;
