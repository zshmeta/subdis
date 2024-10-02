/* eslint-disable react-hooks/exhaustive-deps */
// src/components/Studio.jsx
import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { MediaContext } from './MediaContext';
import styled from 'styled-components';
import { FaRedo, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import TextEditor from './TextEditor';
import VideoPlayer from './VideoPlayer';
import Translation from './Translation';
import SegmentList from './SegmentList';
import Button from './Button';
import { toast } from 'react-toastify';

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

const IconButton = styled.button`
  position: absolute;
  top: -40px;
  ${(props) => (props.right ? 'right: 10px;' : 'left: 10px;')}
  background: ${(props) => (props.red ? '#ff4d4f' : '#1890ff')};
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
    background: ${(props) => (props.red ? '#ff7875' : '#40a9ff')};
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
  const [vttSubtitleUrl, setVttSubtitleUrl] = useState(''); // For VTT subtitles
  const [subtitleMode, setSubtitleMode] = useState(null); // 'segment' or 'word'
  const [subtitleBlob, setSubtitleBlob] = useState(null); // For ASS subtitles
  const [vttSubtitleBlob, setVttSubtitleBlob] = useState(null); // For VTT subtitles

  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Initialize segments from transcription data
  useEffect(() => {
    if (mediaFile && transcriptionData) {
      const initialSegs = transcriptionData.segments.map((segment) => ({
        id: segment.id,
        startTime: segment.start,
        endTime: segment.end,
        text: segment.text,
        words: segment.words, // Include the words array
      }));
      setSegments(initialSegs);
      setInitialSegments(initialSegs);
      const initialText = initialSegs.map((seg) => seg.text).join(' ').trim();
      setMainText(initialText);
    } else {
      navigate('/');
    }
  }, [mediaFile, transcriptionData, navigate]);

  // Handle changes in the main text area
  const handleMainTextChange = (content) => {
    setMainText(content);
  };

  // Function to synchronize segments with mainText
  const syncSegmentsWithMainText = () => {
    const words = mainText.trim().split(/\s+/);
    const newSegments = [];
    let wordIndex = 0;

    segments.forEach((seg) => {
      const segWordCount = seg.text.trim().split(/\s+/).length;
      const segWords = words.slice(wordIndex, wordIndex + segWordCount);
      const newText = segWords.join(' ').trim();
      newSegments.push({
        ...seg,
        text: newText,
        words: [], // Reset words array
      });
      wordIndex += segWordCount;
    });

    setSegments(newSegments);
    toast.success('Segments synchronized with main text!');
    return newSegments; // Return the new segments
  };

  // Function to synchronize words with mainText
  const syncWordsWithMainText = () => {
    const textWords = mainText.trim().split(/\s+/);
    let wordIndex = 0;

    const newSegments = segments.map((seg) => {
      const originalWords = seg.words || [];
      const segStartTime = seg.startTime;
      const segEndTime = seg.endTime;
      const segDuration = segEndTime - segStartTime;

      // Determine the number of words in this segment
      const segWordCount = seg.text.trim().split(/\s+/).length;
      const segWords = textWords.slice(wordIndex, wordIndex + segWordCount);
      wordIndex += segWordCount;

      const numWords = segWords.length;

      let newWords = [];
      if (originalWords.length === numWords) {
        // Map the new words to the original timings
        newWords = segWords.map((wordText, idx) => {
          const origWord = originalWords[idx];
          return {
            word: wordText,
            start: origWord.start,
            end: origWord.end,
          };
        });
      } else {
        // Adjust timings proportionally
        const wordDuration = segDuration / numWords;

        newWords = segWords.map((wordText, idx) => {
          const start = segStartTime + idx * wordDuration;
          const end = idx === numWords - 1 ? segEndTime : start + wordDuration;

          return {
            word: wordText,
            start: start,
            end: end,
          };
        });
      }

      return {
        ...seg,
        words: newWords,
      };
    });

    setSegments(newSegments);
    return newSegments;
  };

  // Handle changes in individual segments
  const handleSegmentTextChange = useCallback((index, newText) => {
    setSegments((prevSegments) => {
      const updatedSegments = [...prevSegments];
      updatedSegments[index] = { ...updatedSegments[index], text: newText };
      return updatedSegments;
    });
  }, []);

  // Reset segments and main text to initial state
  const handleReset = () => {
    setSegments(initialSegments);
    const initialText = initialSegments.map((seg) => seg.text).join(' ').trim();
    setMainText(initialText);
    setSubtitleUrl('');
    toast.info('Reset to original transcription.');
  };

  // Handle language selection for translation
  const handleLanguageChange = (e) => {
    setTargetLanguage(e.target.value);
  };

  const generateASS = (segmentsToUse) => {
    // Define the style based on subtitleStyle
    let primaryColour = '&H00FFFFFF'; // White
    if (subtitleStyle === 'black') {
      primaryColour = '&H00000000'; // Black
    } else if (subtitleStyle === 'yellow') {
      primaryColour = '&H00FFFF00'; // Yellow
    } else {
      primaryColour = '&H00FFFFFF'; // Default to white
    }

    const assHeader = `
[Script Info]
ScriptType: v4.00+
Collisions: Normal
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,60,${primaryColour},&H000000FF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    let assEvents = '';

    if (subtitleMode === 'word') {
      // Word-level subtitles with grouping
      segmentsToUse.forEach((seg) => {
        const words = seg.words;
        if (!words || words.length === 0) {
          return;
        }

        let i = 0;
        while (i < words.length) {
          // Group 2 to 3 words together
          const group = words.slice(i, i + 3);
          const start = group[0].start;
          const end = group[group.length - 1].end;
          const text = group.map((w) => w.word).join(' ').replace(/\r?\n/g, '\\N');

          const startTime = formatTimeASS(start);
          const endTime = formatTimeASS(end);

          assEvents += `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}\n`;

          i += 3;
        }
      });
    } else {
      // Segment-level subtitles
      segmentsToUse.forEach((seg) => {
        const start = formatTimeASS(seg.startTime);
        const end = formatTimeASS(seg.endTime);
        const text = seg.text.replace(/\r?\n/g, '\\N'); // Replace line breaks with ASS line breaks

        assEvents += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
      });
    }

    const assContent = assHeader + assEvents;

    // Create Blob and URL
    if (subtitleUrl) {
      URL.revokeObjectURL(subtitleUrl);
    }

    const blob = new Blob([assContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    setSubtitleUrl(url);
    setSubtitleBlob(blob); // Store the Blob
  };

  const formatTimeASS = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600)
      .toString()
      .padStart(1, '0');
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(timeInSeconds % 60)
      .toString()
      .padStart(2, '0');
    const centiseconds = Math.floor((timeInSeconds % 1) * 100)
      .toString()
      .padStart(2, '0');
    return `${hours}:${minutes}:${seconds}.${centiseconds}`;
  };

  // Handle translation
