import React, { useState, useMemo, useEffect } from "react";
import {
	Flame,
	X,
	Search,
	Satellite,
	Thermometer,
	Zap,
	MapPin,
	ExternalLink,
	ShieldCheck,
} from "lucide-react";
import { SATELLITE_HOTSPOTS } from "../../utils/karhutla";
import { calculateDistance } from "../../utils/geo";

const REGIONS = [
	"Semua",
	"Jawa",
	"Sumatera",
	"Kalimantan",
	"Sulawesi",
	"Bali & Nusa Tenggara",
	"Maluku & Papua",
];
const CONFIDENCE_FILTERS = [
	{ id: "ALL", label: "Semua Tingkat" },
	{ id: "HIGH", label: "Tinggi (>85%)" },
	{ id: "MODERATE", label: "Sedang (70-85%)" },
];

export function KarhutlaListModal({
	isOpen,
	onClose,
	userLocation,
	hotspots = SATELLITE_HOTSPOTS,
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRegion, setSelectedRegion] = useState("Semua");
	const [confidenceFilter, setConfidenceFilter] = useState("ALL");

	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const rawList =
		hotspots && hotspots.length > 0 ? hotspots : SATELLITE_HOTSPOTS;

	const hotspotsWithDistance = useMemo(() => {
		return rawList
			.map((h) => {
				const dist =
					userLocation?.lat && userLocation?.lon
						? Math.round(
								calculateDistance(
									userLocation.lat,
									userLocation.lon,
									h.lat,
									h.lon,
								) * 10,
							) / 10
						: null;
				return { ...h, distanceKm: dist };
			})
			.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
	}, [rawList, userLocation]);

	const filteredHotspots = useMemo(() => {
		return hotspotsWithDistance.filter((h) => {
			const matchSearch =
				h.regency.toLowerCase().includes(searchTerm.toLowerCase()) ||
				h.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
				h.type.toLowerCase().includes(searchTerm.toLowerCase());
			const matchRegion =
				selectedRegion === "Semua" || h.island === selectedRegion;

			let matchConfidence = true;
			if (confidenceFilter === "HIGH")
				matchConfidence =
					h.confidence.includes("Tinggi") ||
					h.confidenceLevel === "HIGH";
			else if (confidenceFilter === "MODERATE")
				matchConfidence =
					h.confidence.includes("Sedang") ||
					h.confidenceLevel === "MODERATE";

			return matchSearch && matchRegion && matchConfidence;
		});
	}, [hotspotsWithDistance, searchTerm, selectedRegion, confidenceFilter]);

	return (
		<div
			className="modal-overlay animate-fade-in"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="modal-content flex max-h-[90vh] w-[95%] max-w-180 flex-col overflow-hidden p-0"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div className="flex items-center justify-between border-b-2 border-b-(--border-flat) px-6 py-5">
					<div className="flex items-center gap-[0.65rem]">
						<div className="flex h-8.5 w-8.5 items-center justify-center rounded-(--radius-full) bg-danger text-white">
							<Flame size={19} strokeWidth={2.5} />
						</div>
						<div>
							<h3 className="m-0 text-[1.1rem] font-extrabold text-(--text-main)">
								Daftar Titik Panas & Pantauan Karhutla
							</h3>
							<span className="text-[0.725rem] font-semibold text-(--text-muted)">
								Observasi Satelit VIIRS SNPP (375m), NOAA-20 &
								MODIS (NASA FIRMS / SiPongi+ KLHK)
							</span>
						</div>
					</div>
					<button
						onClick={onClose}
						className="flat-btn-secondary h-8 w-8 p-0"
						aria-label="Tutup"
					>
						<X size={16} />
					</button>
				</div>

				{/* Filter Toolbar */}
				<div className="flex flex-col gap-[0.65rem] border-b-2 border-b-(--border-flat) bg-(--bg-muted) px-6 py-[0.85rem]">
					{/* Search Box */}
					<div className="relative">
						<Search
							size={15}
							color="var(--text-muted)"
							className="absolute top-1/2 left-2.5 -translate-y-1/2"
						/>
						<input
							type="text"
							placeholder="Cari lokasi, pulau, tipe lahan (cth: Bromo, Arjuno, Bengkalis, Gambut, Savana)..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full rounded-sm border-2 border-(--border-flat) bg-(--bg-card) py-[0.45rem] pr-3 pl-8 text-[0.8rem] text-(--text-main) outline-none"
						/>
					</div>

					{/* Region Buttons */}
					<div className="flex gap-[0.35rem] overflow-x-auto pb-0.5">
						{REGIONS.map((region) => (
							<button
								key={region}
								onClick={() => setSelectedRegion(region)}
								className={`flat-btn-secondary min-h-6.5 px-2.25 py-0.75 text-[0.7rem] whitespace-nowrap ${selectedRegion === region ? "active font-extrabold" : "font-semibold"}`}
							>
								{region}
							</button>
						))}
					</div>

					{/* Confidence Filter Chips & Quick Counter */}
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div className="flex gap-[0.35rem] overflow-x-auto">
							{CONFIDENCE_FILTERS.map((f) => (
								<button
									key={f.id}
									onClick={() => setConfidenceFilter(f.id)}
									className={`cursor-pointer rounded-sm px-2 py-0.5 text-[0.675rem] font-bold whitespace-nowrap ${confidenceFilter === f.id ? "border border-danger bg-[rgba(239,68,68,0.1)] text-[#dc2626]" : "border-2 border-(--border-flat) bg-(--bg-card) text-(--text-muted)"}`}
								>
									{f.label}
								</button>
							))}
						</div>

						<span className="text-[0.7rem] font-bold text-(--text-muted)">
							Menampilkan {filteredHotspots.length} dari{" "}
							{rawList.length} titik se-Indonesia
						</span>
					</div>
				</div>

				{/* Hotspots List */}
				<div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-4">
					{filteredHotspots.length === 0 ? (
						<div className="px-4 py-10 text-center text-(--text-muted)">
							<p className="m-0 text-[0.9rem] font-bold">
								Tidak ada titik panas yang cocok dengan filter
								pencarian
							</p>
							<span className="text-[0.75rem]">
								Coba ubah kata kunci atau pilih region 'Semua'.
							</span>
						</div>
					) : (
						filteredHotspots.map((h) => {
							const isHigh =
								h.confidence.includes("Tinggi") ||
								h.confidenceLevel === "HIGH";
							return (
								<div
									key={h.id}
									className="flex flex-wrap items-center justify-between gap-3 rounded-md border-2 border-(--border-flat) bg-(--bg-card) px-[1.15rem] py-[0.85rem]"
								>
									<div>
										<div className="flex flex-wrap items-center gap-2">
											<strong className="text-[0.95rem] font-extrabold text-(--text-main)">
												{h.regency}
											</strong>
											<span
												className={`rounded-[3px] px-1.5 py-0.5 text-[0.675rem] font-extrabold ${isHigh ? "bg-[#fee2e2] text-[#dc2626]" : "bg-[#fef3c7] text-[#d97706]"}`}
											>
												{h.confidence}
											</span>
										</div>

										<span className="mt-[0.2rem] block text-[0.75rem] font-semibold text-(--text-muted)">
											{h.province} ({h.island}) ·{" "}
											<span className="text-(--text-main)">
												{h.type}
											</span>
										</span>

										<div className="mt-[0.4rem] flex flex-wrap items-center gap-3 text-[0.7rem] text-(--text-muted)">
											<span className="inline-flex items-center gap-0.75">
												<Satellite size={12} />{" "}
												{h.satellite}
											</span>
											<span className="inline-flex items-center gap-0.75">
												<Thermometer size={12} />{" "}
												{h.brightnessK} K
											</span>
											<span className="inline-flex items-center gap-0.75">
												<Zap size={12} /> {h.frpMw} MW
											</span>
											<span className="inline-flex items-center gap-0.75 font-bold text-[#059669]">
												<ShieldCheck size={12} />{" "}
												{h.source ||
													"NASA FIRMS / SiPongi+"}
											</span>
										</div>
									</div>

									<div className="flex flex-col items-end gap-[0.35rem]">
										{h.distanceKm !== null && (
											<span className="text-[0.825rem] font-extrabold text-primary">
												<span className="inline-flex items-center gap-0.75">
													<MapPin size={13} />{" "}
													{h.distanceKm} km
												</span>
											</span>
										)}
									</div>
								</div>
							);
						})
					)}
				</div>

				{/* Modal Footer */}
				<div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-t-(--border-flat) bg-(--bg-muted) px-6 py-[0.85rem] text-[0.725rem] text-(--text-muted)">
					<div className="flex items-center gap-3">
						<span>
							Sumber: <strong>NASA FIRMS (VIIRS/MODIS)</strong> &{" "}
							<strong>KLHK SiPongi+</strong>
						</span>
						<a
							href="https://sipongi.gakkum.kehutanan.go.id/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-0.75 font-bold text-primary no-underline"
						>
							<span>Portal SiPongi+</span>
							<ExternalLink size={11} />
						</a>
					</div>

					<button
						onClick={onClose}
						className="flat-btn-secondary px-3 py-1 text-[0.75rem]"
					>
						Tutup
					</button>
				</div>
			</div>
		</div>
	);
}
