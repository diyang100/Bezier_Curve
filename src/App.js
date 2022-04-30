import React, { PureComponent } from 'react';

import Slider from './components/slider';

import './App.css';
// import { p1weight, p2weight, p3weight, p4weight } from './constants/constants';
import { lerp } from './constants/constants';
import { getDeviceType } from './constants/constants';
import BezierController from './components/bezier_controller';
import BernsteinWeightGraph from './components/bernstein_weight_graph';
import BernsteinBezier from './components/bernstein_curve';
import DerivBezier from './components/deriv_bezier_curve';
import QuadBezier from './components/quadratic_bezier_curve';
import Bezier from './components/bezier_curve';

class App extends PureComponent {
  state = {
    curves: [{
      p1: [250, 750],
      p2: [250, 250],
      p3: [750, 250],
      p4: [750, 750],
      id: 0,
    },
    {
      p1: [1250, 750],
      p2: [1250, 250],
      p3: [1750, 250],
      p4: [1750, 750],
      id: 1,
    }
    ],
    current_curve_id: 0, //id is their position in the array
    maxCurves: 5,
    p1: [250, 750],
    p2: [250, 250],
    p3: [750, 250],
    p4: [750, 750],
    point_of_reference: [500, 500],
    t: 0,
    dependent: true,
  };
  // constructor(props) {
  //   super(props);
  //   this.state.curves.push({
  //     p1: this.state.curves[0]['p4'],
  //     p2: [1250, 250],
  //     p3: [1750, 250],
  //     p4: [1750, 750],
  //     id: 2,
  //   })
  // }

  transformScalePoints = (points) => {
    let minX = points[0][0];
    let minY = points[0][1];
    let maxX = points[0][0];
    let maxY = points[0][1];
    let retPoints = []

    // transform points to 0,0
    for (let i = 0; i < points.length; i++) {
      minX = Math.min(minX, points[i][0]);
      minY = Math.min(minY, points[i][1]);
      retPoints.push([points[i][0], points[i][1]]);
    }
    for (let i = 0; i < retPoints.length; i++) {
      retPoints[i][0] -= minX;
      retPoints[i][1] -= minY;
    }
    minX = 0;
    minY = 0;

    // scaling x and y to be under 1000 by 1000.
    // TODO: change 1000 to a constant
    for (let i = 0; i < retPoints.length; i++) {
      maxX = Math.max(maxX, retPoints[i][0]);
    }
    if (1000/maxX < 1) {
      for (let i = 0; i < retPoints.length; i++) {
        retPoints[i][0] *= 1000/maxX;
        retPoints[i][1] *= 1000/maxX;
      }
    }
    for (let i = 0; i < retPoints.length; i++) {
      maxY = Math.max(maxY, retPoints[i][1]);
    }
    if (1000/maxY < 1) {
      for (let i = 0; i < retPoints.length; i++) {
        retPoints[i][0] *= 1000/maxY;
        retPoints[i][1] *= 1000/maxY;
      }
    }
    // translate points to center diagram
    maxX = retPoints[0][0];
    maxY = retPoints[0][1];
    for (let i = 0; i < retPoints.length; i++) {
      maxX = Math.max(maxX, retPoints[i][0]);
      maxY = Math.max(maxY, retPoints[i][1]);
    }
    for (let i = 0; i < retPoints.length; i++) {
      retPoints[i][0] += (1000 - maxX)/2;
      retPoints[i][1] += (1000 - maxY)/2;
    }
    
    return retPoints;
  }

  handleSelectCurve = curveId => () => {
    console.log(curveId);
    this.setState({ current_curve_id: curveId });
  };

  handleUpdatePoint = (pointId, pointCoords) => {
    // HACK: Quadratic curves take P1, P2, and P4 (not P3).
    // This is to make transitioning between the two feel more natural.
    // Sadly, this means we have to patch that association when the quadratic
    // p4 moves.
    if (this.state.type === 'quadratic' && pointId === 'p3') {
      pointId = 'p4';
    }

    // this.setState({ [pointId]: pointCoords });
    let curveID = this.state.current_curve_id;
    if (curveID !== 0 && pointId === 'p1') {
      curveID -= 1;
      pointId = 'p4'
    }
    this.setState(prevState => ({
      curves: prevState.curves.map(
        curve => (curve.id === curveID ?
          Object.assign(curve, { [pointId]: pointCoords }) : curve)
      )
    }))

  };

  derivP = (p1, p2, p3, p4, t) => {
    let retPoint = [0, 0];
    retPoint[0] += p1[0] * (-3*(t**2)+6*t-3);
    retPoint[1] += p1[1] * (-3*(t**2)+6*t-3);
    retPoint[0] += p2[0] * (9*(t**2)-12*t+3);
    retPoint[1] += p2[1] * (9*(t**2)-12*t+3);
    retPoint[0] += p3[0] * (-9*(t**2)+6*t);
    retPoint[1] += p3[1] * (-9*(t**2)+6*t);
    retPoint[0] += p4[0] * (3*(t**2));
    retPoint[1] += p4[1] * (3*(t**2));
    return retPoint;
  }
  
