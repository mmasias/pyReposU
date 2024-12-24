import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Visualizador from './pages/Visualizador';
import Playback from './pages/playback';

const App: React.FC = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/visualizador" element={<Visualizador />} />
            <Route path="/playback/:repoUrl/:filePath" element={<Playback />} />

        </Routes>
    </Router>
);

export default App;
