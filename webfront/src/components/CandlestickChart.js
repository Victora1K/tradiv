import React, { useState } from 'react';
import Plot from 'react-plotly.js';

const CandlestickChart = ({ displayData, symbol }) => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    // Toggle theme function
    const toggleTheme = () => {
        setIsDarkTheme(prevTheme => !prevTheme);
    };

    // Define the layout for dark and light themes
    const darkThemeLayout = {
        title: {
            text: `${symbol} Candlestick Chart`,
            font: { color: '#FFFFFF' },
        },
        xaxis: {
            title: 'Date',
            color: '#FFFFFF',
            tickfont: { color: '#FFFFFF' },
            gridcolor: '#444444',
        },
        yaxis: {
            title: 'Price',
            color: '#FFFFFF',
            tickfont: { color: '#FFFFFF' },
            gridcolor: '#444444',
        },
        margin: { l: 50, r: 50, t: 50, b: 50 },
        paper_bgcolor: '#1e1e1e',
        plot_bgcolor: '#222222',
        showlegend: false,
        bordercolor: '#FFFFFF',
        borderwidth: 2,
    };

    const lightThemeLayout = {
        title: {
            text: `${symbol} Candlestick Chart`,
            font: { color: '#000000' },
        },
        xaxis: {
            title: 'Date',
            color: '#000000',
            tickfont: { color: '#000000' },
            gridcolor: '#e0e0e0',
        },
        yaxis: {
            title: 'Price',
            color: '#000000',
            tickfont: { color: '#000000' },
            gridcolor: '#e0e0e0',
        },
        margin: { l: 50, r: 50, t: 50, b: 50 },
        paper_bgcolor: '#f4f4f4',
        plot_bgcolor: '#ffffff',
        showlegend: false,
        bordercolor: '#000000',
        borderwidth: 2,
    };

    return (
        <div>
            {/* Theme Toggle Button */}
            <button style={ThemeStyle} onClick={toggleTheme}>
                Switch to {isDarkTheme ? 'Light' : 'Dark'} Theme
            </button>

            {/* Plotly Candlestick Chart */}
            <Plot
                data={[
                    {
                        x: displayData.dates,
                        open: displayData.open,
                        high: displayData.high,
                        low: displayData.low,
                        close: displayData.close,
                        type: 'candlestick',
                        xaxis: 'x',
                        yaxis: 'y',
                    },
                ]}
                layout={isDarkTheme ? darkThemeLayout : lightThemeLayout}
                config={{
                    displayModeBar: false, // Hide the plotly toolbar for a cleaner look
                }}
            />
        </div>
    );
};

const ThemeStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#f5f5f5',
  color: 'black',
};

export default CandlestickChart;
