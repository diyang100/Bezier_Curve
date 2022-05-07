import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { COLORS } from '../constants/constants';
import { p1weight, p2weight, p3weight, p4weight } from '../constants/constants';
import { getDeviceType } from '../constants/constants';
import ProgressBar from './progress_bar';

class BernsteinWeightGraph extends PureComponent {

  static propTypes = {
    viewBoxWidth: PropTypes.number,
    viewBoxHeight: PropTypes.number,
    strokeWidth: PropTypes.number,
    t: PropTypes.number,
    
  };

  static defaultProps = {
    viewBoxWidth: 1000,
    viewBoxHeight: 1000,
    strokeWidth: 6,
    grabbable: false,
  };

  render() {
    const {
      viewBoxWidth,
      viewBoxHeight,
      strokeWidth,
      t,
    } = this.props;
    
    // TODO: change 0.001 constant to constants file
    const stepSize = 0.001;
    if (viewBoxWidth !== viewBoxHeight) throw new Error("Bernstein dimensions not square");
    const size = viewBoxWidth * 0.8;
    const axisLength = viewBoxWidth * 0.1;
    let p1Line = `M ${axisLength} ${axisLength} `;
    let p2Line = `M ${axisLength} ${size} `;
    let p3Line = `M ${axisLength} ${size} `;
    let p4Line = `M ${axisLength} ${size} `;
    for (let i = 0.0; i <= 1; i += stepSize) {
      p1Line += "L " + (i.toFixed(5) * size + axisLength).toString() + " " + (size - p1weight(i) * size + axisLength).toFixed(5).toString();
      p2Line += "L " + (i.toFixed(5) * size + axisLength).toString() + " " + (size - p2weight(i) * size + axisLength).toFixed(5).toString();
      p3Line += "L " + (i.toFixed(5) * size + axisLength).toString() + " " + (size - p3weight(i) * size + axisLength).toFixed(5).toString();
      p4Line += "L " + (i.toFixed(5) * size + axisLength).toString() + " " + (size - p4weight(i) * size + axisLength).toFixed(5).toString();
    }

    const p1 = [(t.toFixed(5) * size + axisLength), (size - p1weight(t) * size + axisLength).toFixed(5)];
    const p2 = [(t.toFixed(5) * size + axisLength), (size - p2weight(t) * size + axisLength).toFixed(5)];
    const p3 = [(t.toFixed(5) * size + axisLength), (size - p3weight(t) * size + axisLength).toFixed(5)];
    const p4 = [(t.toFixed(5) * size + axisLength), (size - p4weight(t) * size + axisLength).toFixed(5)];

    const isMobile = getDeviceType() === 'mobile';

    return (
      <>
        <Svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          ref={node => (this.node = node)}
        >
          <path d={p1Line} fill="none" stroke={COLORS.palette.red}    strokeWidth={strokeWidth} />
          <path d={p2Line} fill="none" stroke={COLORS.palette.yellow} strokeWidth={strokeWidth} />
          <path d={p3Line} fill="none" stroke={COLORS.palette.green}  strokeWidth={strokeWidth} />
          <path d={p4Line} fill="none" stroke={COLORS.palette.blue}   strokeWidth={strokeWidth} />
          <path d={`M ${(t.toFixed(5) * size + axisLength)} ${axisLength} V ${size + axisLength}`}  fill="none" stroke={COLORS.gray[500]} strokeWidth={strokeWidth}/>

          {/* Y Axis */}
          <g>
            <AxisLine x1={axisLength} y1={size + axisLength} x2={axisLength} y2={axisLength}></AxisLine>
            <AxisHeaders x={axisLength * 0.7} y={size * 0.5 + axisLength} axis='y'> w </AxisHeaders>
            <AxisLabelText x={axisLength * 0.7} y={size * 1 + axisLength} axis='y'> 0 </AxisLabelText>
            <AxisLabelText x={axisLength * 0.7} y={size * 0 + axisLength} axis='y'> 1 </AxisLabelText>
            <AxisLine x1={size + axisLength} y1={size + axisLength} x2={size + axisLength} y2={axisLength}></AxisLine>
          </g>
          {/* X axis */}
          <g>
            <AxisLine x1={axisLength} y1={size + axisLength} x2={size + axisLength} y2={size + axisLength}></AxisLine>
            <AxisHeaders x={size * 0.5 + axisLength} y={size + axisLength * 1.5} axis='x'> t </AxisHeaders>
            <AxisLabelText x={size * 0 + axisLength} y={size + axisLength * 1.5} axis='x'> 0 </AxisLabelText>
            <AxisLabelText x={size * 1 + axisLength} y={size + axisLength * 1.5} axis='x'> 1 </AxisLabelText>
            <AxisLine x1={size + axisLength} y1={size + axisLength} x2={size + axisLength} y2={axisLength}></AxisLine>
            <AxisLine x1={axisLength} y1={axisLength} x2={size + axisLength} y2={axisLength}></AxisLine>
          </g>
          <ControlPoint fill={COLORS.palette.red}    cx={p1[0]} cy={p1[1]} grabbable={false} sMobile={isMobile} />
          <ControlPoint fill={COLORS.palette.yellow} cx={p2[0]} cy={p2[1]} grabbable={false} sMobile={isMobile} />
          <ControlPoint fill={COLORS.palette.green}  cx={p3[0]} cy={p3[1]} grabbable={false} sMobile={isMobile} />
          <ControlPoint fill={COLORS.palette.blue}   cx={p4[0]} cy={p4[1]} grabbable={false} sMobile={isMobile} />
          
        </Svg>
        <WeightProgressBarWrapper>
          <ProgressBar backgroundColor={COLORS.palette.red}    percent={p1weight(t)}/>
          <ProgressBar backgroundColor={COLORS.palette.yellow} percent={p2weight(t)}/>
          <ProgressBar backgroundColor={COLORS.palette.green}  percent={p3weight(t)}/>
          <ProgressBar backgroundColor={COLORS.palette.blue}   percent={p4weight(t)}/>
        </WeightProgressBarWrapper>
      </>
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
  stroke,
  fill,
}) => (
  <g>
    <VisibleControlPoint
      cx={cx}
      cy={cy}
      grabbable={grabbable}
      isMobile={isMobile}
      stroke={stroke}
      fill={fill}
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

const VisibleControlPoint = styled(Point).attrs(props => ({
  rx: props.isMobile ? 20 : 15,
  ry: props.isMobile ? 20 : 15,
}))`
  fill: ${props => props.fill};
`;

const InvisibleHandle = styled(Point).attrs(props => ({
  rx: props.isMobile ? 40 : 25,
  ry: props.isMobile ? 40 : 25,
}))`
  fill: transparent;
  stroke: transparent;
`;

const AxisLine = styled.line`
  stroke: ${COLORS.gray[100]};
  stroke-width: 6;
`;

const AxisHeaders = styled.text`
  fill: ${COLORS.white};
  font-size: 40px;
  font-weight: bold;
  text-anchor: ${(props) => (props.axis === 'y') ? 'end' : 'middle' };
`
const AxisLabelText = styled.text`
  fill: ${COLORS.white};
  font-size: 30px;
  font-weight: bold;
  text-anchor: ${(props) => (props.axis === 'y') ? 'end' : 'middle'};
`

const WeightProgressBarWrapper = styled.div`
  padding: 10px;
  color: ${COLORS.white};
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export default BernsteinWeightGraph;