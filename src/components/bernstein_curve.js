import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { COLORS } from '../constants/constants';
import { lerp } from '../constants/constants';
import { p1weight, p2weight, p3weight, p4weight } from '../constants/constants';
import { getDeviceType } from '../constants/constants';

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

    // TODO: change 1000 constant to variable passed
    positionWithinViewBox[1] = 1000 - positionWithinViewBox[1];
    // console.log(positionWithinViewBox);

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
    const [p1, p2, p3, p4, point_of_reference] = points;

    const curveType = typeof p4 !== 'undefined' ? 'cubic' : 'quadratic';

    // TODO: change 1000 constant to variable passed
    p1[1] = 1000 - p1[1];
    p2[1] = 1000 - p2[1];
    p3[1] = 1000 - p3[1];
    if (curveType === 'cubic') p4[1] = 1000 - p4[1];
    point_of_reference[1] = 1000 - point_of_reference[1];

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
    let w1point = lerp(point_of_reference, p1, p1weight(t));
    let w2point = lerp(point_of_reference, p2, p2weight(t));
    let w3point = lerp(point_of_reference, p3, p3weight(t));
    let w4point = lerp(point_of_reference, p4, p4weight(t));

    if (dependent) {
        const w1pointoffset = [w1point[0]-point_of_reference[0], w1point[1]-point_of_reference[1]];
        const w2pointoffset = [w2point[0]-point_of_reference[0], w2point[1]-point_of_reference[1]];
        const w3pointoffset = [w3point[0]-point_of_reference[0], w3point[1]-point_of_reference[1]];
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
        <defs>
          <marker id="arrow1" viewBox="0 0 10 10" refX="5" refY="5"
              markerWidth="6" markerHeight="6" stroke={"#ff0000"} fill={"#ff0000"}
              orient="auto-start-reverse">
            <path d="M 0 1 L 5 5 L 0 9 z" />
          </marker>
          <marker id="arrow2" viewBox="0 0 10 10" refX="5" refY="5"
              markerWidth="6" markerHeight="6" stroke={"#ffff00"} fill={"#ffff00"}
              orient="auto-start-reverse">
            <path d="M 0 1 L 5 5 L 0 9 z"  />
          </marker>
          <marker id="arrow3" viewBox="0 0 10 10" refX="5" refY="5"
              markerWidth="6" markerHeight="6" stroke={"#00ff00"} fill={"#00ff00"}
              orient="auto-start-reverse">
            <path d="M 0 1 L 5 5 L 0 9 z" />
          </marker>
          <marker id="arrow4" viewBox="0 0 10 10" refX="5" refY="5"
              markerWidth="6" markerHeight="6" stroke={"#00ccff"} fill={"#00ccff"}
              orient="auto-start-reverse">
            <path d="M 0 1 L 5 5 L 0 9 z" />
          </marker>
        </defs>
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

        
        {/* <ControlPoint cx={w1point[0]} cy={w1point[1]} grabbable={false} isMobile={isMobile}/>
        <ControlPoint cx={w2point[0]} cy={w2point[1]} grabbable={false} isMobile={isMobile}/>
        <ControlPoint cx={w3point[0]} cy={w3point[1]} grabbable={false} isMobile={isMobile}/>
        <ControlPoint cx={w4point[0]} cy={w4point[1]} grabbable={false} isMobile={isMobile}/> */}
        {
            (dependent) ? <>
                <ControlLineP1 x1={point_of_reference[0]} y1={point_of_reference[1]} x2={w1point[0]} y2={w1point[1]} style={{ markerEnd:"url(#arrow1)" }} />
                <ControlLineP2 x1={w1point[0]} y1={w1point[1]} x2={w2point[0]} y2={w2point[1]} style={{ markerEnd:"url(#arrow2)" }} />
                <ControlLineP3 x1={w2point[0]} y1={w2point[1]} x2={w3point[0]} y2={w3point[1]} style={{ markerEnd:"url(#arrow3)" }} />
                <ControlLineP4 x1={w3point[0]} y1={w3point[1]} x2={w4point[0]} y2={w4point[1]} style={{ markerEnd:"url(#arrow4)" }} />
            </>
            : <>
                <ControlLineP1 x1={point_of_reference[0]} y1={point_of_reference[1]} x2={w1point[0]} y2={w1point[1]} style={{ markerEnd:"url(#arrow1)" }} />
                <ControlLineP2 x1={point_of_reference[0]} y1={point_of_reference[1]} x2={w2point[0]} y2={w2point[1]} style={{ markerEnd:"url(#arrow2)" }} />
                <ControlLineP3 x1={point_of_reference[0]} y1={point_of_reference[1]} x2={w3point[0]} y2={w3point[1]} style={{ markerEnd:"url(#arrow3)" }} />
                <ControlLineP4 x1={point_of_reference[0]} y1={point_of_reference[1]} x2={w4point[0]} y2={w4point[1]} style={{ markerEnd:"url(#arrow4)" }} />
            </>
        }
        
        <EndPoint
          cx={point_of_reference[0]}
          cy={point_of_reference[1]}
          onMouseDown={this.handleSelectPoint('point_of_reference')}
          onTouchStart={this.handleSelectPoint('point_of_reference')}
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

// TODO: fix colours to constant file
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