import React from "react";
import "./slider.css";

export default function Slider({ value, changeValue }) {

  return (
    <div className="slider-parent">
      <input type="range" min="0" max="1" step="0.01" value={value}
         onChange={({ target: { value: radius } }) => { changeValue(parseFloat(radius)); }}
      />
      <div className="buble"> T-value = {value} </div>
    </div>
  );
}