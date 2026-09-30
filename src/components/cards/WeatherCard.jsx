import React from "react";
import { Droplets, Wind, Gauge } from "lucide-react";
import { getWeatherVisual } from "../../utils/weatherIcons";
import { translations } from "../../utils/i18n";

export function WeatherCard({ data, locationName }) {
	const t = translations;

	const current = data?.current || {};
	const visual = getWeatherVisual(current.weatherCode || 0);
	const CurrentIcon = visual.icon;

	return (
		<div className="flat-card p-6">
			{/* Header */}
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div
						className="flex h-8.5 w-8.5 items-center justify-center rounded-(--radius-full)"
						style={{
							backgroundColor: visual.bg,
							border: `1px solid ${visual.color}40`,
						}}
					>
						<CurrentIcon
							size={19}
							color={visual.color}
							strokeWidth={2.5}
						/>
					</div>
					<h3 className="m-0 text-[1.05rem] font-extrabold text-(--text-main)">
						{t.weatherTitle}
					</h3>
				</div>
				<span
					className="rounded-sm px-2 py-0.75 text-xs font-extrabold"
					style={{
						backgroundColor: visual.bg,
						color: visual.color,
						border: `1px solid ${visual.color}35`,
					}}
				>
					{visual.label}
				</span>
			</div>

			{/* Main Temp with Weather Icon */}
			<div className="mx-0 my-[0.85rem] flex items-center justify-between">
				<div className="flex items-baseline gap-[0.85rem]">
					<div className="text-[3.2rem] leading-none font-extrabold tracking-[-0.04em] text-(--text-main)">
						{current.temp}°C
					</div>
					<div>
						<span className="block text-xs font-semibold text-(--text-muted)">
							{t.feelsLike}
						</span>
						<strong className="text-[1.05rem] font-extrabold text-(--text-main)">
							{current.feelsLike}°C
						</strong>
					</div>
				</div>

				<div
					className="flex h-13.5 w-13.5 items-center justify-center rounded-md"
					style={{
						backgroundColor: visual.bg,
						border: `1px solid ${visual.color}30`,
					}}
				>
					<CurrentIcon
						size={32}
						color={visual.color}
						strokeWidth={2.5}
					/>
				</div>
			</div>

			{/* Summary */}
			<p className="mx-0 mt-0 mb-5 text-[0.85rem] font-medium text-(--text-muted)">
				Kondisi cuaca di {locationName.replace(" (GPS)", "")} terpantau{" "}
				{visual.label.toLowerCase()}.
			</p>

			{/* Weather Metrics */}
			<div className="grid grid-cols-3 gap-2">
				<div className="flex items-center gap-2 rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-[0.65rem] py-[0.55rem]">
					<Droplets
						size={17}
						color="var(--color-primary)"
						strokeWidth={2.5}
						className="shrink-0"
					/>
					<div className="min-w-0">
						<span className="block text-[0.675rem] font-semibold text-(--text-muted)">
							{t.humidity}
						</span>
						<strong className="text-[0.85rem] font-extrabold text-(--text-main)">
							{current.humidity}%
						</strong>
					</div>
				</div>

				<div className="flex items-center gap-2 rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-[0.65rem] py-[0.55rem]">
					<Wind
						size={17}
						color="var(--color-secondary)"
						strokeWidth={2.5}
						className="shrink-0"
					/>
					<div className="min-w-0">
						<span className="block text-[0.675rem] font-semibold text-(--text-muted)">
							{t.windSpeed}
						</span>
						<strong className="text-[0.85rem] font-extrabold text-(--text-main)">
							{current.windSpeed} km/j
						</strong>
					</div>
				</div>

				<div className="flex items-center gap-2 rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-[0.65rem] py-[0.55rem]">
					<Gauge
						size={17}
						color="var(--color-accent)"
						strokeWidth={2.5}
						className="shrink-0"
					/>
					<div className="min-w-0">
						<span className="block text-[0.675rem] font-semibold text-(--text-muted)">
							{t.pressure}
						</span>
						<strong className="text-[0.85rem] font-extrabold text-(--text-main)">
							{Math.round(current.pressure || 1012)} hPa
						</strong>
					</div>
				</div>
			</div>
		</div>
	);
}
