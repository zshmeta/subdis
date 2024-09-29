// src/App.jsx
import { useState } from 'react';
import './App.css';
import Media from './components/Media';
import Transcribe from './components/Transcribe';
import Studio from './components/Studio';
import Error from './components/Error'; // Import ErrorBoundary
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MediaContext } from './components/MediaContext';

function App() {
  const [mediaFile, setMediaFile] = useState(null);
  const [transcriptionData, setTranscriptionData] = useState(null);

  return (
    <Router>
      <MediaContext.Provider value={{ mediaFile, setMediaFile, transcriptionData, setTranscriptionData }}>
          <div className="main">
            <Routes>
              <Route path="/" element={<Media />} />
              <Route path="/transcription" element={<Transcribe />} />
              <Route path="/studio" element={<Studio />} />
              {/*on the error page return to the main page after few seconds*/}
              <Route path="/error" element={<Error />} />
              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<Media />} />
            </Routes>
          </div>
      </MediaContext.Provider>
    </Router>
  );
}

export default App;
