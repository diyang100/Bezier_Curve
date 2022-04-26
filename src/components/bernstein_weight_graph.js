import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { COLORS, BREAKPOINT_SIZES, IS_MOBILE_USER_AGENT } from '../constants/constants';
import { p1weight, p2weight, p3weight, p4weight } from '../constants/constants';
import './bezier.css';
import ProgressBar from './progress_bar';

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

class BernsteinWeightGraph extends PureComponent {

  static propTypes = {
    viewBoxWidth: PropTypes.number,
    viewBoxHeight: PropTypes.number,
    strokeColor: PropTypes.string,
    strokeWidth: PropTypes.number,
    t: PropTypes.number,
    
  };

  static defaultProps = {
    viewBoxWidth: 1000,
    viewBoxHeight: 1000,
    strokeColor: COLORS.violet[500],
    strokeWidth: 6,
    grabbable: false,
  };

  render() {
    const {
      viewBoxWidth,
      viewBoxHeight,
      strokeColor,
      strokeWidth,
      t,
    } = this.props;

    // const instructions =
    //   curveType === 'cubic'
    //     ? `
    //         M ${p1[0]},${p1[1]}
    //         C ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]}
    //       `
    //     : `
    //         M ${p1[0]},${p1[1]}
    //         Q ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}
    //       `;
    const stepSize = 0.001;
    let p1Line = "M 0 0 ";
    let p2Line = "M 0 1000 ";
    let p3Line = "M 0 1000 ";
    let p4Line = "M 0 1000 ";
    for (let i = 0.0; i <= 1; i += stepSize) {
      p1Line += "L " + (i.toFixed(5) * 1000).toString() + " " + (1000 - p1weight(i) * 1000).toFixed(5).toString();
      p2Line += "L " + (i.toFixed(5) * 1000).toString() + " " + (1000 - p2weight(i) * 1000).toFixed(5).toString();
      p3Line += "L " + (i.toFixed(5) * 1000).toString() + " " + (1000 - p3weight(i) * 1000).toFixed(5).toString();
      p4Line += "L " + (i.toFixed(5) * 1000).toString() + " " + (1000 - p4weight(i) * 1000).toFixed(5).toString();
    }

    const p1 = [(t.toFixed(5) * 1000), (1000 - p1weight(t) * 1000).toFixed(5)];
    const p2 = [(t.toFixed(5) * 1000), (1000 - p2weight(t) * 1000).toFixed(5)];
    const p3 = [(t.toFixed(5) * 1000), (1000 - p3weight(t) * 1000).toFixed(5)];
    const p4 = [(t.toFixed(5) * 1000), (1000 - p4weight(t) * 1000).toFixed(5)];

    const isMobile = getDeviceType() === 'mobile';

    return (
      <div className="wrapper">
        <div className="bezier-wrapper">
          <Svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            ref={node => (this.node = node)}
          >
            <path d={p1Line} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={p2Line} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={p3Line} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={p4Line} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <EndPoint cx={p1[0]} cy={p1[1]} grabbable={false} sMobile={isMobile} />
            <EndPoint cx={p2[0]} cy={p2[1]} grabbable={false} sMobile={isMobile} />
            <EndPoint cx={p3[0]} cy={p3[1]} grabbable={false} sMobile={isMobile} />
            <EndPoint cx={p4[0]} cy={p4[1]} grabbable={false} sMobile={isMobile} />
          </Svg>
        </div>
        <div>
          <ProgressBar percent={p1weight(t)}/>
          <ProgressBar percent={p2weight(t)}/>
          <ProgressBar percent={p3weight(t)}/>
          <ProgressBar percent={p4weight(t)}/>
        </div>
      </div>
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

export default BernsteinWeightGraph;