import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { MediaContext } from './MediaContext';
import styled from 'styled-components';
import { FaRedo, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import TextEditor from './TextEditor';
import VideoPlayer from './VideoPlayer';
import Translation from './Translation';
import { translate } from 'google-translate-api-x';
import SegmentList from './SegmentList';
import Button from './Button';
import { embedSubtitles } from '../utils/embed';
import { toast } from 'react-toastify';
import axios from 'axios';

// Styled Components
const StudioContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 20px;
  gap: 20px;
  height: 100vh;
  box-sizing: border-box;
  color: darkblue;
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

const VideoContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const EditorContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ResetButton = styled.button`
  position: absolute;
  top: -40px;
  right: 10px;
  background: #ff4d4f;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  color: white;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #ff7875;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: -40px;
  left: 10px;
  background: #1890ff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  color: white;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #40a9ff;
  }
`;

const Label = styled.label`
  margin-top: 15px;
  margin-bottom: 5px;
  font-weight: bold;
  color: cyan;
`;

const StyleContainer = styled.div`
  margin-bottom: 15px;
  display: flex;
  align-items: center;

  h3 {
    margin-right: 10px;
    font-size: 16px;
    color: cyan;
  }

  select {
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
    flex: 1;
  }
`;

// Languages Array Defined
const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  // Add more languages as needed
];

