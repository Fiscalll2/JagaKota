import React from "react";
import { Calendar, Droplets, Sun, ArrowUp, ArrowDown } from "lucide-react";
import { getWeatherVisual } from "../../utils/weatherIcons";
import { formatShortDate } from "../../utils/format";
import { translations } from "../../utils/i18n";

export function WeatherForecastChart({ dailyData }) {
	const t = translations;
	if (!dailyData || !dailyData.time) return null;

	const days = [
		"Minggu",
		"Senin",
		"Selasa",
		"Rabu",
		"Kamis",
		"Jumat",
		"Sabtu",
	];

	// Calculate weekly extremes
	const maxTemps = dailyData.temperature_2m_max?.slice(0, 7) || [];
	const minTemps = dailyData.temperature_2m_min?.slice(0, 7) || [];
	const highestTemp = maxTemps.length
		? Math.round(Math.max(...maxTemps))
		: 33;
	const lowestTemp = minTemps.length ? Math.round(Math.min(...minTemps)) : 23;

	return (
		<div className="flat-card p-6">
			{/* Header */}
			<div className="mb-5 flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-[0.55rem]">
					<div className="flex h-8 w-8 items-center justify-center rounded-(--radius-full) bg-(--color-primary-bg) text-primary">
						<Calendar size={18} strokeWidth={2.5} />
					</div>
					<div>
						<h3 className="m-0 text-[1.05rem] font-extrabold text-(--text-main)">
							{t.forecast7Title ||
								"Prakiraan Cuaca 7 Hari Kedepan"}
						</h3>
						<span className="text-[0.725rem] font-semibold text-(--text-muted)">
							Suhu Siang/Malam · Probabilitas Hujan · Indeks UV
							Harian
						</span>
					</div>
				</div>

				{/* Weekly Summary Pill */}
				<span className="rounded-sm border border-(--border-flat) bg-(--bg-muted) px-2.5 py-1 text-[0.725rem] font-bold text-(--text-muted)">
					Rentang:{" "}
					<strong className="text-(--text-main)">
						{lowestTemp}°C - {highestTemp}°C
					</strong>
				</span>
			</div>

			{/* 7-Day Grid Cards */}
			<div className="forecast-scroll-container gap-[0.65rem]">
				{dailyData.time.slice(0, 7).map((dateStr, idx) => {
					const d = new Date(dateStr);
					const dayName = idx === 0 ? "Hari Ini" : days[d.getDay()];
					const formattedDate = formatShortDate(dateStr);
					const maxTemp = Math.round(
						dailyData.temperature_2m_max?.[idx] ?? 0,
					);
					const minTemp = Math.round(
						dailyData.temperature_2m_min?.[idx] ?? 0,
					);
					const rainProb = Math.round(
						dailyData.precipitation_probability_max?.[idx] ??
							(dailyData.precipitation_sum?.[idx] > 0 ? 60 : 15),
					);
					const rainSum = (
						dailyData.precipitation_sum?.[idx] ?? 0
					).toFixed(1);
					const uvMax = Math.round(
						dailyData.uv_index_max?.[idx] ?? 6,
					);
					const code = dailyData.weather_code?.[idx] ?? 0;
					const visual = getWeatherVisual(code);
					const IconComp = visual.icon;
					const isToday = idx === 0;

					return (
						<div
							key={dateStr}
							className={`forecast-item relative flex min-h-58.75 min-w-31.25 flex-col items-center justify-between px-[0.65rem] py-[0.95rem] ${isToday ? "border-[1.5px] border-primary bg-(--color-primary-bg) shadow-[0_4px_12px_rgba(16,185,129,0.12)]" : "border border-(--border-flat) bg-(--bg-muted)"}`}
						>
							{/* Day & Date Header */}
							<div className="w-full text-center">
								<div
									className={`text-[0.875rem] font-extrabold tracking-[-0.01em] ${isToday ? "text-primary" : "text-(--text-main)"}`}
								>
									{dayName}
								</div>
								<div
									className={`mt-px text-[0.725rem] font-semibold ${isToday ? "text-primary" : "text-(--text-muted)"}`}
								>
									{formattedDate}
								</div>
							</div>

							{/* Weather Icon Badge */}
							<div
								className="mx-0 my-[0.35rem] flex h-11.5 w-11.5 items-center justify-center rounded-(--radius-full)"
								style={{
									backgroundColor: visual.bg,
									border: `1px solid ${visual.color}40`,
								}}
							>
								<IconComp
									size={24}
									color={visual.color}
									strokeWidth={2.5}
								/>
							</div>

							{/* Weather Condition Label */}
							<div className="flex min-h-7 items-center justify-center px-0.5 text-center text-xs leading-tight font-bold text-(--text-main)">
								{visual.label}
							</div>

							{/* Temperature High / Low with clear labels */}
							<div className="mt-[0.2rem] flex w-[90%] items-center justify-center gap-[0.45rem] rounded-sm bg-(--bg-card) px-2 py-1 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
								<div
									className="flex items-center gap-px text-danger"
									title="Suhu Maksimum (Siang)"
								>
									<ArrowUp size={11} strokeWidth={3} />
									<strong className="text-[0.85rem] font-extrabold">
										{maxTemp}°
									</strong>
								</div>
								<span className="text-[0.7rem] text-(--text-muted)">
									/
								</span>
								<div
									className="flex items-center gap-px text-[#0284c7]"
									title="Suhu Minimum (Malam)"
								>
									<ArrowDown size={11} strokeWidth={3} />
									<span className="text-[0.8rem] font-bold">
										{minTemp}°
									</span>
								</div>
							</div>

							{/* Secondary Details: Rain Probability & UV Max */}
							<div className="mt-[0.45rem] flex w-full items-center justify-between border-t border-dashed border-(--border-flat) pt-[0.4rem] text-[0.675rem] font-bold text-(--text-muted)">
								<div
									className={`flex items-center gap-0.5 ${rainProb >= 40 ? "text-[#0284c7]" : "text-(--text-muted)"}`}
									title={`Peluang Hujan: ${rainProb}% (${rainSum} mm)`}
								>
									<Droplets size={11} strokeWidth={2.5} />
									<span>{rainProb}%</span>
								</div>

								<div
									className={`flex items-center gap-0.5 ${uvMax >= 8 ? "text-[#ea580c]" : "text-(--text-muted)"}`}
									title={`Indeks UV Maksimum: ${uvMax}`}
								>
									<Sun size={11} strokeWidth={2.5} />
									<span>UV {uvMax}</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
