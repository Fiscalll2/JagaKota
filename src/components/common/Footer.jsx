import React from "react";
import { Code2, Globe, Code, Flame, Mountain } from "lucide-react";
import { translations } from "../../utils/i18n.js";

export function Footer({ onOpenWidget }) {
	const t = translations;

	return (
		<footer className="mt-16 border-t-2 border-(--border-flat) py-10 text-center">
			<p className="m-0 text-[0.9rem] font-bold text-(--text-main)">
				{t.footerTitle}
			</p>

			<p className="mx-auto mt-[0.4rem] max-w-180 text-[0.8rem] font-medium leading-relaxed text-(--text-muted)">
				{t.footerSources}
			</p>

			{/* Footer Navigation Links: Row 1 (App & Dev Actions) */}
			<div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-[0.825rem]">
				<a
					href="hhttps://github.com/Fiscalll2"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-[0.35rem] font-bold text-primary no-underline"
				>
					<Code2 size={16} strokeWidth={2.5} /> {t.repoLink}
				</a>

				{onOpenWidget && (
					<button
						onClick={onOpenWidget}
						className="inline-flex cursor-pointer items-center gap-[0.35rem] border-0 bg-transparent p-0 text-[0.825rem] font-bold text-[#0284c7]"
					>
						<Code size={16} strokeWidth={2.5} /> {t.embedWidget}
					</button>
				)}
			</div>

			{/* Footer Navigation Links: Row 2 (Official Open Data Sources) */}
			<div className="mt-3 flex flex-wrap items-center justify-center gap-[1.15rem] text-[0.775rem]">
				<a
					href="https://data.bmkg.go.id"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-[0.35rem] font-bold text-secondary no-underline"
				>
					<Globe size={14} strokeWidth={2.5} /> BMKG Open Data
				</a>

				<a
					href="https://magma.esdm.go.id"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-[0.35rem] font-bold text-[#d97706] no-underline"
				>
					<Mountain size={14} strokeWidth={2.5} /> PVMBG Magma
				</a>

				<a
					href="https://sipongi.gakkum.kehutanan.go.id"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-[0.35rem] font-bold text-[#ea580c] no-underline"
				>
					<Flame size={14} strokeWidth={2.5} /> KLHK SiPongi+
				</a>

				<a
					href="https://firms.modaps.eosdis.nasa.gov"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-[0.35rem] font-bold text-danger no-underline"
				>
					<Flame size={14} strokeWidth={2.5} /> NASA FIRMS
				</a>

				<a
					href="https://open-meteo.com"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-[0.35rem] font-bold text-[#059669] no-underline"
				>
					<Globe size={14} strokeWidth={2.5} /> Open-Meteo
				</a>
			</div>
		</footer>
	);
}
