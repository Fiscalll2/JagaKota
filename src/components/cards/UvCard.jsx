import React from "react";
import { SunMedium, Info } from "lucide-react";
import { getUvInfo } from "../../utils/aqi";
import { translations } from "../../utils/i18n";

export function UvCard({ uvIndex, loading }) {
	const t = translations;

	if (loading) {
		return (
			<div className="flat-card animate-pulse min-h-55 p-6">
				<div className="mb-4 h-6 w-[45%] rounded bg-(--bg-muted)" />
				<div className="mb-[0.85rem] h-13.5 w-[30%] rounded-md bg-(--bg-muted)" />
				<div className="mb-4 h-2 rounded-full bg-(--bg-muted)" />
				<div className="h-9 rounded-md bg-(--bg-muted)" />
			</div>
		);
	}

	const uvInfo = getUvInfo(uvIndex);
	const numVal = Number(uvInfo.value) || 0;
	const progressPercent = Math.min(100, Math.max(8, (numVal / 12) * 100));

	return (
		<div className="flat-card flex flex-col justify-between p-6">
			<div>
				{/* Header */}
				<div className="mb-3 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div
							className="flex h-8 w-8 items-center justify-center rounded-(--radius-full) text-white"
							style={{ backgroundColor: uvInfo.color }}
						>
							<SunMedium size={18} strokeWidth={2.5} />
						</div>
						<h3 className="m-0 text-[1.05rem] font-extrabold text-(--text-main)">
							{t.uvTitle}
						</h3>
					</div>
					<span
						className="rounded-sm px-2.5 py-0.75 text-xs font-extrabold text-white"
						style={{ backgroundColor: uvInfo.color }}
					>
						{uvInfo.label}
					</span>
				</div>

				{/* Main UV Readout */}
				<div className="mx-0 mt-[0.85rem] mb-2 flex items-baseline gap-[0.85rem]">
					<div
						className="text-[3.4rem] leading-none font-extrabold tracking-[-0.04em]"
						style={{ color: uvInfo.color }}
					>
						{uvInfo.value}
					</div>
					<div>
						<strong className="block text-[1.15rem] leading-[1.2] font-extrabold text-(--text-main)">
							{uvInfo.label}
						</strong>
						<span className="text-xs font-semibold text-(--text-muted)">
							{t.uvSubtitle ||
								"Indeks Paparan Ultraviolet Global"}
						</span>
					</div>
				</div>

				{/* Progress Track */}
				<div className="mx-0 mt-3 mb-2 h-1.5 w-full overflow-hidden rounded-full bg-(--bg-muted)">
					<div
						className="h-full rounded-full transition-[width] duration-400"
						style={{
							width: `${progressPercent}%`,
							backgroundColor: uvInfo.color,
						}}
					/>
				</div>
			</div>

			{/* Footer Advice */}
			<div className="mt-3 flex items-center gap-[0.45rem] border-t-2 border-(--border-flat) pt-3 text-[0.8rem] leading-[1.35] font-semibold text-(--text-main)">
				<Info
					size={15}
					color="var(--color-primary)"
					className="shrink-0"
				/>
				<span>{uvInfo.advice}</span>
			</div>
		</div>
	);
}
