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
    if (mediaFile) {
      // Create form data
      const formData = new FormData();
      formData.append('audio_file', mediaFile);

      // Build URL with query parameters
      const apiUrl = '/asr?encode=true&task=transcribe&word_timestamps=false&output=json';

      // Send POST request to /asr endpoint
      fetch(apiUrl, {
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
          navigate('/studio');
        })
        .catch(error => {
          console.error('Error:', error);
          navigate('/error');
        });
    } else {
      navigate('/');
    }
  }, [mediaFile, setTranscriptionData, navigate]);

  return (
    <LoaderContainer>
      <ReactLoading type="bars" color="#007BFF" height={100} width={100} />
      <p>Transcribing your media, please wait...</p>
    </LoaderContainer>
  );
};

export default Transcribe;
