import React, { PureComponent } from 'react';

import Slider from './components/slider';

import './App.css';
// import { p1weight, p2weight, p3weight, p4weight } from './constants/constants';
import BezierController from './components/bezier_controller';
import BernsteinWeightGraph from './components/bernstein_weight_graph'
import BernsteinBezier from './components/bernstein_curve';
import DerivBezier from './components/deriv_bezier_curve';
import QuadBezier from './components/quadratic_bezier_curve'
import Bezier from './components/bezier_curve';

class App extends PureComponent {
  state = {
    curves: [{
      p1: [250, 750],
      p2: [250, 250],
      p3: [750, 250],
      p4: [750, 750],
      point_of_reference: [500, 750],
    }],
    current_curve_id: 0, //id is their position in the array
    maxCurves: 5,
    p1: [250, 750],
    p2: [250, 250],
    p3: [750, 250],
    p4: [750, 750],
    point_of_reference: [500, 750],
    t: 0,
    dependent: true,
  };

  handleUpdatePoint = (pointId, pointCoords) => {
    // HACK: Quadratic curves take P1, P2, and P4 (not P3).
    // This is to make transitioning between the two feel more natural.
    // Sadly, this means we have to patch that association when the quadratic
    // p4 moves.
    if (this.state.type === 'quadratic' && pointId === 'p3') {
      pointId = 'p4';
    }

    this.setState({ [pointId]: pointCoords });

  };
  
  render() {
    const { p1, p2, p3, p4, point_of_reference, t } = this.state;
    const d_p1 = [(-3*p1[0]+3*p2[0])/6, (-3*p1[1]+3*p2[1])/6];
    const d_p2 = [(-3*p2[0]+3*p3[0])/6, (-3*p2[1]+3*p3[1])/6];
    const d_p3 = [(-3*p3[0]+3*p4[0])/6, (-3*p3[1]+3*p4[1])/6];
    // console.log(d_p1, d_p2, d_p3);

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
            <div>point_of_reference:</div>
            <div>&nbsp;({point_of_reference[0].toFixed(2)},{point_of_reference[1].toFixed(2)})&nbsp;</div>
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
                viewBoxWidth={4000}
                viewBoxHeight={1000}
                points={[p1, p2, p3, p4]}
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
                  points={[d_p1, d_p2, d_p3]}
                  updatePoint={this.handleUpdatePoint}
                  t={t}
                />}
              />
            </div>
            <div className="grid-item">
              <BezierController bezierComponent={
                // {/* TODO: change viewbox px to constant */}
                <DerivBezier
                  viewBoxWidth={2000}
                  viewBoxHeight={2000}
                  points={[p1, p2, p3, p4]}
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
                  points={[p1, p2, p3, p4, point_of_reference]}
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
