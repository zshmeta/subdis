// src/components/Media.jsx
import { useState, useRef, useContext } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { MediaContext } from './MediaContext';

const Uploader = styled.div`
  /* Your styles */
`;

const ButtonContainer = styled.div`
  /* Your styles */
`;

const Button = styled.button`
  /* Your styles */
`;

const DownloadButton = styled(Button)`
  /* Your styles */
`;

const VideoElement = styled.video`
  /* Your styles */
`;

const AudioElement = styled.audio`
  width: 50%;
  height: auto;
  max-width: 50%;
  margin-bottom: 20px;
  /* Additional styles as needed */
`;

const Feedback = styled.div`
  /* Your styles */
`;

const Timestamp = styled.input`
  /* Your styles */
`;

const Media = () => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isVideo, setIsVideo] = useState(true);
  const mediaRef = useRef(null);
  const navigate = useNavigate();
  const { mediaFile, setMediaFile } = useContext(MediaContext);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setMediaTitle(file.name);
      setMediaFile(file);
      if (file.type.startsWith('video/')) {
        setIsVideo(true);
      } else if (file.type.startsWith('audio/')) {
        setIsVideo(false);
      }
    }
  };

  const handlePlay = () => {
    if (mediaRef.current) {
      mediaRef.current.play();
      setIsPlaying(true);
      setFeedback('Media is playing');
    }
  };

  const handlePause = () => {
    if (mediaRef.current) {
      mediaRef.current.pause();
      setIsPlaying(false);
      setFeedback('Media is paused');
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  const handleTimestampChange = (e) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = e.target.value;
      setCurrentTime(e.target.value);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = mediaTitle;
    a.click();
  };

  const handleTranscribe = () => {
    if (mediaFile) {
      navigate('/transcription');
    }
  };

  return (
    <Uploader>
      {mediaUrl && (
        isVideo ? (
          <VideoElement
            ref={mediaRef}
            src={mediaUrl}
            controls={false}
            onTimeUpdate={handleTimeUpdate}
          />
        ) : (
          <AudioElement
            ref={mediaRef}
            src={mediaUrl}
            controls={false}
            onTimeUpdate={handleTimeUpdate}
          />
        )
      )}
      <h1>Your Media</h1>
      <input type="file" accept="video/*,audio/*" onChange={handleMediaChange} />
      <h2>{mediaTitle}</h2>
      <ButtonContainer>
        <Button onClick={handlePlay}>Play</Button>
        <Button onClick={handlePause}>Pause</Button>
      </ButtonContainer>
      {mediaUrl && (
        <>
          <ButtonContainer>
            <DownloadButton onClick={handleDownload}>Download</DownloadButton>
            <Button onClick={handleTranscribe}>Transcribe</Button>
          </ButtonContainer>
          <Timestamp
            type="range"
            min="0"
            max={mediaRef.current ? mediaRef.current.duration : 0}
            value={currentTime}
            onChange={handleTimestampChange}
          />
        </>
      )}
      <Feedback>{feedback}</Feedback>
    </Uploader>
  );
};

export default Media;
