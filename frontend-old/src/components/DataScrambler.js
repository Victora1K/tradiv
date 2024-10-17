import React, { useState } from "react";
import * as d3 from "d3";

function DataScrambler () {
    var list = [];
  
    const randomZero = (weight = 1) => {
      return (Math.random() + Math.random() - 1) * weight;
    };
    let length = 60
    const seedClose = Math.random() * 150 + 50;
    let previousClose = seedClose;
    let previousVolume = Math.random() * 300 + 10;
    let trend = Math.floor(Math.random() * 2) * 2 - 1;

    return d3.range(length).map((item, i) => {

      const open = previousClose * (1 + randomZero(0.1));
      const close = open * (1 + randomZero(0.2) * trend);
      const high = Math.max(open, close) * (1 + randomZero(0.1));
      const low = Math.min(open, close) * (1 - randomZero(0.1));
      const volume = previousVolume * (1 + randomZero(0.5));

      previousClose = close;
      trend = Math.floor(Math.random() * 2) * 2 - 1;

      var data = {
        time: i,
        open,
        high,
        low,
        close,
        volume,
      };
      list.push(data);

      console.log("number generated")
      return data;
      
    });

  };

  export default DataScrambler