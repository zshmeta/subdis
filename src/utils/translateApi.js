import axios from 'axios';

export const translateText = async (text, targetLanguage) => {
  try {
    const response = await axios.post('/api/translate', {
      text,
      targetLanguage,
    });

    return response.data.translatedText;
  } catch (error) {
    console.error('Error during translation request:', error);
    throw error;
  }
};
