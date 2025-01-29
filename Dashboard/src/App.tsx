import React, {useCallback, useState, useEffect} from 'react'
import './App.css'
import {StockTradeData} from './models/StockTradeData'
import {BarChart} from './components/BarChart.component.tsx';
import {Aggregation} from './types/Aggregation.type.ts';
import {Chart} from './types/Chart.type.ts';
import {TreeMap} from './components/TreeMap.component.tsx';


const fetchTrades = async (startTimestamp: string, minQuoteSize: number): Promise<StockTradeData[]> => {
	const url = new URL('https://localhost:44370/api/trades?' + new URLSearchParams({
		startTimestamp,
		minQuoteSize: minQuoteSize.toString()
	}).toString());
	const res = await fetch(url);
	return await res.json();

// TODO #1 : Fill out this method to fetch trades.
};

function App() {
	const [startDate, setStartDate] = useState(new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDay()).toISOString().split('T')[0])
	const [minSize, setMinSize] = useState(0)
	const [aggregation, setAggregation] = useState<Aggregation>('Weekly')
	const [chart, setChart] = useState<Chart>('TreeMap')
	const [trades, setTrades] = useState<StockTradeData[]>([]);

	const handleFetchTrades = useCallback(async () => {
		const trades = await fetchTrades(new Date(startDate).toISOString(), minSize)
		setTrades(trades);
	}, [minSize, startDate])

	const handleStartDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setStartDate(event.target.value);
	}, []);

	const handleMinSizeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setMinSize(parseInt(event.target.value));
	}, []);

	const handleAggregationChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
		const newAggregationValue = event.target.value as Aggregation;
		setAggregation(newAggregationValue);
	}, []);

	const handleChartChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
		const newChartValue = event.target.value as Chart;
		setChart(newChartValue);
	}, []);

	useEffect(() => {
		handleFetchTrades();
	}, [handleFetchTrades]);

	return (
		<>
			<div className="main-container">
				<div className="menu-container">
					<div className="input-group">
						<label>Start Date</label>
						<input type="date" id="start" name="trip-start" value={startDate} onChange={handleStartDateChange}/>
					</div>
					<div className="input-group">
						<label>Min Size</label>
						<input type="number" id="minSize" name="trip-start" value={minSize} onChange={handleMinSizeChange}/>
					</div>
					<div className="input-group">
						<label>Aggregation</label>
						<select name="aggregation" id="aggregation" onChange={handleAggregationChange} value={aggregation}>
							<option value="Daily">Daily (1 Day)</option>
							<option value="Weekly">Weekly (7 Days)</option>
							<option value="Monthly">Monthly (30 Days)</option>
							<option value="Quarterly">Quarterly (91 Days)</option>
						</select>
					</div>
					<div className="input-group">
						<label>Chart</label>
						<select name="chart" id="chart" onChange={handleChartChange} value={chart}>
							<option value="BarChart">Bar Chart</option>
							<option value="TreeMap">Tree Map</option>
						</select>
					</div>
					<button onClick={handleFetchTrades}>Go</button>
				</div>
				<div>
					<div className="chart-container">
						{chart === 'BarChart' && <BarChart data={trades} aggregation={aggregation}/>}
						{chart === 'TreeMap' && <TreeMap data={trades} aggregation={aggregation}/>}
					</div>
				</div>
			</div>
		</>
	)
}

export default App
