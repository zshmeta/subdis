// src/components/TextEditor.jsx
import React, { useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styled from 'styled-components';

// Styled Component for Text Editor
const EditorWrapper = styled.div`
  .ql-editor {
    min-height: ${(props) => props.minHeight || '200px'};
    background-color: #ffffff;
    border-radius: 4px;
    padding: 10px;
  }
`;

const TextEditor = ({ value, onChange, theme = 'snow', minHeight, ...props }) => {
  const handleChange = useCallback((content, delta, source, editor) => {
    if (source === 'user') {
      onChange(content, delta, source, editor);
    }
  }, [onChange]);

  return (
    <EditorWrapper minHeight={minHeight}>
      <ReactQuill
        value={value}
        onChange={handleChange}
        theme={theme}
        {...props}
      />
    </EditorWrapper>
  );
};

export default React.memo(TextEditor);