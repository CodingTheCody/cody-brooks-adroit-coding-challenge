import {Aggregation} from '../types/Aggregation.type.ts';

export function getStartOfPeriod(date: Date, period: Aggregation): Date {
	const newDate = new Date(date.toISOString().split('T')[0]);

	if (period === 'Daily') {
		return new Date(newDate.toDateString());
	} else if (period === 'Weekly') {
		const day = newDate.getDay();
		return new Date(newDate.setDate(newDate.getDate() - day));
	} else if (period === 'Monthly') {
		return new Date(newDate.getFullYear(), newDate.getMonth(), 1);
	} else if (period === 'Quarterly') {
		const quarterStartMonth = Math.floor(newDate.getMonth() / 3) * 3;
		return new Date(newDate.getFullYear(), quarterStartMonth, 1);
	}
	return newDate;
}
