import React, { useState, useEffect } from "react";
import { X, Copy, Check, Globe, Code2, Leaf } from "lucide-react";
import { getAqiInfo } from "../../utils/aqi";

export function EmbedWidgetModal({
	isOpen,
	onClose,
	location,
	airQualityData,
	weatherData,
}) {
	const [copiedType, setCopiedType] = useState(null);

	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const cityName = location?.name || location?.city || "Jakarta";
	const aqiVal = airQualityData?.current?.aqi || 42;
	const aqiInfo = getAqiInfo(aqiVal);
	const temp = Math.round(
		weatherData?.current?.temperature ||
			weatherData?.current?.temperature_2m ||
			30,
	);
	const weatherLabel =
		weatherData?.current?.weatherCodeInfo?.label || "Cerah Berawan";

	const baseUrl =
		typeof window !== "undefined"
			? window.location.origin
			: "https://jagakota.vercel.app/";

	// Web Iframe & Markdown Badge
	const iframeUrl = `${baseUrl}/?embed=true&city=${encodeURIComponent(cityName)}`;
	const iframeCode = `<iframe src="${iframeUrl}" width="340" height="190" frameborder="0" style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);" title="JagaKota Live Widget - ${cityName}"></iframe>`;
	const badgeUrl = `${baseUrl}/api/badge?city=${encodeURIComponent(cityName)}&aqi=${aqiVal}&status=${encodeURIComponent(aqiInfo.label)}&temp=${temp}`;
	const markdownBadge = `[![JagaKota AQI & Cuaca ${cityName}](${badgeUrl})](${baseUrl})`;

	const handleCopy = (text, type) => {
		navigator.clipboard.writeText(text);
		setCopiedType(type);
		setTimeout(() => setCopiedType(null), 2500);
	};

	return (
		<div
			className="modal-overlay animate-fade-in"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="modal-content animate-scale-up w-[95%] max-w-140 gap-[1.15rem] overflow-y-auto rounded-lg p-6"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b-2 border-(--border-flat) pb-3">
					<div className="flex items-center gap-[0.6rem]">
						<div className="rounded-sm bg-(--color-primary-bg) p-1.75 text-primary">
							<Globe size={19} strokeWidth={2.5} />
						</div>
						<div>
							<h3 className="m-0 text-[1.05rem] font-extrabold text-(--text-main)">
								Pasang Widget Web JagaKota
							</h3>
							<p className="m-0 text-xs text-(--text-muted)">
								Sematkan kartu kualitas udara & cuaca live di
								website, blog, atau GitHub README Anda
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="flat-btn-secondary p-1.5"
						aria-label="Tutup Modal"
					>
						<X size={18} />
					</button>
				</div>

				{/* Live Preview Box */}
				<div className="rounded-md border-2 border-(--border-flat) bg-(--bg-muted) p-4">
					<span className="mb-[0.6rem] block text-[0.7rem] font-extrabold uppercase tracking-[0.5px] text-(--text-muted)">
						Pratinjau Widget Live ({cityName})
					</span>

					{/* Mini Card Preview */}
					<div className="flex flex-col gap-[0.65rem] rounded-xl border-2 border-(--border-flat) bg-(--bg-card) px-[1.15rem] py-[0.85rem] shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
						<div className="flex items-center justify-between gap-2">
							<div className="flex min-w-0 flex-1 items-center gap-1.5">
								<Leaf
									size={16}
									color="var(--color-primary)"
									className="shrink-0"
								/>
								<strong className="truncate text-[0.9rem] font-extrabold whitespace-nowrap text-(--text-main)">
									JagaKota • {cityName}
								</strong>
							</div>
							<span
								className="shrink-0 rounded-md px-2.25 py-0.75 text-[0.725rem] font-extrabold whitespace-nowrap"
								style={{
									backgroundColor: aqiInfo.bg,
									color: aqiInfo.color,
								}}
							>
								AQI {aqiVal} ({aqiInfo.label})
							</span>
						</div>

						<div className="flex items-center justify-between gap-2 rounded-lg bg-(--bg-muted) px-[0.85rem] py-[0.55rem]">
							<div className="flex min-w-0 items-center gap-1.5">
								<strong className="text-[1.05rem] font-black text-(--text-main)">
									{temp}°C
								</strong>
								<span className="truncate text-[0.8rem] whitespace-nowrap text-(--text-muted)">
									{weatherLabel}
								</span>
							</div>
							<span className="shrink-0 text-[0.725rem] font-semibold whitespace-nowrap text-(--text-muted)">
								BMKG · Open-Meteo
							</span>
						</div>
					</div>

					{/* Pratinjau Markdown / SVG Badge */}
					<div className="mt-4 flex flex-col items-center gap-2">
						<span className="text-[0.725rem] font-bold text-(--text-muted)">
							Pratinjau Markdown / SVG Badge:
						</span>
						<div className="inline-flex max-w-full items-stretch overflow-hidden rounded-md text-xs leading-[1.2] font-extrabold shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
							<div className="inline-flex shrink-0 items-center gap-1.25 bg-secondary px-2.5 py-1.5 text-white">
								<Leaf
									size={13}
									color="#ffffff"
									strokeWidth={2.5}
								/>
								<span>JagaKota</span>
							</div>
							<div className="inline-flex max-w-50 items-center truncate bg-[#1e293b] px-2.5 py-1.5 whitespace-nowrap text-[#f8fafc]">
								{cityName} ({temp}°C)
							</div>
							<div
								className="inline-flex shrink-0 items-center px-2.5 py-1.5 whitespace-nowrap text-white"
								style={{
									backgroundColor: aqiInfo.color || "#ef4444",
								}}
							>
								AQI {aqiVal} • {aqiInfo.label}
							</div>
						</div>
					</div>
				</div>

				{/* Code Snippet 1: Iframe */}
				<div>
					<div className="mb-[0.35rem] flex items-center justify-between">
						<label className="flex items-center gap-1.25 text-[0.775rem] font-bold text-(--text-main)">
							<Code2 size={14} color="var(--color-primary)" />
							<span>
								1. HTML Iframe (Untuk WordPress, Web & Blog)
							</span>
						</label>
						<button
							onClick={() => handleCopy(iframeCode, "iframe")}
							className="flat-btn-secondary gap-1 px-2 py-0.75 text-[0.7rem]"
						>
							{copiedType === "iframe" ? (
								<Check size={12} color="var(--color-primary)" />
							) : (
								<Copy size={12} />
							)}
							<span>
								{copiedType === "iframe"
									? "Tersalin!"
									: "Salin Kode"}
							</span>
						</button>
					</div>
					<textarea
						readOnly
						value={iframeCode}
						rows={2}
						className="w-full resize-none rounded-sm border border-(--border-flat) bg-(--bg-muted) p-2 font-mono text-[0.725rem] leading-[1.4] text-(--text-main)"
					/>
				</div>

				{/* Code Snippet 2: Markdown */}
				<div>
					<div className="mb-[0.35rem] flex items-center justify-between">
						<label className="flex items-center gap-1.25 text-[0.775rem] font-bold text-(--text-main)">
							<Globe size={14} color="var(--color-secondary)" />
							<span>
								2. Markdown Badge (Untuk GitHub README / Notion)
							</span>
						</label>
						<button
							onClick={() =>
								handleCopy(markdownBadge, "markdown")
							}
							className="flat-btn-secondary gap-1 px-2 py-0.75 text-[0.7rem]"
						>
							{copiedType === "markdown" ? (
								<Check size={12} color="var(--color-primary)" />
							) : (
								<Copy size={12} />
							)}
							<span>
								{copiedType === "markdown"
									? "Tersalin!"
									: "Salin Markdown"}
							</span>
						</button>
					</div>
					<input
						readOnly
						value={markdownBadge}
						className="w-full rounded-sm border border-(--border-flat) bg-(--bg-muted) p-2 font-mono text-[0.725rem] text-(--text-main)"
					/>
				</div>

				{/* Footer info */}
				<div className="flex items-center justify-between border-t-2 border-(--border-flat) pt-2 text-[0.725rem] text-(--text-muted)">
					<span>
						100% Gratis & Data Terbuka Resmi (BMKG, PVMBG, NASA &
						SiPongi+)
					</span>
					<button
						onClick={onClose}
						className="flat-btn-primary px-3.5 py-1.25 text-[0.775rem]"
					>
						Selesai
					</button>
				</div>
			</div>
		</div>
	);
}
