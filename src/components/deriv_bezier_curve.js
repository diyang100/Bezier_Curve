import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { COLORS } from '../constants/constants';
import { getDeviceType } from '../constants/constants';
import { lerp } from '../constants/constants';

class DerivBezier extends PureComponent {
  state = {
    draggingPointId: null,
  };

  static propTypes = {
    points: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    viewBoxWidth: PropTypes.number,
    viewBoxHeight: PropTypes.number,
    strokeColor: PropTypes.string,
    strokeWidth: PropTypes.number,
    updatePoint: PropTypes.func,
    t: PropTypes.number,
  };

  static defaultProps = {
    viewBoxWidth: 100,
    viewBoxHeight: 100,
    strokeColor: COLORS.palette.cyan,
    strokeWidth: 6,
    grabbable: false,
  };


  derivP = (p1, p2, p3, p4, t) => {
      let retPoint = [0, 0];
      retPoint[0] += p1[0] * (-3*(t**2)+6*t-3);
      retPoint[1] += p1[1] * (-3*(t**2)+6*t-3);
      retPoint[0] += p2[0] * (9*(t**2)-12*t+3);
      retPoint[1] += p2[1] * (9*(t**2)-12*t+3);
      retPoint[0] += p3[0] * (-9*(t**2)+6*t);
      retPoint[1] += p3[1] * (-9*(t**2)+6*t);
      retPoint[0] += p4[0] * (3*(t**2));
      retPoint[1] += p4[1] * (3*(t**2));
      return retPoint;
  }

  render() {
    const { points, viewBoxWidth, viewBoxHeight, strokeColor, strokeWidth, grabbable, t } = this.props;
    let [p1, p2, p3, p4, display_deriv_p] = points;
    

    // TODO: change 1000 constant to variable passed
    p1[1] = 1000 - p1[1];
    p2[1] = 1000 - p2[1];
    p3[1] = 1000 - p3[1];
    p4[1] = 1000 - p4[1];
    display_deriv_p[1] = 1000 - display_deriv_p[1];

    const A = lerp(p1, p2, t);
    const B = lerp(p2, p3, t);
    const C = lerp(p3, p4, t);
    const D = lerp(A, B, t);
    const E = lerp(B, C, t);
    const P = lerp(D, E, t);

    // const deriv_point = this.derivP(p1, p2, p3, p4, t);
    // const display_deriv_p = [P[0]+(deriv_point[0]/3), P[1]+(deriv_point[1]/3)];

    //TODO: move this to constants
    // const offset = [viewBoxWidth/4, viewBoxHeight/4];
    const offset = [0, 0];

    const instructions = 
      `M ${p1[0] + offset[0]},${p1[1] + offset[1]} 
      C ${p2[0] + offset[0]},${p2[1] + offset[1]} 
      ${p3[0] + offset[0]},${p3[1] + offset[1]} 
      ${p4[0] + offset[0]},${p4[1] + offset[1]}`;

    const isMobile = getDeviceType() === 'mobile';

    return (
        <Svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} ref={node => (this.node = node)}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                stroke={COLORS.palette.orange} fill={COLORS.palette.orange}
                markerWidth="6" markerHeight="6"
                orient="auto-start-reverse">
              <path d="M 0 1 L 5 5 L 0 9 z" />
            </marker>
          </defs>
        <ControlLine x1={p1[0] + offset[0]} y1={p1[1] + offset[1]} x2={p2[0] + offset[0]} y2={p2[1] + offset[1]} stroke={COLORS.gray[300]}/>
        <ControlLine x1={p3[0] + offset[0]} y1={p3[1] + offset[1]} x2={p4[0] + offset[0]} y2={p4[1] + offset[1]} stroke={COLORS.gray[300]}/>
        <ControlLine x1={p2[0] + offset[0]} y1={p2[1] + offset[1]} x2={p3[0] + offset[0]} y2={p3[1] + offset[1]} stroke={COLORS.gray[300]}/>

        <path d={instructions} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />

        <EndPoint stroke={COLORS.palette.cyan} cx={p1[0] + offset[0]} cy={p1[1] + offset[1]} grabbable={grabbable} isMobile={isMobile} />
        <EndPoint stroke={COLORS.palette.cyan} cx={p2[0] + offset[1]} cy={p2[1] + offset[1]} grabbable={grabbable} isMobile={isMobile} />
        <EndPoint stroke={COLORS.palette.cyan} cx={p3[0] + offset[0]} cy={p3[1] + offset[1]} grabbable={grabbable} isMobile={isMobile} />
        <EndPoint stroke={COLORS.palette.cyan} cx={p4[0] + offset[0]} cy={p4[1] + offset[1]} grabbable={grabbable} isMobile={isMobile} />
        {/* <ControlPoint cx={display_deriv_p[0] + offset[0]} cy={display_deriv_p[1] + offset[1]} grabbable={false} isMobile={isMobile} /> */}
        <VectorLine x1={P[0] + offset[0]} y1={P[1] + offset[1]} 
          x2={display_deriv_p[0] + offset[0]} y2={display_deriv_p[1] + offset[1]} 
          style={{ markerEnd:"url(#arrow)" }}
          stroke={COLORS.palette.orange}
        />
        <EndPoint
          cx={P[0] + offset[0]} cy={P[1] + offset[1]}
          grabbable={false}
          isMobile={isMobile}
          stroke={COLORS.palette.orange}
        />
      </Svg>
    );
  }
}

const ControlPoint = ({
  cx,
  cy,
  onMouseDown,
  onTouchStart,
  grabbable,
  isMobile,
  fill,
  stroke,
}) => (
  <g>
    <VisibleControlPoint
      cx={cx}
      cy={cy}
      grabbable={grabbable}
      isMobile={isMobile}
      fill={fill}
      stroke={stroke}
    />
    <InvisibleHandle
      cx={cx}
      cy={cy}
      grabbable={grabbable}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      isMobile={isMobile}
    />
  </g>
);

const Svg = styled.svg`
  position: relative;
  overflow: visible;
  touch-action: none;
`;

const Point = styled.ellipse`
  cursor: ${props => (props.grabbable ? '-webkit-grab' : 'not-allowed')};
  &:active {
    cursor: ${props => (props.grabbable ? '-webkit-grabbing' : 'not-allowed')};
  }
`;

const EndPoint = styled(Point).attrs(props => ({
  rx: props.isMobile ? 30 : 15,
  ry: props.isMobile ? 30 : 15,
  strokeWidth: props.isMobile ? 10 : 5,
}))`
  fill: ${props => props.fill};
  stroke: ${props => props.stroke};
`;

const VisibleControlPoint = styled(Point).attrs(props => ({
  rx: props.isMobile ? 23 : 12,
  ry: props.isMobile ? 23 : 12,
  strokeWidth: props.isMobile ? 10 : 5,
}))`
  fill: ${props => props.fill || COLORS.palette.black};
  stroke: ${props => props.stroke || COLORS.gray[300]};
`;

const InvisibleHandle = styled(Point).attrs(props => ({
  rx: props.isMobile ? 40 : 25,
  ry: props.isMobile ? 40 : 25,
}))`
  fill: transparent;
  stroke: transparent;
`;

const ControlLine = styled.line`
  stroke: ${props => props.stroke || COLORS.gray[500]};
  stroke-width: 3;
`;

const VectorLine = styled.line`
  stroke: ${props => props.stroke || COLORS.gray[500]};
  stroke-width: 6;
`;

export default DerivBezier;