  render() {
    const { point_of_reference, t, curves, current_curve_id, } = this.state;
    const p1 = (current_curve_id === 0) ? curves[current_curve_id]['p1'] : curves[current_curve_id-1]['p4']
    const { p2, p3, p4, } = curves[current_curve_id];
    const d_p1 = [(-3*p1[0]+3*p2[0])/6, (-3*p1[1]+3*p2[1])/6];
    const d_p2 = [(-3*p2[0]+3*p3[0])/6, (-3*p2[1]+3*p3[1])/6];
    const d_p3 = [(-3*p3[0]+3*p4[0])/6, (-3*p3[1]+3*p4[1])/6];
    // console.log(d_p1, d_p2, d_p3);

    let [sp1, sp2, sp3, sp4] = this.transformScalePoints([p1, p2, p3, p4]);
    let [sd_p1, sd_p2, sd_p3, origin] = this.transformScalePoints([d_p1, d_p2, d_p3, [0, 0]]);
    // console.log(sd_p1, sd_p2, sd_p3, origin);

    const A = lerp(p1, p2, t);
    const B = lerp(p2, p3, t);
    const C = lerp(p3, p4, t);
    const D = lerp(A, B, t);
    const E = lerp(B, C, t);
    const P = lerp(D, E, t);

    const deriv_point = this.derivP(p1, p2, p3, p4, t);
    const display_deriv_p = [P[0]+(deriv_point[0]/6), P[1]+(deriv_point[1]/6)];
    let [sp1_d, sp2_d, sp3_d, sp4_d, sderiv_p] = this.transformScalePoints([p1, p2, p3, p4, display_deriv_p]);
    // console.log(sp1_d, sp2_d, sp3_d, sp4_d, sderiv_p);
    return (
      <div className="App">
        {/* TODO: fix header display */}
        <div className="header">
        <div className='slider-wrapper'>
            <Slider value={t} changeValue={ (newVal) => { this.setState({t: newVal}); } }/>
          </div>
          <div className="title">Points:&nbsp;</div>
          <div className='hideable'>
            <div>p1:&nbsp;({p1[0].toFixed(2)},{p1[1].toFixed(2)})&nbsp;</div>
            <div>p2:&nbsp;({p2[0].toFixed(2)},{p2[1].toFixed(2)})&nbsp;</div>
          </div>
          <div className='hideable'>
            <div>p3:&nbsp;({p3[0].toFixed(2)},{p3[1].toFixed(2)})&nbsp;</div>
            <div>p4:&nbsp;({p4[0].toFixed(2)},{p4[1].toFixed(2)})&nbsp;</div>
          </div>
          <div className='hideable'>
            <div>derivative curve p1:</div>
            <div>&nbsp;({d_p1[0].toFixed(2)},{d_p1[1].toFixed(2)})&nbsp;</div>
          </div>
          <div className='hideable'>
            <div>derivative curve p2:</div>
            <div>&nbsp;({d_p2[0].toFixed(2)},{d_p2[1].toFixed(2)})&nbsp;</div>
          </div>
          <div className='hideable'>
            <div>derivative curve p3:</div>
            <div>&nbsp;({d_p3[0].toFixed(2)},{d_p3[1].toFixed(2)})&nbsp;</div>
          </div>
        </div>
        <div className='header-padding'></div>
        <div className="module-wrapper">
          <div className="main-curve">
            <BezierController bezierComponent={
              <Bezier 
                // TODO: store these constants
                viewBoxWidth={(window.innerWidth <= 600) ? 1000 : 4000}
                viewBoxHeight={1000}
                points={[p1, p2, p3, p4]}
                curves={curves}
                handleSelectCurve={this.handleSelectCurve}
                updatePoint={this.handleUpdatePoint}
                t={t}
              />}
            />
          </div>
          <div className="grid-container">
            <div className="grid-item">
              <BezierController bezierComponent={
                <QuadBezier
                  viewBoxWidth={1000}
                  viewBoxHeight={1000}
                  points={[sd_p1, sd_p2, sd_p3, origin]}
                  updatePoint={this.handleUpdatePoint}
                  t={t}
                />}
              />
            </div>
            <div className="grid-item">
              <BezierController bezierComponent={
                // {/* TODO: change viewbox px to constant */}
                <DerivBezier
                  viewBoxWidth={1000}
                  viewBoxHeight={1000}
                  points={[sp1_d, sp2_d, sp3_d, sp4_d, sderiv_p]}
                  updatePoint={this.handleUpdatePoint}
                  t={t}
                  // TODO: add dependent toggle
                  dependent={this.state.dependent}
                />}
              />
            </div>
            <div className="grid-item">
              <BernsteinWeightGraph t={t} />
            </div>
            <div className="grid-item">
              <BezierController bezierComponent={
                // {/* TODO: change viewbox px to constant */}
                <BernsteinBezier
                  viewBoxWidth={1000}
                  viewBoxHeight={1000}
                  points={[sp1, sp2, sp3, sp4, point_of_reference]}
                  updatePoint={this.handleUpdatePoint}
                  t={t}
                  // TODO: add dependent toggle
                  dependent={this.state.dependent}
                />}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
