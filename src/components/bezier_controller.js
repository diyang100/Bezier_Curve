import React from 'react';

import './bezier.css';


const BezierController = ({ bezierComponent }) => {
  return (
    <div className="wrapper">
      <div className="bezier-wrapper">
        {bezierComponent}
      </div>
    </div>
  )
}

export default BezierController;