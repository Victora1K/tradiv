import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CandlestickChart from './CandlestickChart';
import PlaybackControls from './PlaybackControls';
import TradingControls from './TradingControls';
import Navbar from './Navbar';
import PatternCarousel from './PatternCarousel';
import { startPlayback, stopPlayback, resetPlayback } from '../utils/PlaybackLogic';

const Dashboard = ({ totalAccountValue, setTotalAccountValue }) => {
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
  const [patternType, setPatternType] = useState('random');  // Default to random pattern
  const dataRef = useRef(stockData);
  const localBaseUrl = 'http://127.0.0.1:5000';
  const prodBaseUrl = 'https://tradenerves.com';

  // Ensure playback starts after new data is fetched
  useEffect(() => {
    if (stockData.dates.length > 0) {
      startPlayback();
    }
  }, [stockData]);

  const getBaseUrl = () => {
    if (location.hostname === 'localhost') {
      return localBaseUrl;
    }
    return prodBaseUrl;
  }

  const fetchPatternData = async () => {
    try {
      let apiEndpoint = '';

      if (patternType === 'double_bottom') {
        apiEndpoint = `${getBaseUrl()}/api/stocks/double_bottoms`;
        //apiEndpoint = `https://tradenerves.com/api/stocks/double_bottoms`;
      } else if (patternType === 'volatility') {
        apiEndpoint = `${getBaseUrl()}/api/stocks/high_volatility`;
        //apiEndpoint = `https://tradenerves.com/api/stocks/high_volatility`;
      } else {
        apiEndpoint = `${getBaseUrl()}/api/random_stock`;
        //apiEndpoint = `https://tradenerves.com/api/random_stock`;
      }
      //http://127.0.0.1:5000 dev env
      // Reset the chart before fetching new data
      resetPlayback();

      const response = await axios.get(apiEndpoint);
      const { symbol, timestamp } = response.data;
      setSymbol(symbol);

      // Fetch new stock data from the returned timestamp
      await fetchStockData(symbol, timestamp);

      setCurrentIndex(0);  // Reset index for new chart playback
    } catch (error) {
      console.error("Error fetching pattern data:", error);
    }
  };

  const fetchStockData = async (symbol, timestamp) => {
    try {
      //const response = await axios.get(`https://tradenerves.com/api/stock_prices/${symbol}/${timestamp}`);
      const response = await axios.get(`http://127.0.0.1:5000/api/stock_prices/${symbol}/${timestamp}`);
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

  // Portfolio calculation logic
  const currentPrice = (displayData && displayData.close && displayData.close.length > currentIndex)
    ? displayData.close[currentIndex]
    : 0;

  const totalPortfolio = accountValue + (sharesOwned * currentPrice) - (shortedShares * currentPrice);

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

  // Trading functions (buy, short, exit)
  const enterPosition = () => {
    if (currentIndex > 1 && displayData && displayData.close.length > currentIndex - 1) {
      const entryPrice = displayData.close[currentIndex - 1];
      if (accountValue >= entryPrice) {
        setSharesOwned(prevShares => prevShares + 1);
        setEntryPrices(prevPrices => [...prevPrices, entryPrice]);
        setAccountValue(prevValue => prevValue - entryPrice);
        setTotalAccountValue(prevValue => prevValue - entryPrice);
      } else {
        console.log("Not enough balance to buy shares.");
      }
    } else {
      console.error("Invalid buy position: previous index is out of bounds or no data available.");
    }
  };

  const shortPosition = () => {
    if (currentIndex > 1 && displayData && displayData.close.length > currentIndex - 1) {
      const shortPrice = displayData.close[currentIndex - 1];

      const marginRequired = shortPrice * 5;
      if (accountValue >= marginRequired) {
        setShortedShares(prevShares => prevShares + 1);
        setShortedPrices(prevPrices => [...prevPrices, shortPrice]);
        setAccountValue(prevValue => prevValue + shortPrice);
        setTotalAccountValue(prevValue => prevValue + shortPrice);
      } else {
        console.log("Not enough balance to short shares. You need at least 5x the short price as margin.");
      }
    } else {
      console.error("Invalid short position: previous index is out of bounds or no data available.");
    }
  };

  const exitPosition = () => {
    if (currentIndex > 1 && displayData && displayData.close.length > currentIndex - 1) {
      const exitPrice = displayData.close[currentIndex - 1];

      if (sharesOwned > 0) {
        const profit = (exitPrice - averageEntryPrice) * sharesOwned;
        console.log("toal profit:" +profit)
        setProfitLoss(prevProfitLoss => prevProfitLoss + profit);
        setAccountValue(prevValue => prevValue + (sharesOwned * exitPrice));
        setTotalAccountValue(prevValue => prevValue + (sharesOwned * exitPrice));
        setSharesOwned(0);
        setEntryPrices([]);
      } else if (shortedShares > 0) {
        const totalShortedProfit = shortedPrices.reduce((acc, shortPrice) => acc + (shortPrice - exitPrice), 0);
        console.log("Total shorted profit: " +totalShortedProfit)
        setProfitLoss(prevProfitLoss => prevProfitLoss + totalShortedProfit);
        setAccountValue(prevValue => prevValue - (shortedShares * exitPrice));
        setTotalAccountValue(prevValue => prevValue - (shortedShares * exitPrice));
        //setAccountValue(prevValue => prevValue + (shortedShares * exitPrice));
        setShortedShares(0);
        setShortedPrices([]);
      } else {
        console.log("No position to exit.");
      }
    } else {
      console.error("Invalid exit: previous index is out of bounds or no data available.");
    }
  };

  const buttonStyle = {
    margin: '5px',
    padding: '10px',
    fontSize: '14px',
    minWidth: '120px',
  };

  return (
    <div>
      
      <PatternCarousel />
      <h1>Pattern Trading Dashboard</h1>

      {/*<h2>Total Portfolio Value: ${totalPortfolio.toFixed(2)}</h2>*/}
      <h2 style={{ color: profitLoss >= 0 ? 'green' : 'red' }}>
        Relative Profit/Loss: ${profitLoss.toFixed(2)}
      </h2>
      <h3>Average Entry Price: ${averageEntryPrice.toFixed(2)}  Average Short Price: ${averageShortPrice.toFixed(2)}</h3>
  

      <h3>Shares Owned: {sharesOwned} Shorted Shares: {shortedShares}</h3>
     

      {/* Pattern Selection Dropdown */}
      <select onChange={(e) => setPatternType(e.target.value)} value={patternType} style={buttonStyle}>
        <option value="random">Random Data</option>
        <option value="double_bottom">Double Bottom</option>
        <option value="volatility">High Volatility</option>
      </select>
      <button onClick={fetchPatternData} style={buttonStyle}>Fetch Pattern Data</button>

      <CandlestickChart displayData={displayData} symbol={symbol} />
      <h3>Total Portfolio Value: ${totalPortfolio.toFixed(2)}</h3>

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
      <a href='https://a.webull.com/NwcK53BxT9BKOwjEn5'> Get started with Webull! </a>
      <footer> Donate crypto! 3N73gLrHnLNNGFQNo8yF5xKB1r3mfyjRMF </footer>
    </div>
  );
};

export default Dashboard;
