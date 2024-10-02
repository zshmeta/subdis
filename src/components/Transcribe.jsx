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
  const { mediaFile, setTranscriptionData } = useContext(MediaContext);
  const navigate = useNavigate();

  useEffect(() => {
    const transcribeMedia = async () => {
      if (mediaFile) {
        try {
          const formData = new FormData();
          formData.append('file', mediaFile); // Ensure 'file' matches the curl command

          const apiUrl = '/whispapi'; // Relative path to utilize Vite proxy

          // Log the file being uploaded
          console.log('Uploading file:', mediaFile);

          const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
          });

          // Log response status and headers
          console.log('Response Status:', response.status);
          console.log('Response Headers:', response.headers);

          // Attempt to read response as text
          const responseText = await response.text();
          console.log('Response Text:', responseText);

          // Attempt to parse JSON only if response is OK
          if (response.ok) {
            try {
              const data = JSON.parse(responseText);
              console.log('Transcription Data:', data);
              setTranscriptionData(data);
              navigate('/studio');
            } catch (jsonError) {
              console.error('JSON Parsing Error:', jsonError);
              throw new Error('Failed to parse JSON response.');
            }
          } else {
            // If response is not OK, throw an error with the response text
            throw new Error(`Server Error: ${response.status} ${response.statusText} - ${responseText}`);
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
  }, [mediaFile, setTranscriptionData, navigate]);

  return (
    <LoaderContainer>
      <ReactLoading type="bars" color="#007BFF" height={100} width={100} />
      <p>Transcribing your media, please wait...</p>
    </LoaderContainer>
  );
};

export default Transcribe;
