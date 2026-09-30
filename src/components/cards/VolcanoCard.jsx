import React from "react";
import {
	Flame,
	Compass,
	ChevronRight,
	AlertTriangle,
	ShieldCheck,
} from "lucide-react";
import { getNearbyVolcanoes } from "../../services/volcano.js";
import { translations } from "../../utils/i18n.js";

export function VolcanoCard({ location, onOpenModal }) {
	const t = translations;
	const { nearest } = getNearbyVolcanoes(location?.lat, location?.lon);

	if (!nearest) return null;

	const isHighAlert = nearest.statusLevel >= 3;
	const isNear = nearest.distanceKm <= 50;

	return (
		<div className="flat-card flex flex-col justify-between p-6">
			{/* Header */}
			<div className="mb-[0.85rem] flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-[0.55rem]">
					<div
						className="flex h-8 w-8 items-center justify-center rounded-(--radius-full) text-white"
						style={{ backgroundColor: nearest.status.color }}
					>
						<Flame size={18} strokeWidth={2.5} />
					</div>
					<div>
						<h3 className="m-0 text-[1.05rem] font-extrabold text-(--text-main)">
							{t.volcanoTitle}
						</h3>
						<span className="text-[0.725rem] font-semibold text-(--text-muted)">
							{t.volcanoSubtitle}
						</span>
					</div>
				</div>

				{/* Status Badge */}
				<span
					className="rounded-sm px-3 py-1 text-xs font-extrabold text-white"
					style={{ backgroundColor: nearest.status.color }}
				>
					{nearest.status.code} ({nearest.status.name})
				</span>
			</div>

			{/* Main Info Box */}
			<div className="mx-0 my-3 flex flex-wrap items-center justify-between gap-3 rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-[1.15rem] py-4">
				<div>
					<strong className="block text-[1.2rem] font-extrabold text-(--text-main)">
						{nearest.name}
					</strong>
					<span className="text-[0.8rem] font-semibold text-(--text-muted)">
						{nearest.regency}, {nearest.province} ·{" "}
						{nearest.elevation}
					</span>
				</div>

				<div className="flex items-center gap-2">
					<Compass size={18} color="var(--color-primary)" />
					<div>
						<span className="block text-[0.7rem] font-bold text-(--text-muted) uppercase">
							{t.volcanoDistance}
						</span>
						<span
							className={`text-[1.1rem] font-extrabold ${isNear ? "text-danger" : "text-primary"}`}
						>
							{nearest.distanceKm} km
						</span>
					</div>
				</div>
			</div>

			{/* Advisory Banner */}
			<div
				className={`flex flex-wrap items-center justify-between gap-[0.65rem] rounded-sm px-4 py-3 text-[0.775rem] font-semibold ${isHighAlert ? "border-[1.5px] border-danger bg-(--color-danger-bg) text-danger" : "border border-(--border-flat) bg-(--bg-subtle) text-(--text-main)"}`}
			>
				<div className="flex flex-[1_1_300px] items-center gap-2">
					{isHighAlert ? (
						<AlertTriangle size={16} />
					) : (
						<ShieldCheck size={16} color="var(--color-primary)" />
					)}
					<span>
						{isHighAlert ? t.volcanoAlertMsg : t.volcanoNormalMsg}
					</span>
				</div>

				<button
					onClick={onOpenModal}
					className="flat-btn-primary gap-[0.3rem] px-2.5 py-1 text-[0.725rem] whitespace-nowrap"
				>
					<span>{t.volcanoAllBtn}</span>
					<ChevronRight size={14} />
				</button>
			</div>
		</div>
	);
}
