import React from "react";
import styled from 'styled-components';
import { COLORS } from '../constants/constants';

export default function Button({ performFunction, text, outlined=true, color=COLORS.palette.cyan }) {
    return (
      <ButtonDefault
        outlined={outlined}
        defaultColor={color}
        onClick={() => {performFunction()}}>
          {text}
      </ButtonDefault>
    );
};

const ButtonDefault = styled.button`
    font-size: medium;
    color: ${(props) => (props.outlined) ? props.defaultColor : 'black' };
    background: ${(props) => (props.outlined) ? COLORS.palette.black : props.defaultColor };
    border: 2px solid ${(props) => props.defaultColor};
    border-radius: 4px;
    padding: 0.55em 0.65em;
    text-align: center;
    cursor: pointer;
    &:hover {
        color: ${(props) => (props.outlined) ? 'black': props.defaultColor };
        background: ${(props) => (props.outlined) ? props.defaultColor : COLORS.palette.black };
        // border: 2px solid ${(props) => (props.outlined) ? COLORS.palette.black : props.defaultColor };
        transition-duration: 0.4s;
    }
`