import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { COLORS } from '../constants/constants';
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
    strokeColor: COLORS.violet[500],
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
    let [p1, p2, p3, p4] = points;
    const curveType = typeof p4 !== 'undefined' ? 'cubic' : 'quadratic';

    // TODO: change 1000 constant to variable passed
    p1[1] = 1000 - p1[1];
    p2[1] = 1000 - p2[1];
    p3[1] = 1000 - p3[1];
    if (curveType === 'cubic') p4[1] = 1000 - p4[1];
    
    const A = lerp(p1, p2, t);
    const B = lerp(p2, p3, t);
    const C = lerp(A, B, t);

    //TODO: move this to constants
    const offset = [viewBoxWidth/2, -viewBoxHeight/2];

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
              markerWidth="6" markerHeight="6"
              orient="auto-start-reverse">
            <path d="M 0 1 L 5 5 L 0 9 z" />
          </marker>
        </defs>

        <ControlLine x1={p1[0] + offset[0]} y1={p1[1] + offset[1]} x2={p2[0] + offset[0]} y2={p2[1] + offset[1]} />
        <ControlLine x1={p2[0] + offset[0]} y1={p2[1] + offset[1]} x2={p3[0] + offset[0]} y2={p3[1] + offset[1]} />

        <path d={instructions} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/>
        <ControlPoint cx={A[0] + offset[0]} cy={A[1] + offset[1]} grabbable={false} isMobile={isMobile} />
        <ControlPoint cx={B[0] + offset[0]} cy={B[1] + offset[1]} grabbable={false} isMobile={isMobile} />
        <ControlLine x1={A[0] + offset[0]} y1={A[1] + offset[1]} x2={B[0] + offset[0]} y2={B[1] + offset[1]} />
        <ControlPoint cx={C[0] + offset[0]} cy={C[1] + offset[1]} grabbable={false} isMobile={isMobile} />

        <EndPoint
          cx={p1[0] + offset[0]}
          cy={p1[1] + offset[1]}
          grabbable={grabbable}
          isMobile={isMobile}
        />

        <EndPoint
          cx={p2[0] + offset[0]}
          cy={p2[1] + offset[1]}
          grabbable={grabbable}
          isMobile={isMobile}
        />

        <EndPoint
          cx={p3[0] + offset[0]}
          cy={p3[1] + offset[1]}
          grabbable={grabbable}
          isMobile={isMobile}
        />
        {/* TODO: make this origin point a constant */}
        <EndPoint
          cx={0 + offset[0]}
          cy={1000 + offset[1]}
          grabbable={false}
          isMobile={isMobile}
        />
        <VectorLine x1={0 + offset[0]} y1={1000 + offset[1]} 
          x2={C[0] + offset[0]} y2={C[1] + offset[1]}
          style={{ markerEnd:"url(#arrow)" }}
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
}) => (
  <g>
    <VisibleControlPoint
      cx={cx}
      cy={cy}
      grabbable={grabbable}
      isMobile={isMobile}
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
  rx: props.isMobile ? 40 : 15,
  ry: props.isMobile ? 40 : 15,
}))`
  fill: ${props => (props.grabbable ? COLORS.pink[500] : COLORS.violet[500])};
`;

const VisibleControlPoint = styled(Point).attrs(props => ({
  rx: props.isMobile ? 20 : 8,
  ry: props.isMobile ? 20 : 8,
}))`
  fill: white;
  stroke: ${props => (props.grabbable ? COLORS.pink[500] : COLORS.violet[500])};
  stroke-width: 3;
`;

const InvisibleHandle = styled(Point).attrs(props => ({
  rx: props.isMobile ? 40 : 25,
  ry: props.isMobile ? 40 : 25,
}))`
  fill: transparent;
  stroke: transparent;
`;

const ControlLine = styled.line`
  stroke: ${COLORS.gray[300]};
  stroke-dasharray: 5, 5;
  stroke-width: 2;
`;

const VectorLine = styled.line`
  stroke: ${COLORS.black};
  stroke-width: 6;
`;

export default QuadBezier;