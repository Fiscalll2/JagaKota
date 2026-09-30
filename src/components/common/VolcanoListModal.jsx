import React, { useState, useMemo } from "react";
import { Flame, X, Search, MapPin } from "lucide-react";
import { getNearbyVolcanoes } from "../../services/volcano";

const REGIONS = [
	"Semua",
	"Jawa",
	"Sumatera",
	"Bali & Nusa Tenggara",
	"Sulawesi",
	"Maluku",
];
const STATUS_FILTERS = [
	{ id: "ALL", label: "Semua Status" },
	{ id: "ALERT", label: "Siaga & Awas (Level III/IV)" },
	{ id: "WASPADA", label: "Waspada (Level II)" },
	{ id: "NORMAL", label: "Normal (Level I)" },
];

export function VolcanoListModal({ isOpen, onClose, userLocation }) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRegion, setSelectedRegion] = useState("Semua");
	const [statusFilter, setStatusFilter] = useState("ALL");

	const { allVolcanoes } = useMemo(() => {
		return getNearbyVolcanoes(userLocation?.lat, userLocation?.lon);
	}, [userLocation?.lat, userLocation?.lon]);

	const filteredVolcanoes = useMemo(() => {
		return (allVolcanoes || []).filter((v) => {
			const matchSearch =
				v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				v.province.toLowerCase().includes(searchTerm.toLowerCase());
			const matchRegion =
				selectedRegion === "Semua" || v.region === selectedRegion;

			let matchStatus = true;
			if (statusFilter === "ALERT") matchStatus = v.statusLevel >= 3;
			else if (statusFilter === "WASPADA")
				matchStatus = v.statusLevel === 2;
			else if (statusFilter === "NORMAL")
				matchStatus = v.statusLevel === 1;

			return matchSearch && matchRegion && matchStatus;
		});
	}, [allVolcanoes, searchTerm, selectedRegion, statusFilter]);

	if (!isOpen) return null;

	return (
		<div className="modal-overlay animate-fade-in" onClick={onClose}>
			<div
				className="modal-content flex max-h-[90vh] w-[95%] max-w-160 flex-col overflow-hidden p-0"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b-2 border-b-(--border-flat) bg-(--bg-muted) px-6 py-5">
					<div className="flex items-center gap-[0.65rem]">
						<div className="flex h-9 w-9 items-center justify-center rounded-sm bg-danger text-white">
							<Flame size={20} strokeWidth={2.5} />
						</div>
						<div>
							<h3 className="m-0 text-[1.15rem] font-extrabold text-(--text-main)">
								Pemantauan Gunung Api Indonesia
							</h3>
							<p className="m-0 text-[0.75rem] font-semibold text-(--text-muted)">
								Status Aktivitas Vulkanik Resmi PVMBG / MAGMA
								ESDM
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						aria-label="Tutup"
						className="flat-btn-secondary min-h-8 px-2 py-1"
					>
						<X size={16} strokeWidth={2.5} />
					</button>
				</div>

				{/* Filters */}
				<div className="border-b-2 border-b-(--border-flat) bg-(--bg-card) px-5 py-4">
					{/* Search Input */}
					<div className="relative mb-3 flex items-center">
						<Search
							size={16}
							color="var(--text-muted)"
							className="absolute left-3"
						/>
						<input
							type="text"
							placeholder="Cari nama gunung api atau provinsi..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full rounded-sm border-2 border-(--border-flat) bg-(--bg-muted) py-2 pr-3 pl-9 text-[0.85rem] font-semibold text-(--text-main)"
						/>
					</div>

					{/* Region Tabs */}
					<div className="flex gap-[0.35rem] overflow-x-auto pb-[0.35rem]">
						{REGIONS.map((r) => (
							<button
								key={r}
								onClick={() => setSelectedRegion(r)}
								className={`flat-btn-secondary min-h-7 px-2.5 py-1 text-[0.75rem] whitespace-nowrap ${selectedRegion === r ? "active" : ""}`}
							>
								{r}
							</button>
						))}
					</div>

					{/* Status Filter Tabs */}
					<div className="flex gap-[0.35rem] overflow-x-auto pt-[0.35rem]">
						{STATUS_FILTERS.map((sf) => (
							<button
								key={sf.id}
								onClick={() => setStatusFilter(sf.id)}
								className={`cursor-pointer rounded-sm px-2 py-0.75 text-[0.7rem] whitespace-nowrap ${statusFilter === sf.id ? "border border-primary bg-(--color-primary-bg) font-extrabold text-primary" : "border-2 border-(--border-flat) bg-(--bg-muted) font-semibold text-(--text-muted)"}`}
							>
								{sf.label}
							</button>
						))}
					</div>
				</div>

				{/* Volcano Items List */}
				<div className="flex-1 overflow-y-auto px-5 py-3">
					<div className="flex flex-col gap-[0.65rem]">
						{filteredVolcanoes.length === 0 ? (
							<div className="p-8 text-center text-[0.85rem] text-(--text-muted)">
								Tidak ada gunung api yang sesuai dengan
								pencarian.
							</div>
						) : (
							filteredVolcanoes.map((v) => (
								<div
									key={v.id}
									className="flex flex-col gap-[0.4rem] rounded-md border-2 border-(--border-flat) bg-(--bg-card) px-4 py-[0.9rem]"
								>
									<div className="flex flex-wrap items-center justify-between gap-[0.4rem]">
										<div>
											<strong className="text-[0.95rem] font-extrabold text-(--text-main)">
												{v.name}
											</strong>
											<span className="ml-[0.4rem] text-[0.75rem] text-(--text-muted)">
												({v.elevation} mdpl ·{" "}
												{v.province})
											</span>
										</div>

										<span
											className="rounded-sm px-2 py-0.5 text-[0.7rem] font-extrabold text-white"
											style={{
												backgroundColor: v.status.color,
											}}
										>
											{v.status.code} ({v.status.name})
										</span>
									</div>

									<p className="m-0 text-[0.775rem] font-semibold text-(--text-main)">
										{v.note || v.status.description}
									</p>

									<div className="mt-1 flex items-center justify-between text-[0.725rem] font-semibold text-(--text-muted)">
										<span className="inline-flex items-center gap-1">
											<MapPin size={13} /> Jarak:{" "}
											<strong className="text-primary">
												{v.distanceKm} km
											</strong>{" "}
											dari posisi Anda
										</span>
										<span>
											Radius bahaya: {v.dangerRadiusKm} km
										</span>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="border-t-2 border-t-(--border-flat) bg-(--bg-muted) px-5 py-3 text-center text-[0.725rem] font-semibold text-(--text-muted)">
					Data diperbarui berdasarkan pengamatan seismik & visual
					PVMBG Badan Geologi ESDM
				</div>
			</div>
		</div>
	);
}
