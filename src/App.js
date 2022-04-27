import React, { PureComponent } from 'react';

import Slider from './components/slider';

import './App.css';
import { p1weight, p2weight, p3weight, p4weight } from './constants/constants';
import BezierController from './components/bezier_controller';
import BernsteinWeightGraph from './components/bernstein_weight_graph'
import BernsteinBezier from './components/bernstein_curve';


class App extends PureComponent {
  state = {
    p1: this.props.p1 || [250, 750],
    p2: this.props.p2 || [250, 250],
    p3: this.props.p3 || [750, 250],
    p4: this.props.p4 || [750, 750],
    origin: this.props.origin || [500, 750],
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
    const { p1, p2, p3, p4, origin, t } = this.state;
    return (
      <div className="App">
        <header>
          <div>
            <div>
              <div>
                <div>Points:</div>
                <div>p1:&nbsp;({p1[0].toFixed(2)},{p1[1].toFixed(2)})</div>
                <div>p2:&nbsp;({p2[0].toFixed(2)},{p2[1].toFixed(2)})</div>
                <div>p3:&nbsp;({p3[0].toFixed(2)},{p3[1].toFixed(2)})</div>
                <div>p4:&nbsp;({p4[0].toFixed(2)},{p4[1].toFixed(2)})</div>
                <div>origin:&nbsp;({origin[0].toFixed(2)},{origin[1].toFixed(2)})</div>
              </div>
              <div>
                <Slider value={t} changeValue={ (newVal) => { this.setState({t: newVal}); } } />
              </div>
            </div>
          </div>
        </header>
        <div className="module-wrapper">
          <div className="grid-container">
            
            <div className="grid-item">
              <BezierController id="initial" initialType="cubic"
                p1={p1} p2={p2} p3={p3} p4={p4} handleUpdatePoint={this.handleUpdatePoint}
                t={t} changeT={ (newVal) => { this.setState({t: newVal}); } }
              />
            </div>
            <div className="grid-item">
              <BernsteinWeightGraph t={t} p1weight={this.p1weight} p2weight={this.p2weight} p3weight={this.p3weight} p14weight={this.p4weight} />
            </div>
            <div className="grid-item">
              <BernsteinBezier
                viewBoxWidth={1000}
                viewBoxHeight={1000}
                points={[p1, p2, p3, p4, origin]}
                updatePoint={this.handleUpdatePoint}
                t={t}
                dependent={this.state.dependent}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
