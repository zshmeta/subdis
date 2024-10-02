/* eslint-disable react/prop-types */
// src/components/TextEditor.jsx
import styled from 'styled-components';

const TextArea = styled.textarea`
  width: 100%;
  min-height: ${(props) => props.minHeight || '200px'};
  resize: vertical;
  padding: 10px;
  font-size: 16px;
`;

const TextEditor = ({ value, onChange, minHeight, ...props }) => {
  return (
    <TextArea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      minHeight={minHeight}
      {...props}
    />
  );
};

export default TextEditor;
