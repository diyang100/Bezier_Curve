import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { COLORS, scaleColor } from '../constants/constants';
import { lerp } from '../constants/constants';
import { getDeviceType } from '../constants/constants';

class QuadBezier extends PureComponent {
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

  render() {
    const {
      points,
      viewBoxWidth,
      viewBoxHeight,
      strokeColor,
      strokeWidth,
      grabbable,
      t,
    } = this.props;
    let [p1, p2, p3, origin] = points;
    //TODO: store size in constants
    const size = 0.9;
    const axisSpace = 0.05;

    // TODO: change 1000 constant to variable passed
    p1[0] *= size;
    p2[0] *= size;
    p3[0] *= size;
    origin[0] *= size;

    p1[1] = 1000 - p1[1] * size;
    p2[1] = 1000 - p2[1] * size;
    p3[1] = 1000 - p3[1] * size;
    origin[1] = 1000 - origin[1] * size;
    
    const A = lerp(p1, p2, t);
    const B = lerp(p2, p3, t);
    const C = lerp(A, B, t);

    //TODO: remove offset
    // const offset = [viewBoxWidth/2, -viewBoxHeight/2];
    const offset = [0, 0];
    

    const instructions =
        `
            M ${p1[0] + offset[0]},${p1[1] + offset[1]}
            Q ${p2[0] + offset[0]},${p2[1] + offset[1]} ${p3[0] + offset[0]},${p3[1] + offset[1]}
        `;

    const isMobile = getDeviceType() === 'mobile';

    return (
      <Svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        ref={node => (this.node = node)}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" 
              stroke={COLORS.palette.orange} fill={COLORS.palette.orange}
              markerWidth="6" markerHeight="6"
              orient="auto-start-reverse">
            <path d="M 0 1 L 5 5 L 0 9 z" />
          </marker>
        </defs>

        <path d={instructions} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/>
        
        <g> {/* both axis */}
          <path d={`M ${(origin[0].toFixed(5))} 0 V 1000`}  fill="none" stroke="#aaaaaa" strokeWidth={strokeWidth}/>
          <path d={`M 0 ${(origin[1].toFixed(5))} H 1000`}  fill="none" stroke="#aaaaaa" strokeWidth={strokeWidth}/>
          <AxisLabelText x={origin[0] + offset[0]} y={origin[1] + offset[1] + 30} axis='y'> (0,0) </AxisLabelText>
          <AxisLabelText x={origin[0] + offset[0] + 30} y={origin[1] + offset[1] + 30} axis='x'> x </AxisLabelText>
          <AxisLabelText x={origin[0] + offset[0]} y={origin[1] + offset[1] + 30} axis='y'> y </AxisLabelText>
        </g>
                
        {/* <ControlLine x1={A[0] + offset[0]} y1={A[1] + offset[1]} x2={B[0] + offset[0]} y2={B[1] + offset[1]} stroke={COLORS.gray[500]}/> */}
        <ControlLine x1={p1[0] + offset[0]} y1={p1[1] + offset[1]} 
          x2={p2[0] + offset[0]} y2={p2[1] + offset[1]} 
          stroke={COLORS.gray[500]}
        />
        <ControlLine x1={p2[0] + offset[0]} y1={p2[1] + offset[1]} 
          x2={p3[0] + offset[0]} y2={p3[1] + offset[1]} 
          stroke={COLORS.gray[500]}
        />

        {/* <ControlPoint cx={A[0] + offset[0]} cy={A[1] + offset[1]} grabbable={false} isMobile={isMobile} stroke={COLORS.gray[500]}/>
        <ControlPoint cx={B[0] + offset[0]} cy={B[1] + offset[1]} grabbable={false} isMobile={isMobile} stroke={COLORS.gray[500]}/>
        <ControlPoint cx={C[0] + offset[0]} cy={C[1] + offset[1]} grabbable={false} isMobile={isMobile} stroke={COLORS.palette.cyan}/> */}
        

        <EndPoint
          cx={p2[0] + offset[0]} cy={p2[1] + offset[1]}
          grabbable={grabbable} isMobile={isMobile}
          stroke={COLORS.palette.cyan}
        />

        <EndPoint
          cx={p1[0] + offset[0]} cy={p1[1] + offset[1]}
          grabbable={grabbable} isMobile={isMobile}
          stroke={COLORS.palette.cyan}
        />

        <EndPoint
          cx={p3[0] + offset[0]} cy={p3[1] + offset[1]}
          grabbable={grabbable} isMobile={isMobile}
          stroke={COLORS.palette.cyan}
        />
        <VectorLine 
          x1={origin[0] + offset[0]} y1={origin[1] + offset[1]} 
          x2={C[0] + offset[0]} y2={C[1] + offset[1]}
          stroke={COLORS.palette.orange}
          style={{ markerEnd:"url(#arrow)" }}
        />
        {/* TODO: make this origin point a constant */}
        <EndPoint
          cx={origin[0] + offset[0]}
          cy={origin[1] + offset[1]}
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
  fill: ${props => props.fill || COLORS.palette.black};
  stroke: ${props => props.stroke || COLORS.white};
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

const AxisLabelText = styled.text`
  fill: ${COLORS.white};
  font-size: 30px;
  font-weight: bold;
  ${(props) => (props.axis === 'y') ? 'text-anchor: end;' : ''}
`

const VectorLine = styled.line`
  stroke: ${props => props.stroke || COLORS.white};
  stroke-width: 6;
`;

export default QuadBezier;