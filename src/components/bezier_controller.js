import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Bezier from './bezier_curve';
import Slider from './slider';
import './bezier.css';

class BezierController extends PureComponent {
  static propTypes = {
    // `id` is used in Google Analytics tracking.
    // Plz use something unique.
    id: PropTypes.string.isRequired,
    initialType: PropTypes.oneOf(['quadratic', 'cubic']),
    allowToggle: PropTypes.bool,
    p1: PropTypes.arrayOf(PropTypes.number),
    p2: PropTypes.arrayOf(PropTypes.number),
    p3: PropTypes.arrayOf(PropTypes.number),
    p4: PropTypes.arrayOf(PropTypes.number),
  };

  static defaultProps = {
    initialType: 'cubic',
    allowToggle: false,
  };

  state = {
    viewBoxWidth: 1000,
    viewBoxHeight: 1000,
    p1: this.props.p1 || [250, 250],
    p2: this.props.p2 || [250, 750],
    p3: this.props.p3 || [750, 750],
    p4: this.props.p4 || [750, 250],
    type: this.props.initialType,
    allowToggle: false,
    t: 0,
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

  swapType = type => {
    this.setState({ type });
  };


  render() {
    const { viewBoxWidth, viewBoxHeight, p1, p2, p3, p4, type } = this.state;

    return (
        <div className="wrapper">
          <div className="bezier-wrapper">
            <Bezier
              viewBoxWidth={viewBoxWidth}
              viewBoxHeight={viewBoxHeight}
              points={type === 'quadratic' ? [p1, p2, p4] : [p1, p2, p3, p4]}
              updatePoint={this.handleUpdatePoint}
            />
            <Slider value={this.state.t} changeValue={ (newVal) => { this.setState({t: newVal}); } } />
          </div>
        </div>
    );
  }
}

export default BezierController;