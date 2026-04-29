import React from 'react';

export default function InfoDatoCard({
	label,
	value,
	containerClassName = 'rounded-2xl border border-slate-200 p-4',
	valueClassName = 'mt-2 text-base font-semibold text-slate-800',
	valueWrapperClassName = '',
}) {
	return (
		<div className={containerClassName}>
			<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
			<div className={valueWrapperClassName}>
				<p className={valueClassName}>{value}</p>
			</div>
		</div>
	);
}
