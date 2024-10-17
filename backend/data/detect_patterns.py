import os
import sqlite3
import numpy as np

# Path to the database
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../db/stocks.db'))

def calculate_volatility(prices, period=14):
    daily_returns = np.diff(prices) / prices[:-1]
    volatility = np.std(daily_returns[-period:])
    return volatility

def detect_double_bottoms(prices, dates, tolerance=0.5):
    bottoms = []
    
    for i in range(1, len(prices) - 1):
        print(f"Checking index {i} with price {prices[i]} (previous: {prices[i-1]}, next: {prices[i+1]})")
        
        # Detect a bottom: price is lower than the previous and next day
        if prices[i] < prices[i-1] and prices[i] < prices[i+1]:
            print(f"Found potential bottom at index {i}, price {prices[i]}")
            
            # If a previous bottom exists, check if the current bottom is within the tolerance range
            if len(bottoms) > 0:
                previous_bottom_index = bottoms[-1]
                previous_bottom_price = prices[previous_bottom_index]
                
                print(f"Comparing with previous bottom at index {previous_bottom_index}, price {previous_bottom_price}")
                
                # Adjust the tolerance to check the relative percentage difference
                price_difference = abs(prices[i] - previous_bottom_price) / previous_bottom_price
                print(f"Price difference: {price_difference}, Tolerance: {tolerance}")
                
                # Check if the two bottoms are within the tolerance percentage
                if price_difference <= tolerance:
                    print(f"Bottom at index {i} is within tolerance: {tolerance}")
                    
                    # Ensure there's a gap of at least 5 days between the two bottoms
                    if i - previous_bottom_index > 5:
                        print(f"Bottoms are more than 5 indices apart: adding index {i}")
                        bottoms.append(i)
                else:
                    print(f"Bottom at index {i} is NOT within tolerance.")
            else:
                # Add the first bottom
                print(f"Adding first bottom at index {i}")
                bottoms.append(i)
    
    # Return the timestamps of the two bottoms if we have exactly two; otherwise, return an empty list
    if len(bottoms) == 2:
        print(f"Double bottom found at indices: {bottoms}")
        return [dates[bottoms[0]], dates[bottoms[1]]]
    else:
        print(f"No double bottom found. Bottoms detected: {bottoms}")
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
    for i in range(14, len(prices)):
        lows = prices[i-14:i]  # Using low prices for volatility calculation
        volatility = calculate_volatility(lows)
        if volatility > 0.02:  # Threshold for high volatility
            cur.execute('''
                INSERT INTO high_volatility (symbol, start_date, end_date, volatility)
                VALUES (?, ?, ?, ?)
            ''', (symbol, dates[i-14], dates[i], volatility))

    # Detect double bottoms
    double_bottom_dates = detect_double_bottoms(prices, dates, tolerance=0.5)
    if double_bottom_dates:
        cur.execute('''
            INSERT INTO double_bottoms (symbol, first_bottom_date, second_bottom_date)
            VALUES (?, ?, ?)
        ''', (symbol, double_bottom_dates[0], double_bottom_dates[1]))

    conn.commit()
    conn.close()

# API fetch function to return patterns by timestamp, not indices
def fetch_pattern_by_type(pattern_type):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    if pattern_type == 'double_bottom':
        cur.execute("SELECT symbol, first_bottom_date FROM double_bottoms ORDER BY RANDOM() LIMIT 1")
    elif pattern_type == 'volatility':
        cur.execute("SELECT symbol, start_date FROM high_volatility ORDER BY RANDOM() LIMIT 1")

    result = cur.fetchone()
    if result:
        symbol, timestamp = result
        conn.close()
        return {'symbol': symbol, 'timestamp': timestamp}  # Return timestamp instead of index
    else:
        conn.close()
        return {'error': 'No patterns found.'}, 404

# Detect and store patterns for multiple symbols
symbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA',  # Technology
    'JNJ', 'UNH', 'PFE',  # Healthcare
    'JPM', 'BAC',  # Financials
    'TSLA', 'HD',  # Consumer Discretionary
    'XOM', 'CVX',  # Energy
    'VZ', 'T',  # Telecom
    'PG', 'KO',  # Consumer Staples
    'BA', 'CAT'  # Industrials
]

for symbol in symbols:
    detect_and_store_patterns(symbol)

print("Patterns detected and stored.")
