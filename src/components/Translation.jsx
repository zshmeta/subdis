// src/components/TranslationControls.jsx
import React from 'react';
import styled from 'styled-components';
import Button from './Button';
import translate from 'google-translate-api-x';



const LanguageContainer = styled.div`
  margin-bottom: 15px;
  display: flex;
  align-items: center;

  label {
    margin-right: 10px;
    font-weight: bold;
    color: #555555;
  }

  select {
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
    margin-right: 10px;
    flex: 1;
  }
`;

const Translation = ({
  targetLanguage,
  languages,
  onLanguageChange,
  onTranslate,
  isTranslating,
}) => (
  <LanguageContainer>
    <label htmlFor="language-select">Translate to:</label>
    <select
      id="language-select"
      value={targetLanguage}
      onChange={onLanguageChange}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
    <Button onClick={onTranslate} disabled={isTranslating}>
      {isTranslating ? 'Translating...' : 'Translate'}
    </Button>
  </LanguageContainer>
);

export default React.memo(Translation);
