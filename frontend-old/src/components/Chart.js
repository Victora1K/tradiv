import React, { useState } from 'react';
import Candle from './Candle';
import * as d3 from "d3";
import CrossHairs from './CrossHairs';



const Chart = (props) => {
  const { data, width: chart_width, height: chart_height } = props;

  const [mouseCoords, setMouseCoords] = useState({
    x: 0,
    y: 0,
  });

  const dollar_high = d3.max(data.map((bar) => bar.high)) * 1.05;

  const dollar_low = d3.min(data.map((bar) => bar.low)) * 0.95;
  //console.log("here",data.map(bar => bar.high === undefined ?"no value":bar.high));

  const chart_dims = {
    pixel_width: chart_width,
    pixel_height: chart_height,
    dollar_high,
    dollar_low,
    dollar_delta: dollar_high - dollar_low
  };

  const dollarAt = pixel => {
    const dollar =
      (Math.abs(pixel - chart_dims.pixel_height) / chart_dims.pixel_height) *
        chart_dims.dollar_delta +
      chart_dims.dollar_low;

    return pixel > 0 ? dollar.toFixed(2) : "-";
  };


  //calculates what area to draw a pixel for based on o,h,l,c value)
  const pixelFor = dollar => {
    return Math.abs(
      ((dollar - chart_dims["dollar_low"]) / chart_dims["dollar_delta"]) *
        chart_dims["pixel_height"] -
        chart_dims["pixel_height"]
    );
  };


  //removes crosshair (sets it to 0,0) once mouse leaves chart
  const onMouseLeave = () => {
    setMouseCoords({
      x: 0,
      y: 0
    });
  };

  //gets changing x,y value as mouse moves for crosshairs
  const onMouseMoveInside = e => {
    setMouseCoords({
      x:
        e.nativeEvent.x -
        Math.round(e.currentTarget.getBoundingClientRect().left),
      y:
        e.nativeEvent.y -
        Math.round(e.currentTarget.getBoundingClientRect().top)
    });
  };

  //Mouse clicking in chart event logs x,y into console
  const onMouseClickInside = e => {
    console.log(`Click at ${e.nativeEvent.offsetX}, ${e.nativeEvent.offsetY}`);
  };

  // calculate the candle width
  const candle_width = Math.floor((chart_width / data.length) * 0.6);

  return (
    <svg
      width={chart_width}
      height={chart_height}
      className="chart"
      onMouseMove={onMouseMoveInside}
      onClick={onMouseClickInside}
      onMouseLeave={onMouseLeave}
    >
      {data.map((bar, i) => {
        const candle_x = (chart_width / (data.length + 1)) * (i + 1);
        return (
          <Candle
            key={i}
            data={bar}
            x={candle_x}
            candle_width={candle_width}
            pixelFor={pixelFor}
          />
        );
      })}
      <text x="10" y="16" fill="white" fontSize="10">
        <tspan>
          Mouse: {mouseCoords.x}, {mouseCoords.y}
        </tspan>
        <tspan x="10" y="30">
          Dollars: ${dollarAt(mouseCoords.y)}
        </tspan>
      </text>
      <CrossHairs x={mouseCoords.x} y={mouseCoords.y} chart_dims={chart_dims} />
    </svg>
  );
};
//<CrossHairs x={mouseCoords.x} y={mouseCoords.y} chart_dims={chart_dims} />
export default Chart;