import os
import sqlite3
import numpy as np

# Path to the database
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../db/stocks.db'))

#collects prices list from database
def calculate_volatility(prices, period=14):
    #np.diff subtracts index value i from i+1 and returns a list i.e. np.diff[ 2 3 5] returns [1 2] & prices[:-1] returns all
    #except the last value of prices list or array
    daily_returns = np.diff(prices) / prices[:-1]
    volatility = np.std(daily_returns[-period:])
    return volatility

# Updated double bottom detection to handle multiple bottoms and return the symbol
def detect_double_bottoms(prices, dates, symbol, tolerance=0.0000125):
    double_bottoms = []  # To store multiple pairs of double bottoms (tuples of symbol, start and end dates)
    current_bottom = None  # Track the current lowest bottom
    bottom_index = []
    bottom_price = []
    
    for i in range(2, len(prices) - 2):
        #print(f"Checking index {i} with price {prices[i]} (previous: {prices[i-1]}, next: {prices[i+1]})")

        # Detect a potential bottom: price is lower than the previous and next day
        if prices[i] <= prices[i-1] and prices[i] < prices[i+1] and prices[i-1] <= prices[i-2] and prices[i+1] <= prices[i+2]:
            #print(f"Found potential bottom at index {i}, price {prices[i]}")
            bottom_index.append(i)
            bottom_price.append(prices[i])

            for bottom in range(len(bottom_index)):
                for second_bottom in range(bottom + 1, len(bottom_index)):
                    price_difference = abs(bottom_price[bottom] - bottom_price[second_bottom]) / bottom_price[bottom]
                    
                    if price_difference <= tolerance and second_bottom - bottom >= 5:
                        if bottom_price[bottom] not in double_bottoms :
                            #print(f"Price difference: {price_difference}, Tolerance: {tolerance}")                  
                            #print(f"Double bottom confirmed between indices {bottom} and {second_bottom}")
                            #print(f"Double bottom match between prices {bottom_price[bottom]} and {bottom_price[second_bottom]}")
                            #print(f"Double bottom confirmed between indices {bottom} and {second_bottom} already in list")
                            double_bottoms.append((symbol, dates[bottom - 2], dates[second_bottom]))
                        else:
                            print(f"Bottom at index {bottom} does not meet criteria (tolerance or distance).")
                            # Re-assign this as the new potential first bottom
                                                
    
    # Return the list of double bottom pairs (if any)
    if len(double_bottoms) > 0:
        print(f"Double bottoms found: {double_bottoms}")
        return double_bottoms
    else:
        print(f"No double bottoms found.")
        return []

def detect_and_store_patterns(symbol):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Fetch low prices and dates for the symbol
    cur.execute(f"SELECT low, date FROM stock_prices WHERE symbol = ? ORDER BY date ASC", (symbol,))
    rows = cur.fetchall()

    prices = [row[0] for row in rows]  # Using low prices    
    dates = [row[1] for row in rows]


    # Detect high volatility periods
    for i in range(14, len(prices), 14):
        lows = prices[i-14:i]  # Using low prices for volatility calculation
        volatility = calculate_volatility(lows)
        if volatility > 0.02:  # Threshold for high volatility
            cur.execute('''
                INSERT INTO high_volatility (symbol, start_date, end_date, volatility)
                VALUES (?, ?, ?, ?)
            ''', (symbol, dates[i-14], dates[i], volatility))

    # Detect double bottoms
    double_bottoms = detect_double_bottoms(prices, dates, symbol, tolerance=0.0018)
    if double_bottoms:
        for (symbol, first_bottom_date, second_bottom_date) in double_bottoms:
            cur.execute('''
                INSERT INTO double_bottoms (symbol, first_bottom_date, second_bottom_date)
                VALUES (?, ?, ?)
            ''', (symbol, first_bottom_date, second_bottom_date))

    conn.commit()
    conn.close()

# Example usage for multiple symbols
symbols = [
    'JNJ', 'UNH', 'PFE',  # Healthcare
    'JPM', 'BAC',  # Financials
    'TSLA', 'HD',  # Consumer Discretionary
    'XOM', 'CVX',  # Energy
    'VZ', 'T',  # Telecom
    'PG', 'KO',  # Consumer Staples
    'BA', 'CAT', # Industrials
    'NVDA','AAPL', 'MSFT', 'GOOGL', 'AMZN'  # Technology
]

for symbol in symbols:
    detect_and_store_patterns(symbol)

print("Patterns detected and stored.")
