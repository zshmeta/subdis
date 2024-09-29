// src/components/Segment.jsx
import React from 'react';
import styled from 'styled-components';
import TextEditor from './TextEditor';

const SegmentContainer = styled.div`
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Timestamp = styled.p`
  font-size: 12px;
  color: #555555;
  margin-bottom: 5px;
`;

const Segment = React.memo(({ segment, index, handleSegmentTextChange }) => {
  const onChange = (content, delta, source, editor) => {
    if (source !== 'user') return;
    handleSegmentTextChange(index, editor.getText());
  };

  return (
    <SegmentContainer>
      <Timestamp>
        {segment.startTime.toFixed(2)}s - {segment.endTime.toFixed(2)}s
      </Timestamp>
      <TextEditor
        value={segment.text}
        onChange={onChange}
        theme="bubble"
        minHeight="40px"
      />
    </SegmentContainer>
  );
});

export default Segment;
