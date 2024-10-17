
import React, { useEffect, useState, useRef } from "react";
import Chart from "../components/Chart";
import Player from '../components/Player';
//import * as d3 from "d3";

function RecordScreen() {
  //chart variables
  const chart_width = 780;
  const chart_height = 380;

  //states
  const [data, setData] = useState([]);
  const [loadData, setLoadData] = useState([...data]);
  const [delay, setIsDelay] = useState(false);
  const [stopClicked, setStopClicked] = useState(false);
  const [balance, setBalance] = useState(2500); // Example starting balance
  const [position, setPosition] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Using useRef to persist the value of intervalHandle across renders
  const intervalHandle = useRef(null);

  //function to generate a random number between 0 and 1
  const randomZero = (weight = 1) => {
    return (Math.random() + Math.random() - 1) * weight;
  };

  // Function to generate data for each click of New Data button
  const generateNewData = () => {
    const length = 25; // number of items to generate
    const newData = [];  //placeholder array for values of data

    const seedClose = Math.random() * 150 + 50; //initial close candle price between 50 and 200
    let previousClose = seedClose; //assignment
    let previousVolume = Math.random() * 300 + 10; //volume is currently unused but a part of the array
    let trend = Math.floor(Math.random() * 2) * 2 - 1; //trend is either 1 or -1

    for (let i = 0; i < length; i++) {
      const open = previousClose * (1 + randomZero(0.2));
      const close = open * (1 + randomZero(0.2) * trend);
      const high = Math.max(open, close) * (1 + randomZero(0.2));
      const low = Math.min(open, close) * (1 - randomZero(0.2));
      const volume = previousVolume * (1 + randomZero(0.5));

      previousClose = close;
      trend = Math.floor(Math.random() * 2) * 2 - 1;

      const newDataItem = {
        time: i + (data.length > 0 ? data[data.length - 1].time + 1 : 0), // Calculate the time for new data
        open,
        high,
        low,
        close,
        volume,
      };

      newData.push(newDataItem);
    }

    setData(prevData => [...prevData, ...newData]); // Append new data to existing data
    //console.log("New data generated");
  };


  // function needs to stop everything and geerate new chart data
  const changeData = () => {
    setIsDelay(false);
    setData([]);
    setLoadData([]);
    setIsDelay(false);
    generateNewData();

    console.log("Clicked New Data")

  };

  const onRevertButtonHandler = () => {
    //setData([]); // Clear all data on revert
    console.log("Revert clicked");
    setIsDelay(false);
    clearInterval(startTimer);
    // needs to properly unmount interval 
  };

  var list = [...data];
  //copies the value of data to an arrau called list 

  //generates random numbers to plot every x second set by setInterval
  const timeDelayRandom = () => {

    setIsDelay(true);
    console.log("Delay random function run -->");
    let loadClose = list[list.length - 1].close;
    const loadVolume = list[list.length - 1].volume;
    const loadTime = list[list.length - 1].time;
    const loadedData = [];
    let trend = Math.floor(Math.random() * 2) * 2 - 1;

    //while (intervalHandle != null) {
    let open = loadClose * (1 + randomZero(0.1));
    let close = open * (1 + randomZero(0.2) * trend);
    let high = Math.max(open, close) * (1 + randomZero(0.1));
    let low = Math.min(open, close) * (1 - randomZero(0.1));
    let volume = loadVolume * (1 + randomZero(0.5));

    loadClose = close;
    console.log(loadClose, "load close pain")
    trend = Math.floor(Math.random() * 2) * 2 - 1;
    var nextDataItem = {
      time: parseInt(1 + parseInt(loadTime)), // Calculate the time for new data
      open,
      high,
      low,
      close,
      volume,
    };
    loadedData.push(nextDataItem)//}
    console.log("for statement running ", loadedData);

    list = [...list, ...loadedData];
    setLoadData([...list]);
  }


  const startTimer = () => {
    // Only start the timer if it's not already running
    if (!intervalHandle.current) {
      setStopClicked(false)
      intervalHandle.current = setInterval(timeDelayRandom, 1000);
      console.log("Timer started");
    } else {
      console.log("Timer is already running");
    }
  };

  useEffect(() => {
    if (stopClicked) {
      clearInterval(intervalHandle);
    }
  }, [stopClicked])
  const stopTimer = () => {
    setStopClicked(true);
    if (intervalHandle.current) {
      clearInterval(intervalHandle.current);
      intervalHandle.current = null;
    }
    console.log("timer stopped")
  }

  // Clear the interval when the component unmounts
  useEffect(() => {
    return () => {
      if (intervalHandle.current) {
        clearInterval(intervalHandle.current);
      }
    };
  }, []);

  const getCurrentPrice = () => {
    const latestCandle = loadData[loadData.length - 1];
    console.log("Latest candle: " + latestCandle);
    return latestCandle ? latestCandle.close : null; // Return the latest closing price or null if no data

  };

  const calculateQuantity = (balance, price) => {
    const investmentFraction = 0.25; // say the user invests 25% of their balance
    const investAmount = balance * investmentFraction;
    return Math.floor(investAmount / price); // Returns whole number of shares/units
  };

  const calculateProfitLoss = (position, currentPrice) => {
    if (!position) return 0;

    const { type, entryPrice, quantity } = position;
    if (type === 'buy') {
      // Profit or loss for a buy position
      return (currentPrice - entryPrice) * quantity;
    } else if (type === 'short') {
      // Profit or loss for a short position
      return (entryPrice - currentPrice) * quantity;
    } else {
      return 0; // No profit or loss for an unrecognized position type
    }
  };



  const buyStock = () => {
    if (!isOpen) {
      const currentPrice = getCurrentPrice();
      const quantity = calculateQuantity(balance, currentPrice);
      setPosition({ type: 'buy', entryPrice: currentPrice, quantity });
      setIsOpen(true);
      console.log("Entered long here at price: " + currentPrice + "Quantity of stocks bought was " + quantity)
      console.log("Position: " + position);
      const profitLoss = calculateProfitLoss(position, currentPrice);
      console.log("Closed all positions: ProfitLoss is $" + profitLoss);
      setBalance(balance + profitLoss);
    }
  };

  const shortStock = () => {
    if (!isOpen) {
      const currentPrice = getCurrentPrice();
      const quantity = calculateQuantity(balance, currentPrice);
      setPosition({ type: 'short', entryPrice: currentPrice, quantity });
      setIsOpen(true);
      console.log("Entered short here at price: " + currentPrice);
      const profitLoss = calculateProfitLoss(position, currentPrice);
      console.log("Closed all positions: ProfitLoss is $" + profitLoss);
      setBalance(balance + profitLoss);
    }
  };

  const closePosition = () => {
    if (isOpen) {
      const currentPrice = getCurrentPrice();
      const profitLoss = calculateProfitLoss(position, currentPrice);
      console.log("Closed all positions: ProfitLoss is $" + profitLoss);
      setBalance(balance + profitLoss);
      console.log("Closed all positions: Balance is $" + balance)
      setPosition(null);
      setIsOpen(false);

    }
  };


  let contentB = (
    <Chart
      data={!delay ? data : loadData}
      //data={testloadData}
      width={chart_width * 1.5}
      height={chart_height * 1.5}
    />
  );
  console.log(delay);
  return (
    <div className='contents'>
      <Player />
      <div className='header'>
        <h1 className='header' > Japanese Candlestick Simulation</h1>
          <p> </p>
      
        <p>Balance: ${balance.toFixed(2)}</p>
        {position && (
          <p>
            Open Position: {position.type} - Quantity: {position.quantity} - Entry Price: ${position.entryPrice.toFixed(2)}
          </p>
        )}
      </div>
      <div className="center">{contentB}</div>
      <div classname="center">
        <div>
          <button onClick={onRevertButtonHandler} className="buttons">
            Retry
          </button>
          <button onClick={changeData} className="buttons">
            New
          </button>
          <button onClick={startTimer} className="buttons">
            Play
          </button>
          <button onClick={stopTimer} className="buttons">
            Stop
          </button>
        </div>
        <div>
          <button onClick={buyStock} className="buttons">
            Buy $$
          </button>
          <button onClick={shortStock} className="buttons">
            Short $$
          </button>
          <button onClick={closePosition} className="buttons">
            Close (-)
          </button>
        </div>
      </div>
      <div className="main"></div>
    </div>
  );
}

export default RecordScreen;
