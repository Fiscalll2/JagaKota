import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, MapPin, ChevronRight, Compass, Flame } from "lucide-react";
import { INDONESIA_CITIES, REGIONS } from "../../utils/cities";
import { fetchWeatherData } from "../../services/weather";
import { fetchAirQualityData } from "../../services/airQuality";
import { triggerHaptic } from "../../utils/haptics";

const POPULAR_CITIES = [
	"Jakarta Pusat",
	"Surabaya",
	"Bandung",
	"Medan",
	"Denpasar",
	"Nusantara (IKN Sepaku)",
	"Makassar",
	"Yogyakarta",
	"Semarang",
	"Palembang",
];

export function CitySearchModal({
	isOpen,
	onClose,
	onSelectCity,
	currentCity = {},
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRegion, setSelectedRegion] = useState("Semua");
	const inputRef = useRef(null);

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => inputRef.current?.focus(), 80);
		} else {
			setSearchTerm("");
			setSelectedRegion("Semua");
		}
	}, [isOpen]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && isOpen) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	const filteredCities = useMemo(() => {
		return INDONESIA_CITIES.filter((city) => {
			const matchRegion =
				selectedRegion === "Semua" ||
				city.region === selectedRegion ||
				(selectedRegion === "Nusantara" &&
					city.name.includes("Nusantara"));

			if (!searchTerm) return matchRegion;

			const q = searchTerm.toLowerCase().trim();
			return (
				matchRegion &&
				(city.name.toLowerCase().includes(q) ||
					city.province.toLowerCase().includes(q) ||
					city.region.toLowerCase().includes(q))
			);
		});
	}, [searchTerm, selectedRegion]);

	// Prefetch city data into cache on hover/touch for instant click response
	const prefetchCityData = (city) => {
		if (!city?.lat || !city?.lon) return;
		fetchWeatherData(city.lat, city.lon, false).catch(() => {});
		fetchAirQualityData(city.lat, city.lon, false).catch(() => {});
	};

	if (!isOpen) return null;

	const currentCityCleanName = currentCity?.name
		? currentCity.name.replace(" (GPS)", "")
		: "";

	return (
		<div
			className="fixed inset-0 z-9999 flex items-center justify-center bg-[rgba(15,23,42,0.72)] p-4 backdrop-blur-[6px]"
			onClick={onClose}
		>
			<div
				className="flat-card animate-fade-in flex max-h-[88vh] w-full max-w-150 flex-col overflow-hidden border-2 border-(--border-flat) bg-(--bg-card) p-0"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Search Header */}
				<div className="border-b-2 border-b-(--border-flat) bg-(--bg-card) p-5">
					<div className="mb-[0.85rem] flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-sm bg-secondary text-white">
								<Compass size={18} strokeWidth={2.5} />
							</div>
							<h3 className="m-0 text-[1.15rem] font-extrabold tracking-[-0.02em] text-(--text-main)">
								Pilih Kota & Kabupaten
							</h3>
						</div>
						<button
							onClick={onClose}
							aria-label="Tutup"
							className="flat-btn-secondary min-h-8 px-2 py-1"
						>
							<X size={16} strokeWidth={2.5} />
						</button>
					</div>

					{/* Search Input Bar */}
					<div className="relative flex items-center">
						<Search
							size={18}
							className="absolute left-3 text-(--text-muted)"
							strokeWidth={2.5}
						/>
						<input
							ref={inputRef}
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Cari 515 kota, kabupaten, atau provinsi..."
							className="w-full rounded-md border-2 border-(--border-flat) bg-(--bg-muted) py-3 pr-[2.2rem] pl-10 text-[0.9rem] font-semibold text-(--text-main) outline-none"
						/>
						{searchTerm && (
							<button
								onClick={() => setSearchTerm("")}
								className="absolute right-3 flex cursor-pointer items-center border-0 bg-transparent text-(--text-muted)"
							>
								<X size={16} strokeWidth={2.5} />
							</button>
						)}
					</div>

					{/* Quick Popular Pills */}
					{!searchTerm && selectedRegion === "Semua" && (
						<div className="flex items-center gap-[0.35rem] overflow-x-auto pt-3 scrollbar-none">
							<span className="flex shrink-0 items-center gap-0.5 text-[0.7rem] font-bold text-(--text-muted)">
								<Flame
									size={13}
									color="var(--color-accent)"
									strokeWidth={2.5}
								/>{" "}
								Populer:
							</span>
							{POPULAR_CITIES.map((name) => {
								const cityObj = INDONESIA_CITIES.find(
									(c) => c.name === name,
								);
								if (!cityObj) return null;
								return (
									<button
										key={name}
										onMouseEnter={() =>
											prefetchCityData(cityObj)
										}
										onTouchStart={() =>
											prefetchCityData(cityObj)
										}
										onClick={() => {
											triggerHaptic(12);
											onSelectCity(cityObj);
											onClose();
										}}
										className="cursor-pointer rounded-sm border-2 border-(--border-flat) bg-(--bg-muted) px-2.25 py-0.75 text-[0.725rem] font-bold whitespace-nowrap text-(--text-main)"
									>
										{name.split(" ")[0]}
									</button>
								);
							})}
						</div>
					)}

					{/* Region Filter Pills */}
					<div className="flex gap-[0.35rem] overflow-x-auto pt-3 scrollbar-none">
						{REGIONS.map((r) => (
							<button
								key={r}
								onClick={() => {
									triggerHaptic(8);
									setSelectedRegion(r);
								}}
								className={`cursor-pointer rounded-(--radius-full) px-2.5 py-1 text-[0.75rem] font-bold whitespace-nowrap ${selectedRegion === r ? "border-2 border-secondary bg-(--color-secondary-bg) text-secondary" : "border-2 border-(--border-flat) bg-(--bg-muted) text-(--text-main)"}`}
							>
								{r}
							</button>
						))}
					</div>
				</div>

				{/* Results List */}
				<div className="flex-1 overflow-y-auto bg-(--bg-card) px-5 py-[0.85rem]">
					<div className="mb-[0.65rem] flex items-center justify-between">
						<span className="text-[0.75rem] font-bold text-(--text-muted)">
							Menampilkan {Math.min(filteredCities.length, 80)}{" "}
							dari {filteredCities.length} kota & kabupaten
						</span>
					</div>

					{filteredCities.length === 0 ? (
						<div className="px-4 py-12 text-center text-(--text-muted)">
							<p className="m-0 text-[0.95rem] font-bold text-(--text-main)">
								Tidak ditemukan kota "{searchTerm}".
							</p>
							<p className="mt-[0.35rem] text-[0.8rem]">
								Periksa ejaan nama kota/kabupaten Anda atau
								pilih pulau lain.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-[0.45rem]">
							{filteredCities.slice(0, 80).map((city) => {
								const isSelected = currentCityCleanName
									? currentCityCleanName === city.name
									: false;
								return (
									<div
										key={city.name}
										onMouseEnter={() =>
											prefetchCityData(city)
										}
										onTouchStart={() =>
											prefetchCityData(city)
										}
										onClick={() => {
											triggerHaptic(12);
											onSelectCity(city);
											onClose();
										}}
										className={`flex cursor-pointer items-center justify-between rounded-md px-4 py-3 transition-transform ${isSelected ? "border-2 border-secondary bg-(--color-secondary-bg)" : "border-2 border-(--border-flat) bg-(--bg-muted)"}`}
									>
										<div className="flex min-w-0 items-center gap-[0.65rem]">
											<div
												className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-(--radius-full) ${isSelected ? "bg-secondary text-white" : "bg-(--bg-card) text-secondary"}`}
											>
												<MapPin
													size={15}
													strokeWidth={2.5}
												/>
											</div>
											<div className="min-w-0">
												<strong
													className={`block overflow-hidden text-[0.9rem] whitespace-nowrap text-ellipsis ${isSelected ? "text-secondary" : "text-(--text-main)"}`}
												>
													{city.name}
												</strong>
												<span className="block overflow-hidden text-[0.725rem] font-semibold whitespace-nowrap text-ellipsis text-(--text-muted)">
													{city.province} •{" "}
													{city.region}
												</span>
											</div>
										</div>
										<div className="flex shrink-0 items-center gap-[0.4rem]">
											{isSelected ? (
												<span className="rounded-sm border border-secondary bg-(--color-secondary-bg) px-2 py-0.5 text-[0.7rem] font-extrabold text-secondary">
													Aktif
												</span>
											) : (
												<ChevronRight
													size={16}
													color="var(--text-muted)"
													strokeWidth={2.5}
												/>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Footer info */}
				<div className="flex items-center justify-between border-t-2 border-t-(--border-flat) bg-(--bg-muted) px-5 py-[0.85rem] text-[0.75rem] font-semibold text-(--text-muted)">
					<span>Tekan ESC untuk menutup</span>
					<span>BMKG Official 38 Provinsi (515 Wilayah)</span>
				</div>
			</div>
		</div>
	);
}

export default CitySearchModal;
