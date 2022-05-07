import React from "react";
import styled from 'styled-components';

export default function Slider({ value, changeValue }) {

  return (
    <SliderWrapper>
      <input type="range" min="0" max="1" step="0.01" value={value}
         onChange={({ target: { value: radius } }) => { changeValue(parseFloat(radius)); }}
      />
      <div> T-value = {value} </div>
    </SliderWrapper>
  );
}

const SliderWrapper = styled.div`
  position:relative;
  padding: 10px;
  font-family: sans-serif;
  text-align: center;
`