import { useCallback, useState } from 'react'
import './App.css'
import { StockTradeData } from './models/StockTradeData'

type Aggregation = "Daily" | "Weekly" | "Monthly" | "Quarterly"
type Chart = "BarChart" | "TreeMap"


const fetchTrades = async (startTimestamp: string, minQuoteSize: number): Promise<StockTradeData[]> => {
// TODO #1 : Fill out this method to fetch trades.
};

function App() {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDay()).toISOString().split('T')[0])
  const [minSize, setMinSize] = useState(0)
  const [aggregation, setAggregation] = useState<Aggregation>('Daily')
  const [chart, setChart] = useState<Chart>('BarChart')


  const handleFetchTrades = useCallback(async () => {
    var trades = await fetchTrades(new Date(startDate).toISOString(), minSize)



    // TODO #2 : After fetching trades, add any aggregation logic needed here to support the options below.
  }, [startDate, minSize])


  // TODO #3 : If the user changes the aggregation or chart type, you should update the display without making a call to get new data

  return (
    <>
      <div className='main-container'>
        <div className='menu-container'>
          <div className='input-group'>
            <label>Start Date</label>
            <input type="date" id="start" name="trip-start"/>
          </div>
          <div className='input-group'>
            <label>Min Size</label>
            <input type="number" id="minSize" name="trip-start"/>
          </div>
          <div className='input-group'>
            <label>Aggregation</label>
            <select name="aggregation" id="aggregation">
              <option value="Daily">Daily (1 Day)</option>
              <option value="Weekly">Weekly (7 Days)</option>
              <option value="Monthly">Monthly (30 Days)</option>
              <option value="Quarterly">Quarterly (91 Days)</option>
            </select>
          </div>
          <div className='input-group'>
            <label>Chart</label>
            <select name="chart" id="chart">
              <option value="BarChart">Bar Chart</option>
              <option value="TreeMap">Tree Map</option>
            </select>
          </div>
          <button>Go</button>
        </div>
        <div>
          <div className='chart-container'>
            Chart Goes Here
          </div>
        </div>
      </div>
    </>
  )
}

export default App
