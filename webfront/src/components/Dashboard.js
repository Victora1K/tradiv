import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CandlestickChart from './CandlestickChart';
import PlaybackControls from './PlaybackControls';
import TradingControls from './TradingControls';
import { startPlayback, stopPlayback, resetPlayback } from '../utils/PlaybackLogic';

const Dashboard = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState({ dates: [], open: [], high: [], low: [], close: [] });
  const [displayData, setDisplayData] = useState({ dates: [], open: [], high: [], low: [], close: [] });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [intervalId, setIntervalIdState] = useState(null);
  const [playSpeed, setPlaySpeed] = useState(1000);
  const [sharesOwned, setSharesOwned] = useState(0);
  const [shortedShares, setShortedShares] = useState(0);
  const [shortedPrices, setShortedPrices] = useState([]);
  const [accountValue, setAccountValue] = useState(10000);
  const [profitLoss, setProfitLoss] = useState(0);
  const [entryPrices, setEntryPrices] = useState([]);
  const [averageEntryPrice, setAverageEntryPrice] = useState(0);
  const [averageShortPrice, setAverageShortPrice] = useState(0);
  const [patternType, setPatternType] = useState(''); // Track selected pattern
  const dataRef = useRef(stockData);

  // UseEffect to automatically trigger playback when new data is fetched
  useEffect(() => {
    if (stockData.dates.length > 0) {
      // Ensure data is available before starting playback
      startPlayback();
    }
  }, [stockData]);  // Watch for changes in stockData and trigger playback

  const fetchPatternData = async (newChart = false) => {
    try {
      let apiEndpoint = '';
      if (patternType === 'double_bottom') {
        apiEndpoint = `http://localhost:5000/api/stocks/double_bottoms${newChart ? '?new=true' : ''}`;
      } else if (patternType === 'volatility') {
        apiEndpoint = `http://localhost:5000/api/stocks/high_volatility${newChart ? '?new=true' : ''}`;
      } else if (patternType === 'random') {
        apiEndpoint = 'http://localhost:5000/api/random_stock';
      }
  
      // Reset playback and chart before fetching new data
      resetPlayback();
  
      const response = await axios.get(apiEndpoint);
      const { symbol, timestamp } = response.data;
      setSymbol(symbol);
  
      // Fetch new stock data from the returned timestamp
      await fetchStockData(symbol, timestamp);
  
      setCurrentIndex(0);  // Reset index for new chart playback
      startPlayback();  // Start playback automatically after new data is fetched
    } catch (error) {
      console.error("Error fetching pattern data:", error);
    }
  };
  

  // Fetch stock data from the given timestamp
  const fetchStockData = async (symbol, timestamp) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/stock_prices/${symbol}/${timestamp}`);
      if (response.data.length > 0) {
        const processedData = {
          dates: response.data.map(item => item.date),
          open: response.data.map(item => parseFloat(item.open)),
          high: response.data.map(item => parseFloat(item.high)),
          low: response.data.map(item => parseFloat(item.low)),
          close: response.data.map(item => parseFloat(item.close)),
        };
        setStockData(processedData);  // Set the stock data
        dataRef.current = processedData;  // Save to reference for playback
      } else {
        console.error("No stock data found for the selected timestamp.");
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  // Calculate total portfolio value
  const currentPrice = (displayData && displayData.close && displayData.close.length > currentIndex)
    ? displayData.close[currentIndex]
    : 0;

  const totalPortfolio = accountValue + (sharesOwned * currentPrice) - (shortedShares * currentPrice);

  // Calculate and update average price
  const calculateAverageEntryPrice = (prices) => {
    if (prices.length === 0) return 0;
    return prices.reduce((acc, price) => acc + price, 0) / prices.length;
  };

  useEffect(() => {
    if (sharesOwned > 0) {
      setAverageEntryPrice(calculateAverageEntryPrice(entryPrices));
    }
    if (shortedShares > 0) {
      setAverageShortPrice(calculateAverageEntryPrice(shortedPrices)); // Update average short price
    }
    const profit = (currentPrice - averageEntryPrice) * sharesOwned + (averageShortPrice - currentPrice) * shortedShares;
    setProfitLoss(profit);
  }, [currentPrice, sharesOwned, shortedShares, averageEntryPrice, averageShortPrice]);

  // Playback control logic
  const startPlayback = () => {
    if (intervalId) return;
    const id = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < stockData.dates.length) {
          setDisplayData({
            dates: stockData.dates.slice(0, nextIndex),
            open: stockData.open.slice(0, nextIndex),
            high: stockData.high.slice(0, nextIndex),
            low: stockData.low.slice(0, nextIndex),
            close: stockData.close.slice(0, nextIndex),
          });
          return nextIndex;
        } else {
          clearInterval(id);
          return prevIndex;
        }
      });
    }, playSpeed);
    setIntervalIdState(id);
  };

  const stopPlayback = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalIdState(null);
    }
  };

  const resetPlayback = () => {
    stopPlayback();
    setCurrentIndex(0);
    setDisplayData({ dates: [], open: [], high: [], low: [], close: [] });
  };

  // Enter a buy position at the previous index
  const enterPosition = () => {
    if (currentIndex > 1 && displayData && displayData.close.length > currentIndex - 1) {
      const entryPrice = displayData.close[currentIndex - 1];
      if (accountValue >= entryPrice) {
        setSharesOwned(prevShares => prevShares + 1);
        setEntryPrices(prevPrices => [...prevPrices, entryPrice]);
        setAccountValue(prevValue => prevValue - entryPrice);
      } else {
        console.log("Not enough balance to buy shares.");
      }
    } else {
      console.error("Invalid buy position: previous index is out of bounds or no data available.");
    }
  };

  // Short the stock at the previous index
  const shortPosition = () => {
    if (currentIndex > 1 && displayData && displayData.close.length > currentIndex - 1) {
      const shortPrice = displayData.close[currentIndex - 1];

      const marginRequired = shortPrice * 5;
      if (accountValue >= marginRequired) {
        setShortedShares(prevShares => prevShares + 1);
        setShortedPrices(prevPrices => [...prevPrices, shortPrice]);
        setAccountValue(prevValue => prevValue - shortPrice);
      } else {
        console.log("Not enough balance to short shares. You need at least 5x the short price as margin.");
      }
    } else {
      console.error("Invalid short position: previous index is out of bounds or no data available.");
    }
  };

  // Exit all positions at the previous index
  const exitPosition = () => {
    if (currentIndex > 1 && displayData && displayData.close.length > currentIndex - 1) {
      const exitPrice = displayData.close[currentIndex - 1];

      if (sharesOwned > 0) {
        const profit = (exitPrice - averageEntryPrice) * sharesOwned;
        setProfitLoss(prevProfitLoss => prevProfitLoss + profit);
        setAccountValue(prevValue => prevValue + (sharesOwned * exitPrice));
        setSharesOwned(0);
        setEntryPrices([]);
      } else if (shortedShares > 0) {
        const totalShortedProfit = shortedPrices.reduce((acc, shortPrice) => acc + (shortPrice - exitPrice), 0);
        setProfitLoss(prevProfitLoss => prevProfitLoss + totalShortedProfit);
        setAccountValue(prevValue => prevValue + (shortedShares * exitPrice));
        setShortedShares(0);
        setShortedPrices([]);
      } else {
        console.log("No position to exit.");
      }
    } else {
      console.error("Invalid exit: previous index is out of bounds or no data available.");
    }
  };

  return (
    <div>
      <h1>Stock Trading Dashboard</h1>

      <h2>Total Portfolio Value: ${totalPortfolio.toFixed(2)}</h2>
      <h2 style={{ color: profitLoss >= 0 ? 'green' : 'red' }}>
        Relative Profit/Loss: ${profitLoss.toFixed(2)}
      </h2>
      <h3>Average Entry Price: ${averageEntryPrice.toFixed(2)}</h3>
      <h3>Average Short Price: ${averageShortPrice.toFixed(2)}</h3>

      <h3>Shares Owned: {sharesOwned}</h3>
      <h3>Shorted Shares: {shortedShares}</h3>

      {/* Pattern Selection Dropdown */}
      <select onChange={(e) => setPatternType(e.target.value)} value={patternType}>
        <option value="">Select Pattern</option>
        <option value="double_bottom">Double Bottom</option>
        <option value="volatility">High Volatility</option>
        <option value="random">Random Data</option>
      </select>
      <button onClick={() => fetchPatternData(false)}>Fetch Pattern Data</button>

      {/* Next Chart Button */}
      <button onClick={() => fetchPatternData(true)}>Next Chart</button>

      <CandlestickChart displayData={displayData} symbol={symbol} />

      <PlaybackControls
        startPlayback={startPlayback}
        stopPlayback={stopPlayback}
        resetPlayback={resetPlayback}
        speedUpPlayback={() => setPlaySpeed(prev => Math.max(100, prev / 2))}
        slowDownPlayback={() => setPlaySpeed(prev => prev * 2)}
      />

      <TradingControls
        enterPosition={enterPosition}
        exitPosition={exitPosition}
        shortPosition={shortPosition}
      />
    </div>
  );
};

export default Dashboard;
