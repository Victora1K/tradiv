import React, { useState } from "react";
import * as d3 from "d3";
import Chart from '../components/Chart';
import '../index.css';
import CalculateTotal from "../myFunctions/CalculateTotal";

function DDDSCreen() {
  const chart_width = 780;
  const chart_height = 380;

  var list = [];

  const randomOne = (weight = 1) => {
    return (Math.random() + Math.random() - 1) * weight;

  };

  const generateData = () => {
    let length = 30
    // Math.round(Math.random() * 90) + 10;

    // initial values
    const seed_close = Math.random() * 150 + 50;
    let previous_close = seed_close;
    let previous_volume = Math.random() * 300 + 10;
    let trend = Math.floor(Math.random() * 2) * 2 - 1;

    // calculate each bar
    return d3.range(length).map((item, i) => {
      const open = previous_close * (1 + randomOne(0.1));
      const close = open * (1 + randomOne(0.2) * trend);
      const high = Math.max(open, close) * (1 + randomOne(0.1));
      const low = Math.min(open, close) * (1 - randomOne(0.1));
      const volume = previous_volume * (1 + randomOne(0.5));

      previous_close = close;
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
      return data;
    });
  };
  //const actual = (list, n = 15) => (n > 0 ? list.slice(n, n+ 1) : list.slice(n))[0];
  //console.log("ACtual list value",actual(list, 15));


  const populateList = (anArray) => {
    anArray.forEach(element => {
      list.push(element);
  })};

  const randomTwo = (weight = 1) => {
    return (Math.random() + Math.random() - 1) * weight;
  };
  
  const generateNewData = () => {
    let length = 30
    // Math.round(Math.random() * 90) + 10;

    // initial values
    const seed_close = Math.random() * 150 + 50;
    let previous_close = seed_close;
    let previous_volume = Math.random() * 300 + 10;
    let trend = Math.floor(Math.random() * 2) * 2 - 1;

    // calculate each bar
    return d3.range(length).map((item, i) => {
      const open = previous_close * (1 + randomTwo(0.1));
      const close = open * (1 + randomTwo(0.2) * trend);
      const high = Math.max(open, close) * (1 + randomTwo(0.1));
      const low = Math.min(open, close) * (1 - randomTwo(0.1));
      const volume = previous_volume * (1 + randomTwo(0.5));

      previous_close = close;
      trend = Math.floor(Math.random() * 2) * 2 - 1;

      return {
        time: i,
        open,
        high,
        low,
        close,
        volume, 
        
      };
    });
  };

  const [data, setData] = useState(generateData());
  const [newdata, setnewData] = useState(generateNewData());


  const bidPrice = () => {
    let bidcloseprice = 0
    let i = 29
      
        
      bidcloseprice += list[i].close;
        
      console.log("This is bidcloseprice", bidcloseprice);
      return bidcloseprice;
        
  };


  const finalPrice = () => {
    let finalcloseprice = 0
    let i = 59    
    finalcloseprice += list[i].close;  
    console.log("This is finalcloseprice", finalcloseprice);
    return finalcloseprice;
            
  };

  let count = 0;
  const keepTrackOfCount = () => {
    
    const updateCount = () => {
      count ++;
      if (count === 2) {
        changeData();
      };
    };
    updateCount();
    console.log("My count", count);
    return count;

  }


  const finalMinusBid = () => {
    const difference = finalPrice() - bidPrice();
    return difference;
  }
  let totalsum = 100;


  const addNewArray = () => {
    let totalsum = 100;
    keepTrackOfCount();
    generateNewData();
    
    populateList(newdata);
    bidPrice();
    finalPrice();
    const difference = finalMinusBid();
    if (difference >= 0) {
      totalsum += difference.toFixed(2);}
      else {
        totalsum -= difference.toFixed(2);
      };
    console.log("My difference plus",difference);
    console.log("My amount plus",totalsum);
    const formattedAcctValue = `$${totalsum}`;
    localStorage.setItem("totalSum", formattedAcctValue);
    return totalsum;
    
    //console.log("arrayappend")
    //setnewData(generateNewData);
    //const [newdata, setData] = useState(generateNewData());
    //let length = 30
    //data = data + newdata;
    //setData(...data, ...newdata);
    //console.log("arrayappend",data)
    //let {data, newdata} = this.state;
    //data.push(newdata);
  }//export {totalsum};



  const addNewArrayNeg = () => {
    keepTrackOfCount();
    populateList(newdata)
    console.log(list)
    bidPrice();
    finalPrice();
    const difference = finalMinusBid();
    if (difference >= 0) {
      totalsum = totalsum - difference}
      else {
        totalsum = totalsum + (difference * -1);
      };
    console.log("My difference minus",difference);
    console.log("My amount minus",totalsum);
    //localStorage.setItem("totalSum", totalsum);
    return totalsum;
  }



  const createNewData = () => {
    setnewData(generateNewData);
  };




  const changeData = () => {
    setData(generateData);
    //setnewData(generateNewData);
  };

  console.log("My final total" + {totalsum})
  function newFunk() {
    
    console.log("Total value imported " + CalculateTotal(1,2))
  }


  return (
    <div className="header">
      <div className="main">
        <div>
          <h1 className="header"> Japanese Candlestick Simulation</h1>
        </div>
        <div className="center">
          <Chart data={list} width={chart_width} height={chart_height} />
        </div>
        <div>
      <button onClick={addNewArray}  totalsum={totalsum} className="buttons"> BUY +$100 </button>
      <button onClick={changeData} className="buttons">New Data</button>
      <button onClick={addNewArrayNeg} className="buttons">SHORT -$100 </button>   
      </div>
        
      </div>
     

    </div>
    
  );
}




export default DDDSCreen;

