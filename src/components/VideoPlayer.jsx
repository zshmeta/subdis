// src/components/VideoPlayer.jsx
import React from 'react';
import styled from 'styled-components';

// Styled Component for Video Element
const VideoElement = styled.video`
  width: 100%;
  max-height: 70vh;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const VideoPlayer = ({ src, subtitleUrl, targetLanguage, ...props }) => (
  <VideoElement controls {...props}>
    <source src={src} type="video/mp4" />
    {subtitleUrl && (
      <track
        kind="subtitles"
        srcLang={targetLanguage}
        src={subtitleUrl}
        default
      />
    )}
    Your browser does not support the video tag.
  </VideoElement>
);

export default React.memo(VideoPlayer);
