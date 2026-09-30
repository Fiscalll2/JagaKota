import React from "react";
import { ExternalLink, Wind, Droplets } from "lucide-react";
import { getAqiInfo } from "../../utils/aqi";

export function WidgetEmbedView({ location, weatherData, airQualityData }) {
	const cityName = location?.name || "DKI Jakarta";
	const aqiVal = airQualityData?.current?.aqi || 42;
	const aqiInfo = getAqiInfo(aqiVal);
	const temp = Math.round(
		weatherData?.current?.temperature ||
			weatherData?.current?.temperature_2m ||
			30,
	);
	const weatherLabel =
		weatherData?.current?.weatherCodeInfo?.label || "Cerah Berawan";
	const humidity = weatherData?.current?.relative_humidity_2m || 75;
	const windSpeed = Math.round(weatherData?.current?.wind_speed_10m || 12);

	const appUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/?city=${encodeURIComponent(cityName)}`
			: `https://jagakota.vercel.app/?city=${encodeURIComponent(cityName)}`;

	return (
		<div className="m-0 flex h-screen w-screen flex-col justify-between overflow-hidden bg-(--bg-card,#ffffff) p-[0.85rem] text-(--text-main,#0f172a) select-none">
			{/* Top Row: Brand & City */}
			<div className="flex items-center justify-between">
				<a
					href={appUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.25 text-inherit no-underline"
				>
					<div className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_6px_#10b981]" />
					<span className="text-[0.85rem] font-extrabold tracking-[-0.2px]">
						JagaKota
					</span>
					<span className="text-xs font-semibold text-(--text-muted,#64748b)">
						• {cityName}
					</span>
				</a>

				{/* AQI Pill */}
				<span
					className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-extrabold"
					style={{
						backgroundColor: aqiInfo.bg,
						color: aqiInfo.color,
						border: `1px solid ${aqiInfo.color}33`,
					}}
				>
					AQI {aqiVal} ({aqiInfo.label})
				</span>
			</div>

			{/* Main Metric Row: Temperature & Key Stats */}
			<div className="flex items-center justify-between rounded-[10px] border border-black/5 bg-(--bg-muted,#f8fafc) px-[0.85rem] py-[0.55rem]">
				{/* Left: Temp & Weather Condition */}
				<div className="flex items-baseline gap-1.5">
					<span className="text-[1.45rem] leading-none font-black">
						{temp}°C
					</span>
					<span className="max-w-30 overflow-hidden text-[0.75rem] font-semibold text-ellipsis whitespace-nowrap text-(--text-muted,#64748b)">
						{weatherLabel}
					</span>
				</div>

				{/* Right: PM2.5 & Humidity */}
				<div className="flex gap-3 text-[0.7rem] text-(--text-muted,#64748b)">
					<div className="flex items-center gap-0.75">
						<Droplets size={12} color="#0284c7" />
						<span className="font-bold">{humidity}%</span>
					</div>
					<div className="flex items-center gap-0.75">
						<Wind size={12} color="#10b981" />
						<span className="font-bold">{windSpeed} km/h</span>
					</div>
				</div>
			</div>

			{/* Bottom Row: Source & Full App Link */}
			<div className="flex items-center justify-between text-[0.675rem] text-(--text-muted,#64748b)">
				<span>Data: BMKG & Open-Meteo</span>
				<a
					href={appUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-0.75 font-bold text-(--color-primary,#059669) no-underline"
				>
					<span>Buka Pantauan Lengkap</span>
					<ExternalLink size={11} />
				</a>
			</div>
		</div>
	);
}
