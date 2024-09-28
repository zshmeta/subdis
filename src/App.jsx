// src/App.jsx
import { useState } from 'react';
import './App.css';
import Media from './components/Media';
import Transcribe from './components/Transcribe';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MediaContext } from './components/MediaContext';

function App() {
  const [mediaFile, setMediaFile] = useState(null);

  return (
    <Router>
      <MediaContext.Provider value={{ mediaFile, setMediaFile }}>
        <div className="main">
          <Routes>
            <Route path="/" element={<Media />} />
            <Route path="/transcription" element={<Transcribe />} />
          </Routes>
        </div>
      </MediaContext.Provider>
    </Router>
  );
}

export default App;
