import {StockTradeData} from '../models/StockTradeData.tsx';
import {useRef, useEffect, useCallback, useState} from 'react';
import * as d3 from 'd3';
import {Aggregation} from '../types/Aggregation.type.ts';
import {getStartOfPeriod} from '../helpers/getStartOfPeriod.ts';
import './BarChart.component.css';

// Aggregation function
function aggregateData(trades: StockTradeData[], period: Aggregation) {
	return d3.rollups(
		trades,
		(group) => d3.sum(group, (d) => d.size * d.price), // Calculate total value exchanged
		(d) => getStartOfPeriod(new Date(d.timestamp), period).toISOString(),
	);
}

const margin = {top: 20, right: 30, bottom: 80, left: 50};
const width = 1200 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;


export function BarChart(props: { data: StockTradeData[], aggregation: Aggregation }) {
	const [pageIndex, setPageIndex] = useState(0);
	const [pageCount, setPageCount] = useState(1);
	const [resultsPerPage] = useState(10);
	const svgRef = useRef<SVGSVGElement>(null);

	const handlePreviousPage = useCallback(() => {
		setPageIndex(Math.max(0, pageIndex - 1));
	}, [pageIndex]);

	const handleNextPage = useCallback(() => {
		setPageIndex(Math.min(pageCount - 1, pageIndex + 1));
	}, [pageIndex, pageCount]);

	const handleSetPage = useCallback((pageIndex: number) => {
		if (isNaN(pageIndex)) pageIndex = 0;
		setPageIndex(Math.min(pageCount - 1, pageIndex));
	}, [pageCount]);

	const updateChart = useCallback(() => {
		const svgElement = svgRef.current;
		if (!svgElement || !props.data || props.data.length === 0) return;


		const svg = d3
			.select(svgElement);

		const aggregatedData = aggregateData(props.data, props.aggregation);
		setPageCount(Math.ceil(aggregatedData.length / resultsPerPage));

		// Transform data for chart display
		let data = aggregatedData.map(([period, total]) => ({
			period: new Date(period),
			total,
		}));

		// Calculate pagination
		data = data.slice(pageIndex * resultsPerPage, (pageIndex + 1) * resultsPerPage);

		// Sort data by period
		data.sort((a, b) => a.period.getTime() - b.period.getTime());

		const x = d3.scaleBand().range([0, width]).padding(0.1);
		const y = d3.scaleLinear().range([height, 0]);

		// Update scales
		x.domain(data.map((d) => d.period as unknown as string));
		const yDomain = y.domain([0, d3.max(data, (d) => d.total)!]).nice();

		// Update axes
		svg
			.select('.x-axis')
			// (There is a mismatch with my version of d3 and the types, causing errors that don't happen at runtime)
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			.call(
				d3
					.axisBottom(x)
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					.tickFormat(d3.timeFormat(props.aggregation === 'Daily' ? '%b %d' : '%b %d, %Y')),
			)
			// .attr('transform', 'translate(50, 0)')
			.selectAll('text')
			.attr('transform', 'rotate(-45)')
			.style('text-anchor', 'end');


		// add the y axis
		svg.select('.y-axis').call(
			// (There is a mismatch with my version of d3 and the types, causing errors that don't happen at runtime)
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			d3.axisLeft(yDomain)
				.tickFormat((d) => {
					return d3.format('.2s')(d as number);
				})
		)


		// Update bars
		const bars = svg
			.selectAll('.bar')
			.data(data);

		bars
			.join('rect')
			.attr('class', 'bar')
			.transition()
			.duration(750)
			.attr('x', (d) => x(d.period as unknown as string)!)
			.attr('y', (d) => y(d.total)!)
			.attr('width', x.bandwidth())
			.attr('transform', 'translate(50, 0)')
			.attr('height', (d) => height - y(d.total))
			.attr('fill', 'steelblue');

		svg.select('.y-axis')
			.attr('transform', 'translate(50, 0)')

		svg.enter();
	}, [props.aggregation, props.data, pageIndex, resultsPerPage]);

	// Reset page index when data changes
	useEffect(() => {
		setPageIndex(0);
	}, [props.data, props.aggregation]);

	useEffect(() => {
		updateChart();
	}, [updateChart, props.aggregation, props.data, pageIndex, resultsPerPage, pageCount]);

	useEffect(() => {
		const svgElement = svgRef.current;
		if (!svgElement) return;

		const svg = d3
			.select(svgElement)
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g');

		svg.append('g').attr('class', 'x-axis').attr('transform', `translate(50,${height})`);
		svg.append('g').attr('class', 'y-axis').attr('transform', `translate(50,0)`);

		updateChart();
	}, [updateChart]);
	return (
		<div className="bar-chart-component">
			<svg ref={svgRef}></svg>
			<br/>
			Page: {pageIndex + 1} of {pageCount}
			<button disabled={pageIndex === 0} className="previous-page" onClick={handlePreviousPage}>{'<'}</button>
			<input style={{width: '30px', textAlign: 'center'}} value={pageIndex + 1}
				   onChange={(e) => handleSetPage(parseInt(e.target.value) - 1)}/>
			<button disabled={pageIndex + 1 === pageCount} className="next-page" onClick={handleNextPage}>{'>'}</button>
		</div>
	)
}
