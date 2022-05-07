import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { COLORS } from '../constants/constants';
import { lerp } from '../constants/constants';
import { getDeviceType } from '../constants/constants';

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
    handleSelectCurve: PropTypes.func,
    selectedCurve: PropTypes.number,
    t: PropTypes.number,
  };

  static defaultProps = {
    viewBoxWidth: 100,
    viewBoxHeight: 100,
    strokeColor: COLORS.palette.cyan,
    strokeWidth: 10,
    grabbable: true,
  };

  handleSelectPoint = (pointId, lineId) => () => {
    if (this.props.grabbable) {
      this.props.handleSelectCurve(lineId)();
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

  render() {
    const {
      points,
      viewBoxWidth,
      viewBoxHeight,
      strokeColor,
      strokeWidth,
      grabbable,
      t,
      curves,
      selectedCurve,
    } = this.props;
    let curvesCopy = []

    // TODO: change 1000 constant to variable passed
    for (let curve of curves) {
      let p1 = [curve['p1'][0], 1000-curve['p1'][1]];
      let p2 = [curve['p2'][0], 1000-curve['p2'][1]];
      let p3 = [curve['p3'][0], 1000-curve['p3'][1]];
      let p4 = [curve['p4'][0], 1000-curve['p4'][1]];
      curvesCopy.push({
        p1: p1,
        p2: p2,
        p3: p3,
        p4: p4,
        id: curve['id'],
      })
    }

    const isMobile = getDeviceType() === 'mobile';

    let curvesRender = [];
    for (let i = 0; i < curvesCopy.length; i++) {
      const p1 = (i !== 0) ? curvesCopy[i-1]['p4'] : curvesCopy[i]['p1']; // connect the curves
      const p2 = curvesCopy[i]['p2'];
      const p3 = curvesCopy[i]['p3'];
      const p4 = curvesCopy[i]['p4'];
      const A = lerp(p1, p2, t);
      const B = lerp(p2, p3, t);
      const C = lerp(p3, p4, t);
      const D = lerp(A, B, t);
      const E = lerp(B, C, t);
      const P = lerp(D, E, t);
      const instructions = 
      `
        M ${p1[0]},${p1[1]}
        C ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]}
      `;

      curvesRender.push(
        <>
          <ControlLine x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={COLORS.palette.blue}/>
          <ControlLine x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} stroke={COLORS.palette.blue}/>
          <ControlLine x1={D[0]} y1={D[1]} x2={E[0]} y2={E[1]} stroke={COLORS.palette.red}/>

          <ControlLine x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} />
          <ControlLine x1={p3[0]} y1={p3[1]} x2={p4[0]} y2={p4[1]} />
          <ControlLine x1={p2[0]} y1={p2[1]} x2={p3[0]} y2={p3[1]} />
          
          <g onClick={this.props.handleSelectCurve(curvesCopy[i]['id'])}>
            <path style={{cursor: 'pointer'}}
              d={instructions}
              fill="none"
              stroke={selectedCurve === i ? COLORS.white : strokeColor}
              strokeWidth={strokeWidth}
            />
            <path style={{cursor: 'pointer'}}
              d={instructions}
              fill="none"
              stroke={'transparent'}
              strokeWidth={strokeWidth+10}
            />
          </g>

          <ControlPoint cx={A[0]} cy={A[1]} stroke={COLORS.palette.blue} grabbable={false} isMobile={isMobile} />
          <ControlPoint cx={B[0]} cy={B[1]} stroke={COLORS.palette.blue} grabbable={false} isMobile={isMobile} />
          <ControlPoint cx={C[0]} cy={C[1]} stroke={COLORS.palette.blue} grabbable={false} isMobile={isMobile} />
          <ControlPoint cx={D[0]} cy={D[1]} stroke={COLORS.palette.red} grabbable={false} isMobile={isMobile} />
          <ControlPoint cx={E[0]} cy={E[1]} stroke={COLORS.palette.red} grabbable={false} isMobile={isMobile} />
          <ControlPoint cx={P[0]} cy={P[1]} stroke={selectedCurve === i ? COLORS.white : COLORS.palette.cyan} grabbable={false} isMobile={isMobile} />

          <EndPoint cx={p1[0]} cy={p1[1]}
            stroke={COLORS.palette.red}
            onMouseDown={this.handleSelectPoint('p1', curvesCopy[i]['id'])}
            onTouchStart={this.handleSelectPoint('p1', curvesCopy[i]['id'])}
            grabbable={grabbable} isMobile={isMobile}
          />

          <EndPoint cx={p2[0]} cy={p2[1]}
            stroke={COLORS.palette.yellow}
            onMouseDown={this.handleSelectPoint('p2', curvesCopy[i]['id'])}
            onTouchStart={this.handleSelectPoint('p2', curvesCopy[i]['id'])}
            grabbable={grabbable} isMobile={isMobile}
          />

          <EndPoint cx={p3[0]} cy={p3[1]}
            stroke={COLORS.palette.green}
            onMouseDown={this.handleSelectPoint('p3', curvesCopy[i]['id'])}
            onTouchStart={this.handleSelectPoint('p3', curvesCopy[i]['id'])}
            grabbable={grabbable}isMobile={isMobile}
          />

          <EndPoint cx={p4[0]} cy={p4[1]}
            stroke={COLORS.palette.blue}
            onMouseDown={this.handleSelectPoint('p4', curvesCopy[i]['id'])}
            onTouchStart={this.handleSelectPoint('p4', curvesCopy[i]['id'])}
            grabbable={grabbable} isMobile={isMobile}
          />
        </>
      );
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
        { curvesRender }
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

export default Bezier;