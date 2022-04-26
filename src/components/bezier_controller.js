import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Bezier from './bezier_curve';
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
    handleUpdatePoint: PropTypes.func,
    t: PropTypes.number,
    changeT: PropTypes.func,
  };

  static defaultProps = {
    initialType: 'cubic',
    allowToggle: false,
    t: 0,
  };

  state = {
    viewBoxWidth: 1000,
    viewBoxHeight: 1000,
    type: this.props.initialType,
    allowToggle: false,
  };

  swapType = type => {
    this.setState({ type });
  };


  render() {
    const { viewBoxWidth, viewBoxHeight, type } = this.state;
    const { p1, p2, p3, p4, t } = this.props;

    return (
        <div className="wrapper">
          <div className="bezier-wrapper">
            <Bezier
              viewBoxWidth={viewBoxWidth}
              viewBoxHeight={viewBoxHeight}
              points={type === 'quadratic' ? [p1, p2, p4] : [p1, p2, p3, p4]}
              updatePoint={this.props.handleUpdatePoint}
              t={t}
            />
          </div>
        </div>
    );
  }
}

export default BezierController;