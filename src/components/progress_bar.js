import React from "react";
import styled from 'styled-components';
import { COLORS } from '../constants/constants';

export default function ProgressBar ({ backgroundColor, percent, border=true }) {

    if (typeof backgroundColor === 'undefined'){
      backgroundColor = "#000000"
    }
  
    return (
      <ProgressBarWrapper>
        <ProgressHolder border={border} backgroundColor={backgroundColor}>
          <Progress 
            percent={percent}
            backgroundColor={backgroundColor}
          />
        </ProgressHolder>
        <PercentText>{percent.toFixed(2)}</PercentText>
      </ProgressBarWrapper>
    );
};

const ProgressBarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: medium;
`

const ProgressHolder = styled.div`
  background-color: ${(props) => (props.border) ? 'transparent' : COLORS.gray[100]};
  border-radius: 1rem;
  border: ${(props) => (props.border) ? '1px solid ' + props.backgroundColor: 'none'};
  width: 100%;
`

const Progress = styled.div.attrs((props) => ({
  style: {
    width: (props.percent * 100) + '%',
  },
}))`
  height: 100%;
  border-radius: 1rem;
  background: ${(props) => props.backgroundColor};
`

const PercentText = styled.div`
  padding-left: 10px;
`