// Handle translation
const handleTranslate = useCallback(async () => {
  setIsTranslating(true);
  try {
    const textToTranslate = segments.map((seg) => seg.text).join('\n');

    const response = await fetch('http://localhost:5000/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToTranslate, targetLanguage }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    const translatedText = data.text;
    const translatedSegments = translatedText.split('\n');
    setSegments((prevSegments) =>
      prevSegments.map((seg, idx) => ({
        ...seg,
        text: translatedSegments[idx] || '',
      }))
    );
    const combinedTranslatedText = translatedSegments.join(' ').trim();
    setMainText(combinedTranslatedText);
    toast.success('Translation completed successfully!');
  } catch (error) {
    console.error('Translation Error:', error);
    alert('Translation failed. Please try again.');
  }
  setIsTranslating(false);
}, [segments, targetLanguage]);

  // Generate VTT file from segments
  const generateVTT = (segmentsToUse) => {
    let vttContent = 'WEBVTT\n\n';
    segmentsToUse.forEach((seg, idx) => {
      const start = formatTime(seg.startTime);
      const end = formatTime(seg.endTime);
      vttContent += `${idx + 1}\n${start} --> ${end}\n${seg.text}\n\n`;
    });

    // Revoke the old URL if it exists
    if (vttSubtitleUrl) {
      URL.revokeObjectURL(vttSubtitleUrl);
    }

    const blob = new Blob([vttContent], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    setVttSubtitleUrl(url);
    setVttSubtitleBlob(blob); // Store the Blob
  };

  const generateVTTByWords = (segmentsToUse) => {
    let vttContent = 'WEBVTT\n\n';
    let subtitleIndex = 1;

    segmentsToUse.forEach((seg) => {
      const words = seg.words;
      if (!words || words.length === 0) {
        return;
      }

      let i = 0;
      while (i < words.length) {
        // Group 2 to 3 words together
        const group = words.slice(i, i + 3);
        const start = group[0].start;
        const end = group[group.length - 1].end;
        const text = group.map((w) => w.word).join(' ');

        const startTime = formatTime(start);
        const endTime = formatTime(end);

        vttContent += `${subtitleIndex}\n${startTime} --> ${endTime}\n${text}\n\n`;
        subtitleIndex++;
        i += 3;
      }
    });

    // Revoke the old URL if it exists
    if (vttSubtitleUrl) {
      URL.revokeObjectURL(vttSubtitleUrl);
    }

    const blob = new Blob([vttContent], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    setVttSubtitleUrl(url);
    setVttSubtitleBlob(blob); // Store the Blob
  };

  // Format time from seconds to HH:MM:SS.mmm
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (timeInSeconds % 60).toFixed(3).padStart(6, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleSubdis = () => {
    const updatedSegments = syncSegmentsWithMainText();
    generateVTT(updatedSegments); // For in-browser playback
    generateASS(updatedSegments); // For downloading video
    setSubtitleMode('segment'); // Set the mode
    toast.success('Subtitles have been generated and linked to the video.');
  };

  const handleSubdisByWords = () => {
    const updatedSegments = syncSegmentsWithMainText();
    const syncedSegments = syncWordsWithMainText();
    generateVTTByWords(syncedSegments); // For in-browser playback
    generateASS(syncedSegments); // For downloading video
    setSubtitleMode('word'); // Set the mode
    toast.success('Word-level subtitles have been generated and linked to the video.');
  };

  const handleDownloadVideo = async () => {
    if (!subtitleMode) {
      alert('Please generate subtitles first by clicking "Subdis" or "Subdis By Words".');
      return;
    }

    // Synchronize segments and regenerate subtitles based on the last mode
    let updatedSegments;

    if (subtitleMode === 'segment') {
      updatedSegments = syncSegmentsWithMainText();
      generateASS(updatedSegments);
    } else if (subtitleMode === 'word') {
      updatedSegments = syncSegmentsWithMainText();
      const syncedSegments = syncWordsWithMainText();
      generateASS(syncedSegments);
    }

    // Wait for the subtitles to be regenerated before proceeding
    await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to ensure subtitles are updated

    try {
      if (!subtitleBlob) {
        throw new Error('No subtitles available.');
      }

      // Set the subtitle format to 'ass'
      const subtitleFormat = 'ass';

      // Create FormData to send files
      const formData = new FormData();
      formData.append('video', mediaFile);
      formData.append('subtitles', subtitleBlob, 'subtitles.ass');
      formData.append('format', subtitleFormat);
      formData.append('style', subtitleStyle);

      // Send POST request to the server
      const response = await fetch('http://localhost:5000/burn-subtitles', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to embed subtitles.');
      }

      // Download the processed video
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      // Use the original video filename
      const originalFileName = mediaFile.name;
      const dotIndex = originalFileName.lastIndexOf('.');
      const baseName = dotIndex !== -1 ? originalFileName.substring(0, dotIndex) : originalFileName;
      const extension = dotIndex !== -1 ? originalFileName.substring(dotIndex) : '.mp4';

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${baseName}-subdis${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
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
      if (vttSubtitleUrl) {
        URL.revokeObjectURL(vttSubtitleUrl);
      }
      if (videoRef.current && videoRef.current.src) {
        URL.revokeObjectURL(videoRef.current.src);
      }
    };
  }, [subtitleUrl, vttSubtitleUrl]);

  return (
    <StudioContainer>
      <VideoContainer>
        {mediaFile && (
          <VideoPlayer
            ref={videoRef}
            src={URL.createObjectURL(mediaFile)}
            subtitleUrl={vttSubtitleUrl} // Use VTT subtitles for the player
            subtitleStyle={subtitleStyle}
            key={subtitleUrl}
          />
        )}
        <Button onClick={handleSubdis} aria-label="Generate Subtitles">
          Subdis
        </Button>
        <Button onClick={handleSubdisByWords} aria-label="Generate Word Subtitles">
          Subdis By Words
        </Button>
        <Button onClick={handleDownloadVideo} aria-label="Download Video">
          Download Video
        </Button>
      </VideoContainer>
      <EditorContainer>
        <IconButton onClick={handleReset} title="Reset to original" right red>
          <FaRedo />
        </IconButton>
        <IconButton onClick={handleGoBack} title="Go Back">
          <FaArrowLeft />
        </IconButton>
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
          </select>
        </StyleContainer>
        <Label htmlFor="main-text-editor">Main Text:</Label>
        <TextEditor
          id="main-text-editor"
          value={mainText}
          onChange={handleMainTextChange}
          minHeight="200px"
        />
        <Button onClick={syncSegmentsWithMainText}>Sync Segments</Button>
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
