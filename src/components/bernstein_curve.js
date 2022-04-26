import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { COLORS, BREAKPOINT_SIZES, IS_MOBILE_USER_AGENT } from '../constants/constants';

const getBreakpointFor = windowWidth =>
  Object.keys(BREAKPOINT_SIZES).find(
    name => windowWidth <= BREAKPOINT_SIZES[name]
  ) || 'xl';
  
const getDeviceType = breakpoint => {
    if (typeof window === 'undefined') {
        return 'desktop';
    }

    if (!breakpoint) {
        breakpoint = getBreakpointFor(window.innerWidth);
    }

    if (breakpoint === 'xs' || breakpoint === 'sm' || IS_MOBILE_USER_AGENT) {
        return 'mobile';
    } else {
        return 'desktop';
    }
};

class Bezier extends PureComponent {
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
    grabbable: true,
  };

  handleSelectPoint = pointId => () => {
    if (this.props.grabbable) {
      // TODO: Get distance from point center, so that clicking and dragging a
      // new point doesn't center it on the cursor.
      this.setState({ draggingPointId: pointId });
    }
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
    console.log(positionWithinViewBox);
    if (positionRelativeToSvg[0] < 0 
        || positionRelativeToSvg[0] > svgBB.width 
        || positionRelativeToSvg[1] < 0 
        || positionRelativeToSvg[1] > svgBB.height) return;

    updatePoint(draggingPointId, positionWithinViewBox);
  };

  lerp = (p1, p2, t) => {
      return [(1-t)*p1[0] + t*p2[0], (1-t)*p1[1] + t*p2[1]];
  }

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
    const [p1, p2, p3, p4] = points;

    const curveType = typeof p4 !== 'undefined' ? 'cubic' : 'quadratic';

    const instructions =
      curveType === 'cubic'
        ? `
            M ${p1[0]},${p1[1]}
            C ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]}
          `
        : `
            M ${p1[0]},${p1[1]}
            Q ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}
          `;

    const lastPoint = curveType === 'cubic' ? p4 : p3;
    const lastPointId = curveType === 'cubic' ? 'p4' : 'p3';

    const isMobile = getDeviceType() === 'mobile';

    
    const A = this.lerp(p1, p2, t);
    const B = this.lerp(p2, p3, t);
    const C = ((curveType === 'cubic') ? this.lerp(p3, p4, t) : this.lerp(p2, p3, t));
    const D = this.lerp(A, B, t);
    const E = this.lerp(B, C, t);
    const P = this.lerp(D, E, t);
    console.log([A, B, C, D, E, P]);

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
        {curveType === 'quadratic' && (
          <ControlLine x1={p2[0]} y1={p2[1]} x2={p3[0]} y2={p3[1]} />
        )}
        {curveType === 'cubic' && (<>
            <ControlLine x1={p3[0]} y1={p3[1]} x2={p4[0]} y2={p4[1]} />
            <ControlLine x1={p2[0]} y1={p2[1]} x2={p3[0]} y2={p3[1]} />
        </>)}

        <path
          d={instructions}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {curveType === 'cubic' && (<>
            <ControlPoint cx={A[0]} cy={A[1]} grabbable={false} isMobile={isMobile} />
            <ControlPoint cx={B[0]} cy={B[1]} grabbable={false} isMobile={isMobile} />
            <ControlPoint cx={C[0]} cy={C[1]} grabbable={false} isMobile={isMobile} />
            <ControlLine x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} />
            <ControlLine x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} />
            <ControlPoint cx={D[0]} cy={D[1]} grabbable={false} isMobile={isMobile} />
            <ControlPoint cx={E[0]} cy={E[1]} grabbable={false} isMobile={isMobile} />
            <ControlLine x1={D[0]} y1={D[1]} x2={E[0]} y2={E[1]} />
            <ControlPoint cx={P[0]} cy={P[1]} grabbable={false} isMobile={isMobile} />
        </>)}

        {curveType === 'quadratic' && (<>
            <ControlPoint cx={A[0]} cy={A[1]} grabbable={false} isMobile={isMobile} />
            <ControlPoint cx={B[0]} cy={B[1]} grabbable={false} isMobile={isMobile} />
            <ControlLine x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} />
            <ControlPoint cx={D[0]} cy={D[1]} grabbable={false} isMobile={isMobile} />
        </>)}

        <EndPoint
          cx={p1[0]}
          cy={p1[1]}
          onMouseDown={this.handleSelectPoint('p1')}
          onTouchStart={this.handleSelectPoint('p1')}
          grabbable={grabbable}
          isMobile={isMobile}
        />

        <EndPoint
          cx={p2[0]}
          cy={p2[1]}
          onMouseDown={this.handleSelectPoint('p2')}
          onTouchStart={this.handleSelectPoint('p2')}
          grabbable={grabbable}
          isMobile={isMobile}
        />

        {curveType === 'cubic' && (
          <EndPoint
            cx={p3[0]}
            cy={p3[1]}
            onMouseDown={this.handleSelectPoint('p3')}
            onTouchStart={this.handleSelectPoint('p3')}
            grabbable={grabbable}
            isMobile={isMobile}
          />
        )}

        <EndPoint
          cx={lastPoint[0]}
          cy={lastPoint[1]}
          onMouseDown={this.handleSelectPoint(lastPointId)}
          onTouchStart={this.handleSelectPoint(lastPointId)}
          grabbable={grabbable}
          isMobile={isMobile}
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