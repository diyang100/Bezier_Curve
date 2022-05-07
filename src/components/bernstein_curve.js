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
    strokeColor: COLORS.white,
    strokeWidth: 6,
    grabbable: true,
  };

  pointDist = (x1, y1, x2, y2) => {
    return Math.sqrt(((y2 - y1) ** 2) + ((x2 - x1) ** 2));
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

    // TODO: save as constant
    const hideMarkerThreshold = 25; // unit is px

    // TODO: change 1000 constant to variable passed
    p1[1] = 1000 - p1[1];
    p2[1] = 1000 - p2[1];
    p3[1] = 1000 - p3[1];
    if (curveType === 'cubic') p4[1] = 1000 - p4[1];
    point_of_reference[1] = 1000 - point_of_reference[1];

    const instructions =
      `
        M ${p1[0]},${p1[1]}
        C ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]}
      `

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
              markerWidth="6" markerHeight="6" stroke={COLORS.palette.red} fill={COLORS.palette.red}
              orient="auto-start-reverse">
            <path d="M 0 1 L 5 5 L 0 9 z" />
          </marker>
          <marker id="arrow2" viewBox="0 0 10 10" refX="5" refY="5"
              markerWidth="6" markerHeight="6" stroke={COLORS.palette.yellow} fill={COLORS.palette.yellow}
              orient="auto-start-reverse">
            <path d="M 0 1 L 5 5 L 0 9 z"  />
          </marker>
          <marker id="arrow3" viewBox="0 0 10 10" refX="5" refY="5"
              markerWidth="6" markerHeight="6" stroke={COLORS.palette.green} fill={COLORS.palette.green}
              orient="auto-start-reverse">
            <path d="M 0 1 L 5 5 L 0 9 z" />
          </marker>
          <marker id="arrow4" viewBox="0 0 10 10" refX="5" refY="5"
              markerWidth="6" markerHeight="6" stroke={COLORS.palette.blue} fill={COLORS.palette.blue}
              orient="auto-start-reverse">
            <path d="M 0 1 L 5 5 L 0 9 z" />
          </marker>
        </defs>
        <ControlLine x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} />
        <ControlLine x1={p3[0]} y1={p3[1]} x2={p4[0]} y2={p4[1]} />
        <ControlLine x1={p2[0]} y1={p2[1]} x2={p3[0]} y2={p3[1]} />

        <path
          d={instructions}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        <EndPoint
          cx={p1[0]}
          cy={p1[1]}
          grabbable={false}
          isMobile={isMobile}
          stroke={COLORS.palette.red}
        />

        <EndPoint
          cx={p2[0]}
          cy={p2[1]}
          grabbable={false}
          isMobile={isMobile}
          stroke={COLORS.palette.yellow}
        />

        <EndPoint
          cx={p3[0]}
          cy={p3[1]}
          grabbable={false}
          isMobile={isMobile}
          stroke={COLORS.palette.green}
        />

        <EndPoint
          cx={p4[0]}
          cy={p4[1]}
          grabbable={false}
          isMobile={isMobile}
          stroke={COLORS.palette.blue}
        />

        {/* <ControlPoint cx={w1point[0]} cy={w1point[1]} grabbable={false} isMobile={isMobile}/>
        <ControlPoint cx={w2point[0]} cy={w2point[1]} grabbable={false} isMobile={isMobile}/>
        <ControlPoint cx={w3point[0]} cy={w3point[1]} grabbable={false} isMobile={isMobile}/>
        <ControlPoint cx={w4point[0]} cy={w4point[1]} grabbable={false} isMobile={isMobile}/> */}
        {/* TODO: hide arrows when line length is less than a threshold */}
        {
            (dependent) ? <>
                <ControlLineP1 x1={point_of_reference[0]} y1={point_of_reference[1]} 
                  x2={w1point[0]} y2={w1point[1]} 
                  style={(this.pointDist(point_of_reference[0], point_of_reference[1], w1point[0], w1point[1]) > hideMarkerThreshold) ? { markerEnd:"url(#arrow1)" } : {}} />
                <ControlLineP2 x1={w1point[0]} y1={w1point[1]} 
                  x2={w2point[0]} y2={w2point[1]} 
                  style={(this.pointDist(w1point[0], w1point[1], w2point[0], w2point[1]) > hideMarkerThreshold) ? { markerEnd:"url(#arrow2)" } : {}} />
                <ControlLineP3 x1={w2point[0]} y1={w2point[1]} 
                  x2={w3point[0]} y2={w3point[1]} 
                  style={(this.pointDist(w2point[0], w2point[1], w3point[0], w3point[1]) > hideMarkerThreshold) ? { markerEnd:"url(#arrow3)" } : {}} />
                <ControlLineP4 x1={w3point[0]} y1={w3point[1]} 
                  x2={w4point[0]} y2={w4point[1]} 
                  style={(this.pointDist(w3point[0], w3point[1], w4point[0], w4point[1]) > hideMarkerThreshold) ? { markerEnd:"url(#arrow4)" } : {}} />
            </>
            : <>
                <ControlLineP1 x1={point_of_reference[0]} y1={point_of_reference[1]} 
                  x2={w1point[0]} y2={w1point[1]} 
                  style={{ markerEnd:"url(#arrow1)" }} />
                <ControlLineP2 x1={point_of_reference[0]} y1={point_of_reference[1]} 
                  x2={w2point[0]} y2={w2point[1]} 
                  style={{ markerEnd:"url(#arrow2)" }} />
                <ControlLineP3 x1={point_of_reference[0]} y1={point_of_reference[1]} 
                  x2={w3point[0]} y2={w3point[1]} 
                  style={{ markerEnd:"url(#arrow3)" }} />
                <ControlLineP4 x1={point_of_reference[0]} y1={point_of_reference[1]} 
                  x2={w4point[0]} y2={w4point[1]} 
                  style={{ markerEnd:"url(#arrow4)" }} />
            </>
        }
        
        <EndPoint
          cx={point_of_reference[0]}
          cy={point_of_reference[1]}
          grabbable={false}
          isMobile={isMobile}
          stroke={COLORS.white}
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