const Studio = () => {
  const { mediaFile, transcriptionData } = useContext(MediaContext);
  const [segments, setSegments] = useState([]);
  const [initialSegments, setInitialSegments] = useState([]);
  const [mainText, setMainText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [subtitleUrl, setSubtitleUrl] = useState('');
  const [subtitleStyle, setSubtitleStyle] = useState('default');
  const [editorContent, setEditorContent] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Flags to prevent infinite loops during synchronization
  const isUpdatingSegments = useRef(false);
  const isUpdatingMainText = useRef(false);

  // Initialize segments from transcription data
  useEffect(() => {
    if (mediaFile && transcriptionData) {
      const initialSegs = transcriptionData.segments.map((segment) => ({
        id: segment.id,
        startTime: segment.start,
        endTime: segment.end,
        text: segment.text,
      }));
      setSegments(initialSegs);
      setInitialSegments(initialSegs);
      setMainText(initialSegs.map(seg => seg.text).join(' ').trim());
    } else {
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaFile, transcriptionData, navigate]);

  // Synchronize mainText with segments
  useEffect(() => {
    if (isUpdatingSegments.current) {
      isUpdatingSegments.current = false;
      return;
    }

    const fullText = segments.map(seg => seg.text).join(' ').trim();
    if (fullText !== mainText.trim()) {
      isUpdatingMainText.current = true;
      setMainText(fullText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  // Synchronize segments with mainText
  useEffect(() => {
    if (isUpdatingMainText.current) {
      isUpdatingMainText.current = false;
      return;
    }

    const words = mainText.trim().split(' ');
    const newSegments = [];
    let wordIndex = 0;
    let hasChanged = false;

    segments.forEach(seg => {
      const segWordCount = seg.text.split(' ').length;
      const segWords = words.slice(wordIndex, wordIndex + segWordCount);
      const newText = segWords.join(' ').trim();
      if (newText !== seg.text) {
        hasChanged = true;
      }
      newSegments.push({
        ...seg,
        text: newText,
      });
      wordIndex += segWordCount;
    });

    if (hasChanged) {
      isUpdatingSegments.current = true;
      setSegments(newSegments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainText]);

  // Handle changes in the main text area with debounce
  const handleMainTextChange = useCallback((content, delta, source, editor) => {
    if (source !== 'user') return; // Only handle user-initiated changes
    const newText = editor.getText().trim();
    setMainText(newText);
  }, []);

  // Handle editor Content Change
  const handleEditorChange = useCallback((content) => {
    setEditorContent(content);
  }, []);


  // Handle changes in individual segments
  const handleSegmentTextChange = useCallback((index, newText) => {
    setSegments(prevSegments => {
      const updatedSegments = [...prevSegments];
      updatedSegments[index] = { ...updatedSegments[index], text: newText };
      return updatedSegments;
    });
  }, []);

  // Reset segments and main text to initial state
  const handleReset = () => {
    setSegments(initialSegments);
    setMainText(initialSegments.map(seg => seg.text).join(' ').trim());
    setSubtitleUrl('');
  };

  // Handle language selection for translation
  const handleLanguageChange = (e) => {
    setTargetLanguage(e.target.value);
  };

  const handleTranslate = useCallback(async () => {
    setIsTranslating(true);
    try {
      const textToTranslate = segments.map(seg => seg.text).join('\n');
      
      // Make a POST request to the backend translation service
      const response = await fetch('http://localhost:3000/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToTranslate, targetLanguage }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
  
      const translatedText = data.text;
      const translatedSegments = translatedText.split('\n');
      setSegments(prevSegments => prevSegments.map((seg, idx) => ({
        ...seg,
        text: translatedSegments[idx] || '',
      })));
  
      toast.success('Translation completed successfully!');
    } catch (error) {
      console.error('Translation Error:', error);
      alert('Translation failed. Please try again.');
    }
    setIsTranslating(false);
  }, [segments, targetLanguage]);

  // Generate the VTT file from segments
  const generateVTT = () => {
    let vttContent = 'WEBVTT\n\n';
    segments.forEach((seg, idx) => {
      const start = formatTime(seg.startTime);
      const end = formatTime(seg.endTime);
      vttContent += `${idx + 1}\n${start} --> ${end}\n${seg.text}\n\n`;
    });

    // Revoke the old URL if it exists
    if (subtitleUrl) {
      URL.revokeObjectURL(subtitleUrl);
    }

    const blob = new Blob([vttContent], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    setSubtitleUrl(url);
  };

  // Format time from seconds to HH:MM:SS.mmm
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((timeInSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toFixed(3).padStart(6, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Handle the "Subdis" button click
  const handleSubdis = async () => {
    generateVTT(); // Generate the VTT file
    alert('Subtitles have been generated and linked to the video.');
  };

  // Handle the "Download Video" button click
  const handleDownloadVideo = async () => {
    if (!subtitleUrl) {
      alert('Please generate subtitles first by clicking "Subdis".');
      return;
    }

    try {
      const embeddedVideoBlob = await embedSubtitles(mediaFile, subtitleUrl, subtitleStyle);
      const embeddedVideoUrl = URL.createObjectURL(embeddedVideoBlob);
      // Trigger download
      const a = document.createElement('a');
      a.href = embeddedVideoUrl;
      a.download = 'video_with_subtitles.mp4';
      a.click();

      // Clean up the object URL after download
      URL.revokeObjectURL(embeddedVideoUrl);
    } catch (error) {
      console.error('Embedding Error:', error);
      alert('Failed to embed subtitles. Please try again.');
    }
  };

  // Navigate back to the home page
  const handleGoBack = () => {
    navigate('/');
  };

  // Handle subtitle style selection
  const handleStyleChange = (e) => {
    setSubtitleStyle(e.target.value);
  };

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (subtitleUrl) {
        URL.revokeObjectURL(subtitleUrl);
      }
      if (videoRef.current && videoRef.current.src) {
        URL.revokeObjectURL(videoRef.current.src);
      }
    };
  }, [subtitleUrl]);

  return (
    <StudioContainer>
      <VideoContainer>
        {mediaFile && (
          <VideoPlayer
            ref={videoRef}
            src={URL.createObjectURL(mediaFile)}
            subtitleUrl={subtitleUrl}
            targetLanguage={targetLanguage}
            key={subtitleUrl} // Add key to force re-render
          />
        )}
        <Button onClick={handleSubdis} aria-label="Generate Subtitles">Subdis</Button>
        <Button onClick={handleDownloadVideo} aria-label="Download Video">Download Video</Button>
      </VideoContainer>
      <EditorContainer>
        <ResetButton onClick={handleReset} title="Reset to original">
          <FaRedo />
        </ResetButton>
        <BackButton onClick={handleGoBack} title="Go Back">
          <FaArrowLeft />
        </BackButton>
        <Translation
          targetLanguage={targetLanguage}
          languages={languages}
          onLanguageChange={handleLanguageChange}
          onTranslate={handleTranslate}
          isTranslating={isTranslating}
        />
        <StyleContainer>
          <h3>Subtitle Style</h3>
          <select value={subtitleStyle} onChange={handleStyleChange}>
            <option value="default">Default</option>
            <option value="white">White</option>
            <option value="black">Black</option>
            <option value="yellow">Yellow</option>
            {/* Add more styles as needed */}
          </select>
        </StyleContainer>
        <Label htmlFor="main-text-editor">Main Text:</Label>
        <TextEditor
          id="main-text-editor"
          value={mainText}
          onChange={handleMainTextChange}
          theme="snow"
          minHeight="200px"
        />
        <div>
          <h3>Segments</h3>
          <SegmentList
            segments={segments}
            handleSegmentTextChange={handleSegmentTextChange}
          />
        </div>
      </EditorContainer>
    </StudioContainer>
  );
};

export default Studio;