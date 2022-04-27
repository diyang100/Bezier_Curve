import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { COLORS, BREAKPOINT_SIZES, IS_MOBILE_USER_AGENT } from '../constants/constants';
import { lerp } from '../constants/constants';
import { p1weight, p2weight, p3weight, p4weight } from '../constants/constants';

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

class BernsteinBezier extends PureComponent {
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
    dependent: PropTypes.bool,
  };

  static defaultProps = {
    viewBoxWidth: 100,
    viewBoxHeight: 100,
    strokeColor: COLORS.black,
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
      dependent,
    } = this.props;
    const [p1, p2, p3, p4, origin] = points;

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
    // let dependent = true;
    let w1point = lerp(origin, p1, p1weight(t));
    let w2point = lerp(origin, p2, p2weight(t));
    let w3point = lerp(origin, p3, p3weight(t));
    let w4point = lerp(origin, p4, p4weight(t));

    if (dependent) {
        const w1pointoffset = [w1point[0]-origin[0], w1point[1]-origin[1]];
        const w2pointoffset = [w2point[0]-origin[0], w2point[1]-origin[1]];
        const w3pointoffset = [w3point[0]-origin[0], w3point[1]-origin[1]];
        w2point[0] += w1pointoffset[0]
        w2point[1] += w1pointoffset[1]

        w3point[0] += w1pointoffset[0] + w2pointoffset[0]
        w3point[1] += w1pointoffset[1] + w2pointoffset[1]

        w4point[0] += w1pointoffset[0] + w2pointoffset[0] + w3pointoffset[0]
        w4point[1] += w1pointoffset[1] + w2pointoffset[1] + w3pointoffset[1]
    }

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

        
        <ControlPoint cx={w1point[0]} cy={w1point[1]} grabbable={false} isMobile={isMobile}/>
        <ControlPoint cx={w2point[0]} cy={w2point[1]} grabbable={false} isMobile={isMobile}/>
        <ControlPoint cx={w3point[0]} cy={w3point[1]} grabbable={false} isMobile={isMobile}/>
        <ControlPoint cx={w4point[0]} cy={w4point[1]} grabbable={false} isMobile={isMobile}/>
        {
            (dependent) ? <>
                <ControlLineP1 x1={origin[0]} y1={origin[1]} x2={w1point[0]} y2={w1point[1]} />
                <ControlLineP2 x1={w1point[0]} y1={w1point[1]} x2={w2point[0]} y2={w2point[1]} />
                <ControlLineP3 x1={w2point[0]} y1={w2point[1]} x2={w3point[0]} y2={w3point[1]} />
                <ControlLineP4 x1={w3point[0]} y1={w3point[1]} x2={w4point[0]} y2={w4point[1]} />
            </>
            : <>
                <ControlLineP1 x1={origin[0]} y1={origin[1]} x2={w1point[0]} y2={w1point[1]} />
                <ControlLineP2 x1={origin[0]} y1={origin[1]} x2={w2point[0]} y2={w2point[1]} />
                <ControlLineP3 x1={origin[0]} y1={origin[1]} x2={w3point[0]} y2={w3point[1]} />
                <ControlLineP4 x1={origin[0]} y1={origin[1]} x2={w4point[0]} y2={w4point[1]} />
            </>
        }
        
        <EndPoint
          cx={origin[0]}
          cy={origin[1]}
          onMouseDown={this.handleSelectPoint('origin')}
          onTouchStart={this.handleSelectPoint('origin')}
          grabbable={grabbable}
          isMobile={isMobile}
        />

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
const ControlLineP1 = styled.line`
  stroke: ${"#ff0000"};
//   stroke-dasharray: 5, 5;
  stroke-width: 6;
`;
const ControlLineP2 = styled.line`
  stroke: ${"#ffff00"};
//   stroke-dasharray: 5, 5;
  stroke-width: 6;
`;
const ControlLineP3 = styled.line`
  stroke: ${"#00ff00"};
//   stroke-dasharray: 5, 5;
  stroke-width: 6;
`;
const ControlLineP4 = styled.line`
  stroke: ${"#00ccff"};
//   stroke-dasharray: 5, 5;
  stroke-width: 6;
`;

export default BernsteinBezier;