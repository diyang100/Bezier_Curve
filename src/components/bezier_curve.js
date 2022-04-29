import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { COLORS } from '../constants/constants';
import { lerp } from '../constants/constants';
import { getDeviceType } from '../constants/constants';

class Bezier extends PureComponent {
  state = {
    draggingPointId: null,
    selectedLine: -1,
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
    strokeWidth: 10,
    grabbable: true,
  };

  handleSelectPoint = pointId => () => {
    if (this.props.grabbable) this.setState({ draggingPointId: pointId });
  };

  handleSelectLine = lineId => () => {
    console.log(lineId);
    this.setState({ selectedLine: lineId });
  };

  handleRelease = () => {
    this.setState({ draggingPointId: null });
  };

  handleDrag = ev => {
    // This event handles both mouseMove and touchMove.
    let x, y;
    if (ev.touches) {
      ev.preventDefault();
      const touch = ev.touches[0];
      [x, y] = [touch.clientX, touch.clientY];
    } else {
      [x, y] = [ev.clientX, ev.clientY];
    }

    const { viewBoxWidth, viewBoxHeight, updatePoint, grabbable } = this.props;
    const { draggingPointId } = this.state;

    if (!draggingPointId || !grabbable || !updatePoint) {
      return;
    }

    const svgBB = this.node.getBoundingClientRect();
    const positionRelativeToSvg = [x - svgBB.left, y - svgBB.top];

    const positionWithinViewBox = [
      (positionRelativeToSvg[0] * viewBoxWidth) / svgBB.width,
      (positionRelativeToSvg[1] * viewBoxHeight) / svgBB.height,
    ];
    // TODO: change 1000 constant to variable passed
    positionWithinViewBox[1] = 1000 - positionWithinViewBox[1];
    // console.log(positionWithinViewBox);
    if (positionRelativeToSvg[0] < 0 
        || positionRelativeToSvg[0] > svgBB.width 
        || positionRelativeToSvg[1] < 0 
        || positionRelativeToSvg[1] > svgBB.height) return;

    updatePoint(draggingPointId, positionWithinViewBox);
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

    const instructions =
      `
        M ${p1[0]},${p1[1]}
        C ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]}
      `

    const isMobile = getDeviceType() === 'mobile';

    const A = lerp(p1, p2, t);
    const B = lerp(p2, p3, t);
    const C = ((curveType === 'cubic') ? lerp(p3, p4, t) : lerp(p2, p3, t));
    const D = lerp(A, B, t);
    const E = lerp(B, C, t);
    const P = lerp(D, E, t);

    return (
      <Svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        ref={node => (this.node = node)}
        onMouseMove={this.handleDrag}
        onTouchMove={this.handleDrag}
        onMouseUp={this.handleRelease}
        onTouchEnd={this.handleRelease}
      >
        <ControlLine x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} />
        <ControlLine x1={p3[0]} y1={p3[1]} x2={p4[0]} y2={p4[1]} />
        <ControlLine x1={p2[0]} y1={p2[1]} x2={p3[0]} y2={p3[1]} />

        <g onClick={this.handleSelectLine(1)}>
          <path
            d={instructions}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            // onMouseDown={console.log(0)}
            // onTouchStart={console.log(1)}
          />
        </g>
        {/* <g onClick={this.handleSelectLine(2)}>
          <path
            d={"M 200 200 L 200 400 "}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            // onMouseDown={console.log(1)}
            // onTouchStart={console.log(1)}
          />
        </g> */}
        <ControlPoint cx={A[0]} cy={A[1]} grabbable={false} isMobile={isMobile} />
        <ControlPoint cx={B[0]} cy={B[1]} grabbable={false} isMobile={isMobile} />
        <ControlPoint cx={C[0]} cy={C[1]} grabbable={false} isMobile={isMobile} />
        <ControlLine x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} />
        <ControlLine x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} />
        <ControlPoint cx={D[0]} cy={D[1]} grabbable={false} isMobile={isMobile} />
        <ControlPoint cx={E[0]} cy={E[1]} grabbable={false} isMobile={isMobile} />
        <ControlLine x1={D[0]} y1={D[1]} x2={E[0]} y2={E[1]} />
        <ControlPoint cx={P[0]} cy={P[1]} grabbable={false} isMobile={isMobile} />

        <EndPoint cx={p1[0]} cy={p1[1]}
          onMouseDown={this.handleSelectPoint('p1')}
          onTouchStart={this.handleSelectPoint('p1')}
          grabbable={grabbable} isMobile={isMobile}
        />

        <EndPoint cx={p2[0]} cy={p2[1]}
          onMouseDown={this.handleSelectPoint('p2')}
          onTouchStart={this.handleSelectPoint('p2')}
          grabbable={grabbable} isMobile={isMobile}
        />

        <EndPoint cx={p3[0]} cy={p3[1]}
          onMouseDown={this.handleSelectPoint('p3')}
          onTouchStart={this.handleSelectPoint('p3')}
          grabbable={grabbable}isMobile={isMobile}
        />

        <EndPoint cx={p4[0]} cy={p4[1]}
          onMouseDown={this.handleSelectPoint('p4')}
          onTouchStart={this.handleSelectPoint('p4')}
          grabbable={grabbable} isMobile={isMobile}
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

export default Bezier;