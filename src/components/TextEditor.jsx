
// src/components/TextEditor.jsx
import React from 'react';
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

const TextEditor = ({ value, onChange, theme = 'snow', minHeight, ...props }) => (
  <EditorWrapper minHeight={minHeight}>
    <ReactQuill
      value={value}
      onChange={onChange}
      theme={theme}
      {...props}
    />
  </EditorWrapper>
);

export default React.memo(TextEditor);
