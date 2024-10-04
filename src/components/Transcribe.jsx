// src/components/Transcribe.jsx
import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MediaContext } from './MediaContext';
import styled from 'styled-components';
import ReactLoading from 'react-loading';

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
`;

const Transcribe = () => {
  const { mediaFile, setTranscriptionData, apiToken } = useContext(MediaContext); // Assume you have apiToken in context
  const navigate = useNavigate();

  useEffect(() => {
    const transcribeMedia = async () => {
      if (mediaFile) {
        try {
          const formData = new FormData();
          formData.append('file', mediaFile); // 'file' matches the server's expected field
          formData.append('task', 'transcribe'); // Optional: specify the task
          if (apiToken) {
            formData.append('token', apiToken); // Optional: include API token if needed
          }

          const apiUrl = 'http://localhost:5000/transcribe'; // Adjust based on your server's URL

          // Log the file being uploaded
          console.log('Uploading file:', mediaFile);

          const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
          });

          // Log response status and headers
          console.log('Response Status:', response.status);
          console.log('Response Headers:', response.headers);

          // Attempt to read response as JSON
          const data = await response.json();
          console.log('Transcription Data:', data);

          if (response.ok) {
            setTranscriptionData(data.transcription);
            navigate('/studio');
          } else {
            throw new Error(data.error || 'Transcription failed.');
          }
        } catch (error) {
          console.error('Error:', error);
          navigate('/error');
        }
      } else {
        navigate('/');
      }
    };

    transcribeMedia();
  }, [mediaFile, setTranscriptionData, navigate, apiToken]);

  return (
    <LoaderContainer>
      <ReactLoading type="bars" color="#007BFF" height={100} width={100} />
      <p>Transcribing your media, please wait...</p>
    </LoaderContainer>
  );
};

export default Transcribe;
