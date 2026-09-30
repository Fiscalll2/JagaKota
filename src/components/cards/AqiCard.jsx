import React from "react";
import { Wind } from "lucide-react";
import { getAqiInfo } from "../../utils/aqi";
import { translations } from "../../utils/i18n";

export function AqiCard({ data }) {
	const t = translations;

	const current = data?.current || {};
	const aqi = Number(current.aqi) || 0;
	const aqiInfo = getAqiInfo(aqi);

	// Position percentage on standard 0-500 AQI scale
	const needlePercent = Math.min(100, Math.max(0, (aqi / 500) * 100));

	return (
		<div className="flat-card p-6">
			{/* Header */}
			<div className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div
						className="flex h-8 w-8 items-center justify-center rounded-(--radius-full) text-white"
						style={{ backgroundColor: aqiInfo.color }}
					>
						<Wind size={18} strokeWidth={2.5} />
					</div>
					<h3 className="m-0 text-[1.05rem] font-extrabold text-(--text-main)">
						{t.aqiTitle}
					</h3>
				</div>
				<span
					className="rounded-sm px-2.5 py-0.75 text-xs font-extrabold text-white"
					style={{ backgroundColor: aqiInfo.color }}
				>
					{aqiInfo.label}
				</span>
			</div>

			{/* Main AQI Numeric Readout */}
			<div className="mx-0 mt-[0.85rem] mb-2 flex items-baseline gap-[0.85rem]">
				<div
					className="text-[3.4rem] leading-none font-extrabold tracking-[-0.04em]"
					style={{ color: aqiInfo.color }}
				>
					{current.aqi !== undefined && current.aqi !== null
						? current.aqi
						: "--"}
				</div>
				<div>
					<strong className="block text-[1.15rem] leading-[1.2] font-extrabold text-(--text-main)">
						{aqiInfo.label}
					</strong>
					<span className="text-xs font-semibold text-(--text-muted)">
						Indeks partikulat polusi aktif
					</span>
				</div>
			</div>

			{/* Official 0-500 Continuous Gauge Scale Bar with Needle Position Marker */}
			<div className="mx-0 mt-5 mb-2">
				<div
					className="relative h-2.5 w-full rounded border border-black/10 bg-[linear-gradient(to_right,#10b981_0%,#10b981_10%,#eab308_10%,#eab308_20%,#f97316_20%,#f97316_30%,#ef4444_30%,#ef4444_40%,#a855f7_40%,#a855f7_60%,#7f1d1d_60%,#7f1d1d_100%)]"
					title={`Posisi AQI: ${aqi} dari skala 500`}
				>
					{/* Vertical Needle / Pointer Indicator */}
					<div
						className="absolute -top-1.5 h-5.5 w-1 -translate-x-1/2 rounded-sm border border-white bg-(--text-main)"
						style={{
							left: `${needlePercent}%`,
							transition:
								"left 600ms cubic-bezier(0.16, 1, 0.3, 1)",
							boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
						}}
					/>
				</div>

				{/* Scale Ticks / Threshold Indicators */}
				<div className="mt-[0.45rem] flex justify-between text-[0.675rem] font-semibold text-(--text-muted)">
					<span>0 Baik</span>
					<span>100 Sedang</span>
					<span>150 Sensitif</span>
					<span>200 Bahaya</span>
					<span>500 Max</span>
				</div>
			</div>

			{/* Advice */}
			<p className="mx-0 mt-[0.85rem] mb-[1.15rem] text-[0.825rem] leading-[1.45] font-medium text-(--text-muted)">
				{aqiInfo.advice}
			</p>

			{/* Pollutant Breakdown Grid */}
			<div className="grid grid-cols-4 gap-2">
				<div className="rounded-sm border-2 border-(--border-flat) bg-(--bg-muted) px-[0.35rem] py-2 text-center">
					<span className="text-[0.675rem] font-bold text-(--text-muted)">
						PM2.5
					</span>
					<div className="text-sm font-extrabold text-(--text-main)">
						{current.pm25 ?? 0}
					</div>
				</div>
				<div className="rounded-sm border-2 border-(--border-flat) bg-(--bg-muted) px-[0.35rem] py-2 text-center">
					<span className="text-[0.675rem] font-bold text-(--text-muted)">
						PM10
					</span>
					<div className="text-sm font-extrabold text-(--text-main)">
						{current.pm10 ?? 0}
					</div>
				</div>
				<div className="rounded-sm border-2 border-(--border-flat) bg-(--bg-muted) px-[0.35rem] py-2 text-center">
					<span className="text-[0.675rem] font-bold text-(--text-muted)">
						NO₂
					</span>
					<div className="text-sm font-extrabold text-(--text-main)">
						{current.no2 ?? 0}
					</div>
				</div>
				<div className="rounded-sm border-2 border-(--border-flat) bg-(--bg-muted) px-[0.35rem] py-2 text-center">
					<span className="text-[0.675rem] font-bold text-(--text-muted)">
						SO₂
					</span>
					<div className="text-sm font-extrabold text-(--text-main)">
						{current.so2 ?? 0}
					</div>
				</div>
			</div>
		</div>
	);
}
