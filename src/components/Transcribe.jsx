// src/components/Transcribe.jsx
import { useState, useEffect, useContext } from 'react';
import { MediaContext } from './MediaContext';
import styled from 'styled-components';

const Loader = styled.div`
  /* Styles for the loader */
  font-size: 24px;
  text-align: center;
  margin-top: 50px;
`;

const TranscriptionContainer = styled.div`
  padding: 20px;
`;

const SegmentContainer = styled.div`
  margin-bottom: 20px;
`;

const SegmentHeader = styled.h3`
  margin-bottom: 5px;
`;

const Timestamp = styled.p`
  font-size: 14px;
  color: #555;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: auto;
  min-height: 50px;
  resize: vertical;
  font-size: 16px;
  padding: 10px;
  box-sizing: border-box;
`;

const Transcribe = () => {
  const { mediaFile } = useContext(MediaContext);
  const [transcriptionData, setTranscriptionData] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    if (mediaFile) {
      // Create form data
      const formData = new FormData();
      formData.append('format', 'json');
      formData.append('video', mediaFile);

      // Send POST request to /asr endpoint
      fetch('http://localhost:9000/asr', {
        method: 'POST',
        body: formData,
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json();
        })
        .then(data => {
          setTranscriptionData(data);
          // Initialize segments in state for editing
          if (data.segments) {
            const initialSegments = data.segments.map(segment => ({
              id: segment[0],
              startTime: segment[2],
              endTime: segment[3],
              text: segment[4],
            }));
            setSegments(initialSegments);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          setError(error.toString());
          setLoading(false);
        });
    } else {
      setError('No media file provided.');
      setLoading(false);
    }
  }, [mediaFile]);

  const handleSegmentTextChange = (index, newText) => {
    const updatedSegments = segments.map((segment, i) =>
      i === index ? { ...segment, text: newText } : segment
    );
    setSegments(updatedSegments);
  };

  if (loading) {
    return <Loader>Loading transcription...</Loader>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (transcriptionData) {
    return (
      <TranscriptionContainer>
        <h1>Transcription</h1>
        <h2>Full Text</h2>
        <TextArea
          value={segments.map(s => s.text).join(' ')}
          rows={10}
          readOnly
        />
        <h2>Segments</h2>
        {segments.map((segment, index) => (
          <SegmentContainer key={segment.id}>
            <SegmentHeader>Segment {index + 1}</SegmentHeader>
            <Timestamp>
              Start: {segment.startTime.toFixed(2)}s | End: {segment.endTime.toFixed(2)}s
            </Timestamp>
            <TextArea
              value={segment.text}
              onChange={e => handleSegmentTextChange(index, e.target.value)}
            />
          </SegmentContainer>
        ))}
      </TranscriptionContainer>
    );
  }

  return null;
};

export default Transcribe;
