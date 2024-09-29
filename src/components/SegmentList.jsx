// src/components/SegmentList.jsx
import React from 'react';
import styled from 'styled-components';
import Segment from './Segment';

const SegmentsSection = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
`;

const SegmentList = ({ segments, handleSegmentTextChange }) => (
  <SegmentsSection>
    {segments.map((segment, index) => (
      <Segment
        key={segment.id}
        segment={segment}
        index={index}
        handleSegmentTextChange={handleSegmentTextChange}
      />
    ))}
  </SegmentsSection>
);

export default React.memo(SegmentList);
