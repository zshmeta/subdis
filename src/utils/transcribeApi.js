// src/utils/transcribeApi.js

import axios from 'axios';

export const transcribeMedia = async (mediaFile) => {
    const formData = new FormData();
    formData.append('file', mediaFile);
  
    try {
      const response = await axios.post('/asr', formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  