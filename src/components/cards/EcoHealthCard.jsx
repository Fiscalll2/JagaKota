import React from "react";
import {
	HeartPulse,
	Bike,
	Footprints,
	Baby,
	Wind,
	ShieldCheck,
} from "lucide-react";
import { calculateEcoHealthScore } from "../../utils/healthIndex";
import { translations } from "../../utils/i18n";

export function EcoHealthCard({ aqiData, weatherData }) {
	const t = translations;

	const aqi = aqiData?.current?.aqi ?? 0;
	const pm25 = aqiData?.current?.pm25 ?? 0;
	const temp = weatherData?.current?.temp ?? 28;
	const humidity = weatherData?.current?.humidity ?? 70;
	const uvIndex = weatherData?.current?.uvIndex ?? 0;

	const health = calculateEcoHealthScore(aqi, temp, humidity, uvIndex, pm25);

	return (
		<div className="flat-card mb-6 bg-(--bg-card) p-7">
			<div className="grid grid-cols-1 gap-6">
				{/* Top: Score & Summary */}
				<div className="flex flex-wrap items-center justify-between gap-5">
					<div className="flex items-center gap-5">
						{/* Flat Score Badge */}
						<div
							className="flex h-17 w-17 shrink-0 flex-col items-center justify-center rounded-md text-white"
							style={{ backgroundColor: health.color }}
						>
							<span className="text-[1.75rem] leading-none font-extrabold">
								{health.score}
							</span>
							<span className="text-[0.65rem] font-bold opacity-90">
								/100
							</span>
						</div>

						<div>
							<span
								className="block text-xs font-extrabold tracking-[0.06em] uppercase"
								style={{ color: health.color }}
							>
								{t.ecoTitle}
							</span>
							<h2 className="mx-0 my-[0.1rem] text-[1.35rem] font-extrabold tracking-[-0.02em] text-(--text-main)">
								{health.category}
							</h2>
							<p className="m-0 text-[0.85rem] font-medium text-(--text-muted)">
								{t.ecoSubtitle}
							</p>
						</div>
					</div>

					{/* Exposure Block */}
					<div
						className={`flex items-center gap-[0.65rem] rounded-md px-[1.15rem] py-[0.65rem] ${health.cigs > 1.5 ? "border-2 border-danger bg-(--color-danger-bg)" : "border-2 border-(--border-flat) bg-(--bg-muted)"}`}
					>
						<div
							className="flex h-9 w-9 items-center justify-center rounded-(--radius-full) text-white"
							style={{
								backgroundColor:
									health.cigs > 1.5
										? "var(--color-danger)"
										: "var(--color-secondary)",
							}}
						>
							<HeartPulse size={20} strokeWidth={2.5} />
						</div>
						<div>
							<span className="block text-[0.7rem] font-semibold text-(--text-muted)">
								{t.exposure}
							</span>
							<strong className="text-[0.9rem] font-extrabold text-(--text-main)">
								{health.cigs > 0
									? `${health.cigs} ${t.cigsUnit}`
									: t.cleanAir}
							</strong>
						</div>
					</div>
				</div>

				{/* Outdoor Activities Matrix */}
				<div className="border-t-2 border-(--border-flat) pt-5">
					<div className="mb-[0.85rem] flex items-center gap-[0.4rem]">
						<ShieldCheck
							size={16}
							color="var(--color-secondary)"
							strokeWidth={2.5}
						/>
						<span className="text-xs font-extrabold tracking-wider text-(--text-muted) uppercase">
							{t.activitiesTitle}
						</span>
					</div>

					<div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[0.65rem]">
						<div className="flex items-center gap-[0.65rem] rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-[0.85rem] py-[0.65rem]">
							<div
								className="flex h-8 w-8 shrink-0 items-center justify-center rounded-(--radius-full) text-white"
								style={{
									backgroundColor:
										health.activities.jogging.color,
								}}
							>
								<Footprints size={16} strokeWidth={2.5} />
							</div>
							<div className="min-w-0">
								<span className="block text-[0.7rem] font-semibold text-(--text-muted)">
									Jogging
								</span>
								<strong className="text-[0.825rem] font-extrabold text-(--text-main)">
									{health.activities.jogging.status}
								</strong>
							</div>
						</div>

						<div className="flex items-center gap-[0.65rem] rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-[0.85rem] py-[0.65rem]">
							<div
								className="flex h-8 w-8 shrink-0 items-center justify-center rounded-(--radius-full) text-white"
								style={{
									backgroundColor:
										health.activities.cycling.color,
								}}
							>
								<Bike size={16} strokeWidth={2.5} />
							</div>
							<div className="min-w-0">
								<span className="block text-[0.7rem] font-semibold text-(--text-muted)">
									Sepeda
								</span>
								<strong className="text-[0.825rem] font-extrabold text-(--text-main)">
									{health.activities.cycling.status}
								</strong>
							</div>
						</div>

						<div className="flex items-center gap-[0.65rem] rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-[0.85rem] py-[0.65rem]">
							<div
								className="flex h-8 w-8 shrink-0 items-center justify-center rounded-(--radius-full) text-white"
								style={{
									backgroundColor:
										health.activities.kidsAndSeniors.color,
								}}
							>
								<Baby size={16} strokeWidth={2.5} />
							</div>
							<div className="min-w-0">
								<span className="block text-[0.7rem] font-semibold text-(--text-muted)">
									Anak & Lansia
								</span>
								<strong className="text-[0.825rem] font-extrabold text-(--text-main)">
									{health.activities.kidsAndSeniors.status}
								</strong>
							</div>
						</div>

						<div className="flex items-center gap-[0.65rem] rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-[0.85rem] py-[0.65rem]">
							<div
								className="flex h-8 w-8 shrink-0 items-center justify-center rounded-(--radius-full) text-white"
								style={{
									backgroundColor:
										health.activities.ventilation.color,
								}}
							>
								<Wind size={16} strokeWidth={2.5} />
							</div>
							<div className="min-w-0">
								<span className="block text-[0.7rem] font-semibold text-(--text-muted)">
									Ventilasi
								</span>
								<strong className="text-[0.825rem] font-extrabold text-(--text-main)">
									{health.activities.ventilation.status}
								</strong>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
