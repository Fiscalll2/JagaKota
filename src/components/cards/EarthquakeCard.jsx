import React, { useState } from "react";
import {
	Activity,
	AlertTriangle,
	ShieldCheck,
	MapPin,
	Clock,
	ChevronDown,
	ChevronUp,
	List,
	Compass,
} from "lucide-react";
import { getEarthquakeColor } from "../../utils/aqi";
import { calculateDistance } from "../../utils/geo";
import { translations } from "../../utils/i18n";

export function EarthquakeCard({
	earthquake,
	recentQuakes = [],
	onFocusQuake,
	userLocation,
}) {
	const [showList, setShowList] = useState(false);
	const t = translations;

	if (!earthquake) {
		return (
			<div className="flat-card p-6">
				<div className="mb-4 flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-(--radius-full) bg-secondary text-white">
						<Activity size={18} strokeWidth={2.5} />
					</div>
					<h3 className="m-0 text-[1.05rem] font-extrabold">
						{t.quakeTitle}
					</h3>
				</div>
				<p className="text-[0.85rem] font-medium text-(--text-muted)">
					Tidak ada gempa signifikan saat ini.
				</p>
			</div>
		);
	}

	const magColor = getEarthquakeColor(earthquake.magnitude);
	const isMajor = earthquake.magnitude >= 5.0;

	// Accurate Geodesic Epicenter Distance calculation
	const distanceKm =
		userLocation?.lat &&
		userLocation?.lon &&
		earthquake.lat &&
		earthquake.lon
			? calculateDistance(
					userLocation.lat,
					userLocation.lon,
					earthquake.lat,
					earthquake.lon,
				)
			: null;

	return (
		<div className="flat-card p-6">
			{/* Header */}
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div
						className="flex h-8 w-8 items-center justify-center rounded-(--radius-full) text-white"
						style={{ backgroundColor: magColor }}
					>
						<Activity size={18} strokeWidth={2.5} />
					</div>
					<h3 className="m-0 text-[1.05rem] font-extrabold text-(--text-main)">
						{t.quakeTitle}
					</h3>
				</div>
				<span
					className="rounded-sm px-2.5 py-0.75 text-xs font-extrabold text-white"
					style={{ backgroundColor: magColor }}
				>
					M {earthquake.magnitude}
				</span>
			</div>

			{/* Magnitude & Depth */}
			<div className="mx-0 my-4 flex items-center gap-5">
				<div
					className="text-[3.2rem] leading-none font-extrabold tracking-[-0.04em]"
					style={{ color: magColor }}
				>
					{earthquake.magnitude}
					<span className="ml-1 text-[1.2rem] font-bold">M</span>
				</div>
				<div>
					<div className="flex items-center gap-[0.35rem] text-[0.775rem] font-semibold text-(--text-muted)">
						<Clock size={13} strokeWidth={2.2} />
						<span>
							{earthquake.date} - {earthquake.time}
						</span>
					</div>
					<div className="mt-[0.2rem] text-[0.9rem] font-extrabold text-(--text-main)">
						{t.depth}: {earthquake.depth}
					</div>
				</div>
			</div>

			{/* Location Area & Distance */}
			<div className="mb-4 flex flex-col gap-[0.35rem] rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-[0.85rem] py-3 text-[0.825rem] font-semibold text-(--text-main)">
				<div className="flex items-start gap-2">
					<MapPin
						size={16}
						color={magColor}
						strokeWidth={2.5}
						className="mt-px shrink-0"
					/>
					<span>{earthquake.wilayah}</span>
				</div>
				{distanceKm !== null && (
					<div className="ml-6 flex items-center gap-[0.35rem] text-xs text-(--text-muted)">
						<Compass size={13} color="var(--color-primary)" />
						<span>
							Jarak ke episenter:{" "}
							<strong className="text-primary">
								{distanceKm} km
							</strong>{" "}
							dari lokasi Anda
						</span>
					</div>
				)}
			</div>

			{/* Tsunami Status & List Toggle */}
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div
					className={`flex items-center gap-[0.4rem] text-[0.8rem] font-extrabold ${isMajor ? "text-accent" : "text-secondary"}`}
				>
					{isMajor ? (
						<AlertTriangle size={16} strokeWidth={2.5} />
					) : (
						<ShieldCheck size={16} strokeWidth={2.5} />
					)}
					<span>{earthquake.potensi || t.noTsunami}</span>
				</div>

				{recentQuakes.length > 0 && (
					<button
						onClick={() => setShowList(!showList)}
						className="flat-btn-secondary min-h-8 px-3 py-[0.35rem] text-xs"
					>
						<List size={13} strokeWidth={2.2} />
						<span>
							{showList ? t.closeQuakesBtn : t.recentQuakesBtn}
						</span>
						{showList ? (
							<ChevronUp size={13} strokeWidth={2.2} />
						) : (
							<ChevronDown size={13} strokeWidth={2.2} />
						)}
					</button>
				)}
			</div>

			{/* Collapsible History */}
			{showList && (
				<div className="mt-4 flex flex-col gap-[0.4rem] border-t-2 border-(--border-flat) pt-4">
					{recentQuakes.slice(0, 5).map((q, idx) => {
						const color = getEarthquakeColor(q.magnitude);
						const qDist =
							userLocation?.lat &&
							userLocation?.lon &&
							q.lat &&
							q.lon
								? calculateDistance(
										userLocation.lat,
										userLocation.lon,
										q.lat,
										q.lon,
									)
								: null;
						return (
							<div
								key={q.id || idx}
								onClick={() => onFocusQuake && onFocusQuake(q)}
								className="flex cursor-pointer items-center justify-between gap-2 rounded-sm border-2 border-(--border-flat) bg-(--bg-muted) px-2 py-1.5 text-xs"
								style={{
									cursor: onFocusQuake
										? "pointer"
										: "default",
								}}
							>
								<div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
									<span
										className="mr-1.5 font-extrabold"
										style={{ color }}
									>
										M {q.magnitude}
									</span>
									<span className="font-semibold text-(--text-main)">
										{q.wilayah}
									</span>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									{qDist !== null && (
										<span className="text-[0.675rem] font-bold text-primary">
											{qDist} km
										</span>
									)}
									<span className="text-[0.7rem] font-medium whitespace-nowrap text-(--text-muted)">
										{q.time}
									</span>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
