import os
import sqlite3
import numpy as np

# Path to the database
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../db/stocks.db'))

def calculate_volatility(prices, period=14):
    daily_returns = np.diff(prices) / prices[:-1]
    volatility = np.std(daily_returns[-period:])
    return volatility

# Updated double bottom detection to handle multiple bottoms and return the symbol
def detect_double_bottoms(prices, dates, symbol, tolerance=0.05):
    double_bottoms = []  # To store multiple pairs of double bottoms (tuples of symbol, start and end dates)
    current_bottom = None  # Track the current lowest bottom
    
    for i in range(1, len(prices) - 1):
        print(f"Checking index {i} with price {prices[i]} (previous: {prices[i-1]}, next: {prices[i+1]})")

        # Detect a potential bottom: price is lower than the previous and next day
        if prices[i] <= prices[i-1] and prices[i] < prices[i+1]:
            print(f"Found potential bottom at index {i}, price {prices[i]}")

            # If we haven't locked in the first bottom, set it to current
            if current_bottom is None:
                print(f"Setting current bottom to index {i}, price {prices[i]}")
                current_bottom = i

            # If we already have a locked first bottom, check for a second bottom within tolerance
            elif current_bottom is not None:
                previous_bottom_price = prices[current_bottom]
                current_price = prices[i]
                
                # Calculate the price difference relative to the first bottom
                price_difference = abs(current_price - previous_bottom_price) / previous_bottom_price
                print(f"Comparing second bottom at index {i} with first bottom at index {current_bottom}")
                print(f"Price difference: {price_difference}, Tolerance: {tolerance}")

                # Check if the current bottom is within tolerance and more than 5 candles apart
                if price_difference <= tolerance and i - current_bottom >= 2:
                    print(f"Double bottom confirmed between indices {current_bottom} and {i}")

                    # Store the pair of bottoms (symbol, dates of the two bottoms)
                    double_bottoms.append((symbol, dates[current_bottom], dates[i]))

                    # Reset current_bottom to None to search for more double bottoms
                    current_bottom = None
                else:
                    print(f"Bottom at index {i} does not meet criteria (tolerance or distance).")
                    current_bottom = i  # Re-assign this as the new potential first bottom
    
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
    for i in range(14, len(prices)):
        lows = prices[i-14:i]  # Using low prices for volatility calculation
        volatility = calculate_volatility(lows)
        if volatility > 0.02:  # Threshold for high volatility
            cur.execute('''
                INSERT INTO high_volatility (symbol, start_date, end_date, volatility)
                VALUES (?, ?, ?, ?)
            ''', (symbol, dates[i-14], dates[i], volatility))

    # Detect double bottoms
    double_bottoms = detect_double_bottoms(prices, dates, symbol, tolerance=0.05)
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
