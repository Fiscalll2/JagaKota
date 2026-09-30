import React, { useState } from "react";
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ReferenceLine,
} from "recharts";
import { Activity, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { getAqiInfo } from "../../utils/aqi";
import { translations } from "../../utils/i18n";

export function AqiChart({ hourlyData }) {
	const [metric, setMetric] = useState("aqi"); // 'aqi' | 'pm25'
	const t = translations;

	if (!hourlyData || !hourlyData.time || !hourlyData.us_aqi) {
		return (
			<div className="flat-card flex min-h-55 items-center justify-center p-6">
				<p className="text-[0.85rem] font-semibold text-(--text-muted)">
					Data riwayat tren kualitas udara belum tersedia.
				</p>
			</div>
		);
	}

	// Format 24-hour data
	const chartData = hourlyData.time.slice(0, 24).map((timeStr, index) => {
		const d = new Date(timeStr);
		const hour = d.getHours().toString().padStart(2, "0") + ":00";
		const aqiVal = Math.round(
			hourlyData.us_aqi ? hourlyData.us_aqi[index] : 0,
		);
		const pm25Val =
			Math.round((hourlyData.pm2_5 ? hourlyData.pm2_5[index] : 0) * 10) /
			10;
		const aqiMeta = getAqiInfo(aqiVal);

		const offset = d.getTimezoneOffset();
		const tzName =
			offset === -420
				? "WIB"
				: offset === -480
					? "WITA"
					: offset === -540
						? "WIT"
						: "WIB";

		return {
			time: hour,
			fullTime: `${hour} ${tzName}`,
			aqi: aqiVal,
			pm25: pm25Val,
			label: aqiMeta.label,
			color: aqiMeta.color,
			advice: aqiMeta.advice,
		};
	});

	// Calculate 24-Hour Highlights
	const aqiValues = chartData.map((d) => d.aqi);
	const avgAqi = Math.round(
		aqiValues.reduce((a, b) => a + b, 0) / (aqiValues.length || 1),
	);
	const avgInfo = getAqiInfo(avgAqi);

	let maxItem = chartData[0];
	let minItem = chartData[0];

	chartData.forEach((item) => {
		if (item.aqi > maxItem.aqi) maxItem = item;
		if (item.aqi < minItem.aqi) minItem = item;
	});

	// Active Metric Colors
	const isAqi = metric === "aqi";
	const strokeColor = isAqi ? avgInfo.color : "#0284c7";
	const gradientId = isAqi ? "dynamicAqiGradient" : "dynamicPm25Gradient";

	// Custom Rich Tooltip
	const CustomTooltip = ({ active, payload }) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="min-w-47.5 rounded-md border-2 border-(--border-flat) bg-(--bg-card) px-[0.95rem] py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
					<div className="mb-[0.35rem] flex items-center justify-between border-b border-(--border-flat) pb-1">
						<span className="flex items-center gap-1 text-xs font-extrabold text-(--text-main)">
							<Clock size={12} /> {data.fullTime}
						</span>
						<span
							className="rounded px-1.5 py-0.5 text-[0.675rem] font-extrabold"
							style={{
								backgroundColor: `${data.color}22`,
								color: data.color,
							}}
						>
							{data.label}
						</span>
					</div>

					<div className="mx-0 my-[0.35rem] flex flex-col gap-1">
						<div className="flex items-baseline justify-between">
							<span className="text-xs font-semibold text-(--text-muted)">
								Indeks AQI:
							</span>
							<strong
								className="text-[0.95rem] font-black"
								style={{ color: data.color }}
							>
								{data.aqi}
							</strong>
						</div>
						<div className="flex items-baseline justify-between">
							<span className="text-xs font-semibold text-(--text-muted)">
								PM2.5:
							</span>
							<strong className="text-[0.85rem] font-extrabold text-(--text-main)">
								{data.pm25} µg/m³
							</strong>
						</div>
					</div>

					<div className="mt-[0.35rem] border-t border-dashed border-(--border-flat) pt-[0.3rem] text-[0.675rem] leading-[1.3] text-(--text-muted)">
						{data.advice}
					</div>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="flat-card p-6">
			{/* Header with Title & Metric Switcher */}
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-[0.55rem]">
					<div className="flex h-8 w-8 items-center justify-center rounded-(--radius-full) bg-[rgba(59,130,246,0.12)] text-primary-hover">
						<Activity size={18} strokeWidth={2.5} />
					</div>
					<div>
						<h3 className="m-0 text-[1.05rem] font-extrabold text-(--text-main)">
							{t.aqiTrend || "Tren Kualitas Udara (24 Jam)"}
						</h3>
						<span className="text-[0.725rem] font-semibold text-(--text-muted)">
							Riwayat Polutan & Indeks Standar Kualitas Udara
							(US-EPA & ISPU)
						</span>
					</div>
				</div>

				{/* Metric Selector Buttons */}
				<div className="flex gap-[0.3rem] rounded-sm bg-(--bg-muted) p-0.75">
					<button
						onClick={() => setMetric("aqi")}
						className={`cursor-pointer rounded-sm px-2.5 py-1 text-xs font-extrabold ${metric === "aqi" ? "border border-primary bg-(--bg-card) text-primary" : "border-0 bg-transparent text-(--text-muted)"}`}
					>
						{t.metricAqi || "Indeks AQI"}
					</button>
					<button
						onClick={() => setMetric("pm25")}
						className={`cursor-pointer rounded-sm px-2.5 py-1 text-xs font-extrabold ${metric === "pm25" ? "border border-[#0284c7] bg-(--bg-card) text-[#0284c7]" : "border-0 bg-transparent text-(--text-muted)"}`}
					>
						PM2.5 (µg/m³)
					</button>
				</div>
			</div>

			{/* 24-Hour Highlights Metric Bar */}
			<div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
				{/* Average AQI */}
				<div className="rounded-sm border-2 border-(--border-flat) bg-(--bg-muted) px-3 py-[0.55rem]">
					<span className="block text-[0.675rem] font-bold text-(--text-muted)">
						{t.avg24h || "Rata-rata 24 Jam"}
					</span>
					<div className="mt-0.5 flex items-baseline gap-1.5">
						<strong
							className="text-base font-black"
							style={{ color: avgInfo.color }}
						>
							{isAqi
								? avgAqi
								: `${(chartData.reduce((a, b) => a + b.pm25, 0) / chartData.length).toFixed(1)}`}
						</strong>
						<span
							className="text-[0.7rem] font-bold"
							style={{ color: avgInfo.color }}
						>
							{isAqi ? `(${avgInfo.label})` : "µg/m³"}
						</span>
					</div>
				</div>

				{/* Peak Pollution (Highest) */}
				<div className="rounded-sm border-2 border-(--border-flat) bg-(--bg-muted) px-3 py-[0.55rem]">
					<div className="flex items-center gap-0.75">
						<TrendingUp size={12} color="#ef4444" />
						<span className="text-[0.675rem] font-bold text-(--text-muted)">
							{t.peak24h || "Puncak Tertinggi"}
						</span>
					</div>
					<div className="mt-0.5 flex items-baseline gap-1.5">
						<strong
							className="text-base font-black"
							style={{ color: maxItem.color }}
						>
							{isAqi ? maxItem.aqi : `${maxItem.pm25}`}
						</strong>
						<span className="text-[0.7rem] font-semibold text-(--text-muted)">
							pukul {maxItem.time}
						</span>
					</div>
				</div>

				{/* Cleanest Air (Lowest) */}
				<div className="rounded-sm border-2 border-(--border-flat) bg-(--bg-muted) px-3 py-[0.55rem]">
					<div className="flex items-center gap-0.75">
						<TrendingDown size={12} color="#10b981" />
						<span className="text-[0.675rem] font-bold text-(--text-muted)">
							{t.clean24h || "Terendah / Terbersih"}
						</span>
					</div>
					<div className="mt-0.5 flex items-baseline gap-1.5">
						<strong
							className="text-base font-black"
							style={{ color: minItem.color }}
						>
							{isAqi ? minItem.aqi : `${minItem.pm25}`}
						</strong>
						<span className="text-[0.7rem] font-semibold text-(--text-muted)">
							pukul {minItem.time}
						</span>
					</div>
				</div>
			</div>

			{/* Main Chart Canvas */}
			<div className="h-48.75 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={chartData}
						margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
					>
						<defs>
							<linearGradient
								id="dynamicAqiGradient"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="5%"
									stopColor={strokeColor}
									stopOpacity={0.45}
								/>
								<stop
									offset="95%"
									stopColor={strokeColor}
									stopOpacity={0.0}
								/>
							</linearGradient>
							<linearGradient
								id="dynamicPm25Gradient"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="5%"
									stopColor="#0284c7"
									stopOpacity={0.45}
								/>
								<stop
									offset="95%"
									stopColor="#0284c7"
									stopOpacity={0.0}
								/>
							</linearGradient>
						</defs>

						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--border-flat)"
							vertical={false}
						/>

						<XAxis
							dataKey="time"
							stroke="var(--text-muted)"
							fontSize={11}
							fontWeight={600}
							tickLine={false}
							interval="preserveStartEnd"
						/>

						<YAxis
							stroke="var(--text-muted)"
							fontSize={11}
							fontWeight={600}
							tickLine={false}
							domain={[0, "auto"]}
						/>

						{/* Standard Threshold Reference Line for Moderate AQI (50) and Unhealthy (150) */}
						{isAqi && (
							<ReferenceLine
								y={50}
								stroke="#10b981"
								strokeDasharray="2 2"
								opacity={0.6}
							/>
						)}
						{isAqi && (
							<ReferenceLine
								y={100}
								stroke="#eab308"
								strokeDasharray="2 2"
								opacity={0.6}
							/>
						)}
						{isAqi && (
							<ReferenceLine
								y={150}
								stroke="#ef4444"
								strokeDasharray="2 2"
								opacity={0.6}
							/>
						)}

						<Tooltip content={<CustomTooltip />} />

						<Area
							type="monotone"
							dataKey={metric}
							stroke={strokeColor}
							strokeWidth={3}
							fillOpacity={1}
							fill={`url(#${gradientId})`}
							name={isAqi ? "Indeks AQI" : "PM2.5 (µg/m³)"}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			{/* AQI Reference Scale Strip */}
			<div className="mt-[0.85rem] flex flex-wrap items-center justify-between gap-2 border-t-2 border-(--border-flat) pt-[0.65rem] text-[0.7rem] text-(--text-muted)">
				<span className="font-bold">Skala Indeks:</span>
				<div className="flex flex-wrap items-center gap-3">
					<span className="inline-flex items-center gap-1">
						<span className="h-2 w-2 rounded-full bg-secondary" />
						<span>0-50 Baik</span>
					</span>
					<span className="inline-flex items-center gap-1">
						<span className="h-2 w-2 rounded-full bg-[#eab308]" />
						<span>51-100 Sedang</span>
					</span>
					<span className="inline-flex items-center gap-1">
						<span className="h-2 w-2 rounded-full bg-[#f97316]" />
						<span>101-150 Sensitif</span>
					</span>
					<span className="inline-flex items-center gap-1">
						<span className="h-2 w-2 rounded-full bg-danger" />
						<span>151-200 Tdk Sehat</span>
					</span>
					<span className="inline-flex items-center gap-1">
						<span className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
						<span>200+ Berbahaya</span>
					</span>
				</div>
			</div>
		</div>
	);
}
