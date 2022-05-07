import React from 'react';
import styled from 'styled-components';
import { COLORS, scaleColor } from '../constants/constants';

// import './bezier.css';

export default function BezierController({ bezierComponent }) {
  return (
    <BezierWrapper>
      <SVGWrapper>
        {bezierComponent}
      </SVGWrapper>
    </BezierWrapper>
  )
}

const SVGWrapper = styled.div`
  background: ${COLORS.palette.black};
`

const BezierWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: ${scaleColor(0.05, COLORS.palette.black)};
  box-sizing: border-box;
  padding: 10px;
  &:hover {
    background: ${scaleColor(0.1, COLORS.palette.black)};
    transition-duration: 0.3s;
  }
`