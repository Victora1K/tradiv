
import Card from '../UI/Card';
import { Form, Button, Row, Col } from 'react-bootstrap';
import DataScrambler from '../components/DataScrambler';
import RecordScreen from './RecordScreen';
import React, { useState, useMemo } from "react";
import * as d3 from "d3";
import Chart from "../components/Chart";

function TestScreen() {
  const [style, setStyle] = useState('')
    const [badTrade, setBadTrades] = useState('')

    const submitHandler = (e) => {
        e.preventDefault()
        console.log('Submitted')
    }
    return (
        <div className='content'> 
            <h2> Survey </h2>
            <Form onSubmit={submitHandler}>
                <Form.Group controlId='Style'>

                    <label onChange={(e) => setStyle(e.target.value)}>
                        Pick your preferred hold period:
                        <select>
                            <option value="3"> A few minutes</option>
                            <option value="5">45 minutes to several hours</option>
                            <option value="7"> Half a day, overnight, few days</option>
                            <option value="9">Weeks to months</option>
                        </select>
                    </label>

                </Form.Group>


                <Form.Group controlId='Bad trades'>

                    <label>
                        Select tendency when trade goes against you :
                        <select onChange={(e) => setBadTrades(e.target.value)}>
                            <option value="3"> Close, automatic stop loss set</option>
                            <option value="5">Watch, for bounce areas & resistance ranges</option>
                            <option value="7"> Trim position, size down</option>
                            <option value="9">Add to position to recover some losses</option>
                        </select>
                    </label>


                </Form.Group>

                <Button type='submit' variant='dark'>
                    Submit
                </Button>
            </Form>
            <strong>
                Scenarios & Recommendations
                <li>
                    Time Frames: SCenrio recommendations based on conditions in timeframe
                    Plan: 
                </li>
                <li>
                size: Entry conditions determine full port vs portiion
                Plan: Low risk (1-10%) Medium risk (5-30%) High risk (30+%)
                </li>
                <li>
                size
                Options DTM Range (Distance to Money)
                <ul>CLose range for low expected moves or potentially slow moves</ul>
                <ul>OTM contracts for long range expected moves: Also potentially calculate contract premiums </ul>
                </li>
            </strong>
            <h2>
                Cycles & Conditions
            </h2>
            <li>
                How to Think About Trade Cycles & Why Daily Trades should have nothing to do with a
                24hr schedule or a 6 hr market schedule
               
                <title>Movement cycles is divided into: </title>
                    <li>
                        Long swings of upward and downward motion

                    </li>
                    <li>
                        Alternating periods of expansions/rallies and compressions/consolidation
                    </li>
                
            </li>
            <div>
            <text>
                    ******   Can't look to make the same profits day after day if market is working on a different cycle 
                    (unless you're focused on very tiny percent gains i.e high capital/risk)
                    Don't be greedy, cycles repeat, wait for the right time and make double your target 
                    with only a fraction of the usual investment ******
                </text>
                </div>
            <h2>
                Movement Based Traders
            </h2>
            
                <li>
                    Bullish - Fast (strong rallies w/ minimal pullbacks)
                </li>
                <li>
                    Bullish - Gradual (Pullbacks/Flags & bounces to ema, vwap, resistance etc.)
                </li>
                <li>
                    Bullish - slow (usually a lead up to bullish-fast)
                </li>
                <li>
                    Neutral - theta burning attempts (contract sellers)
                </li>
                <li>
                    Bearish - Exhaustion (free fall, bounce at resistance then more free fall)
                </li>
                <li>
                    News based - high volaitility moves after news release follewed
                    by short-term reversal/profit taking or consolidation
                </li>
            
                </div>


    )
}

export default TestScreen;
