import * as d3 from 'd3';
import {StockTradeData} from '../models/StockTradeData.tsx';
import {Aggregation} from '../types/Aggregation.type.ts';
import {useRef, useEffect, useCallback} from 'react';
import {InternMap} from 'd3';

interface IAggregateData {
	name: string;
	size: number;
}

function aggregateData(trades: StockTradeData[]): IAggregateData[] {
	const grouped: InternMap<string, number | StockTradeData[]> = d3.group(trades, (d) => d.symbol) as InternMap<string, number | StockTradeData[]>;

	for (const group of grouped.entries()) {
		grouped.set(group[0], d3.sum((group[1] as StockTradeData[]).values(), (d) => d.size * d.price));
	}
	return Array.from(grouped).map(([name, size]) => ({name, size: parseInt(size.toString())}));
}

export function TreeMap(props: { data: StockTradeData[], aggregation: Aggregation }) {
	const svgRef = useRef<SVGSVGElement>(null);

	const updateChart = useCallback(() => {
		const svgElement = svgRef.current;
		if (!svgElement || !props.data || props.data.length === 0) return;


		const svg = d3
			.select(svgElement)
			.attr('width', 1154)
			.attr('height', 1154);

		const data = aggregateData(props.data);


		// Specify the chart’s dimensions.
		const width = 1154;
		const height = 1154;
		const sum = data.reduce((s, i) => s + i.size, 0);

		// Specify the color scale.
		// const color = d3.scaleOrdinal(data.children.map(d => d.id.split("/").at(-1)), d3.schemeTableau10);

		// Compute the layout.

		const bounds = {top: 0, left: 0, right: width, bottom: height};

		let weightLeft = sum;
		let x, y, w, h;

		const colorRange = ['#e31a1c', '#1f78b4', '#ff7f00', '#b2df8a', '#87843b', '#fb9a99', '#8dd3c7']

		data.forEach((d, index) => {
			const hSpace = bounds.right - bounds.left;
			const vSpace = bounds.bottom - bounds.top;
			x = bounds.left;
			y = bounds.top;
			if (hSpace > vSpace) {
				w = (d.size / weightLeft) * hSpace;
				h = vSpace;
				bounds.left = x + w;
			} else {
				w = hSpace;
				h = (d.size / weightLeft) * vSpace;
				bounds.top = y + h;
			}
			weightLeft -= d.size;

			svg.append('rect')
				.attr('x', x)
				.attr('y', y)
				.attr('width', w)
				.attr('height', h)
				.style('fill', () => colorRange[index])
				.style('stroke', 'white')
				.style('stroke-width', 3)
			svg.append('text')
				.html(`${d.name}`)
				.attr('x', x + w / 2)
				.attr('y', y + h / 2)
				.attr('text-anchor', 'middle')
				.attr('alignment-baseline', 'middle')
				.style('fill', 'white')
			svg.append('text')
				.text(d.size)
				.attr('x', x + w / 2)
				.attr('y', y + h / 2 + 20)
				.attr('text-anchor', 'middle')
				.attr('alignment-baseline', 'middle')
				.style('fill', 'white')
		});

	}, [props.data]);

	useEffect(() => {
		const svgElement = svgRef.current;
		if (!svgElement) return;

		updateChart();
	}, [props.data, updateChart]);

	return (
		<svg ref={svgRef}></svg>
	);
}
