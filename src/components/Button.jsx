// src/components/Button.jsx
import styled from 'styled-components';

const Button = styled.button`
  margin: 5px;
  padding: 10px 15px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  min-width: 120px;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #40a9ff;
  }
`;

export default Button;
