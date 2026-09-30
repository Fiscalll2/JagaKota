import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	Circle,
	useMap,
	useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { INDONESIA_CITIES } from "../../utils/cities";
import {
	INDONESIA_VOLCANOES,
	VOLCANO_STATUS_LEVELS,
} from "../../utils/volcanoes";
import { SATELLITE_HOTSPOTS } from "../../utils/karhutla";
import { translations } from "../../utils/i18n";
import {
	MapPin,
	Compass,
	ZoomIn,
	ZoomOut,
	Flame,
	Mountain,
	Activity,
} from "lucide-react";

// Inline SVG data URIs - 100% offline, 0 network requests, never broken image
const cityPinSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" width="24" height="30">
  <defs>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 18 8 18s8-12.75 8-18c0-4.42-3.58-8-8-8z" fill="#2563eb" stroke="#ffffff" stroke-width="1.5" filter="url(#sh)"/>
  <circle cx="12" cy="10" r="3" fill="#ffffff"/>
</svg>
`)}`;

const activeCityPinSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 34" width="26" height="34">
  <defs>
    <filter id="sh-act" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#2563eb" flood-opacity="0.6"/>
    </filter>
  </defs>
  <path d="M13 2C7.5 2 3 6.5 3 12c0 6.5 10 20 10 20s10-13.5 10-20c0-5.5-4.5-10-10-10z" fill="#3b82f6" stroke="#ffffff" stroke-width="2" filter="url(#sh-act)"/>
  <circle cx="13" cy="12" r="4" fill="#ffffff"/>
</svg>
`)}`;

const flamePinSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" width="24" height="30">
  <defs>
    <filter id="sh-flame" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#ef4444" flood-opacity="0.5"/>
    </filter>
  </defs>
  <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 18 8 18s8-12.75 8-18c0-4.42-3.58-8-8-8z" fill="#dc2626" stroke="#ffffff" stroke-width="1.5" filter="url(#sh-flame)"/>
  <path d="M12 8c-1.2 1.8-0.8 3 0 4.5 0.5-1.2 0.8-1.8 0-4.5z" fill="#fef08a"/>
</svg>
`)}`;

const cityIcon = L.icon({
	iconUrl: cityPinSvg,
	iconSize: [20, 25],
	iconAnchor: [10, 25],
	popupAnchor: [0, -22],
});

const activeCityIcon = L.icon({
	iconUrl: activeCityPinSvg,
	iconSize: [26, 34],
	iconAnchor: [13, 34],
	popupAnchor: [0, -30],
});

const flameIcon = L.icon({
	iconUrl: flamePinSvg,
	iconSize: [22, 28],
	iconAnchor: [11, 28],
	popupAnchor: [0, -25],
});

function getEarthquakeColor(mag) {
	if (mag >= 7.0) return "#dc2626";
	if (mag >= 5.0) return "#f97316";
	return "#eab308";
}

function MapViewManager({ targetView, onZoomChange }) {
	const map = useMap();

	useEffect(() => {
		map.invalidateSize();
		const t1 = setTimeout(() => map.invalidateSize(), 150);
		const t2 = setTimeout(() => map.invalidateSize(), 500);

		const resizeHandler = () => {
			map.invalidateSize();
		};
		window.addEventListener("resize", resizeHandler);

		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
			window.removeEventListener("resize", resizeHandler);
		};
	}, [map]);

	useMapEvents({
		zoomend: () => {
			if (onZoomChange) onZoomChange(map.getZoom());
		},
	});

	useEffect(() => {
		if (!targetView) return;
		map.flyTo(targetView.center, targetView.zoom, {
			duration: 1.2,
			easeLinearity: 0.25,
		});
	}, [targetView, map]);

	return null;
}

function CustomMapControls({ onResetNusantara, onFocusCity, cityName }) {
	const map = useMap();

	return (
		<div className="absolute top-3 right-3 z-1000 flex flex-col gap-1.5">
			<div className="flex flex-col overflow-hidden rounded-sm border border-(--border-flat) shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
				<button
					onClick={() => map.zoomIn()}
					title="Zoom In (Perbesar)"
					aria-label="Perbesar peta"
					className="flex h-9 w-9 cursor-pointer items-center justify-center border-0 border-b border-(--border-flat) bg-(--bg-card) text-base font-black text-(--text-main) transition-colors duration-150"
				>
					<ZoomIn size={16} />
				</button>
				<button
					onClick={() => map.zoomOut()}
					title="Zoom Out (Perkecil)"
					aria-label="Perkecil peta"
					className="flex h-9 w-9 cursor-pointer items-center justify-center border-0 bg-(--bg-card) text-base font-black text-(--text-main) transition-colors duration-150"
				>
					<ZoomOut size={16} />
				</button>
			</div>

			<button
				onClick={onFocusCity}
				title={`Fokus ke kota ${cityName || "terpilih"}`}
				aria-label="Fokus ke kota aktif"
				className="flex min-h-9 cursor-pointer items-center gap-1.25 rounded-sm border border-(--border-flat) bg-(--bg-card) px-2.5 py-1.5 text-[0.725rem] font-extrabold text-primary-hover shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
			>
				<MapPin size={13} />
				<span>Kota</span>
			</button>

			<button
				onClick={onResetNusantara}
				title="Reset tampilan ke seluruh Nusantara"
				aria-label="Reset tampilan Nusantara"
				className="flex min-h-9 cursor-pointer items-center gap-1.25 rounded-sm border border-(--border-flat) bg-(--bg-card) px-2.5 py-1.5 text-[0.725rem] font-extrabold text-(--text-main) shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
			>
				<Compass size={13} />
				<span>Nusantara</span>
			</button>
		</div>
	);
}

export function IndonesiaMap({
	currentLocation,
	earthquakes,
	hotspots = SATELLITE_HOTSPOTS,
	onSelectCity,
}) {
	const t = translations;
	const initialCenter = useMemo(
		() => [
			currentLocation?.lat || -2.5489,
			currentLocation?.lon || 118.0149,
		],
		[currentLocation?.lat, currentLocation?.lon],
	);

	// Layer toggles
	const [showCities, setShowCities] = useState(true);
	const [showVolcanoes, setShowVolcanoes] = useState(true);
	const [showHotspots, setShowHotspots] = useState(true);
	const [showEarthquakes, setShowEarthquakes] = useState(true);
	const [currentZoom, setCurrentZoom] = useState(9);

	const [targetView, setTargetView] = useState({
		center: initialCenter,
		zoom: 9,
	});

	useEffect(() => {
		if (currentLocation?.lat && currentLocation?.lon) {
			setTargetView({
				center: [currentLocation.lat, currentLocation.lon],
				zoom: 10,
			});
		}
	}, [currentLocation?.lat, currentLocation?.lon]);

	const handleResetNusantara = useCallback(() => {
		setTargetView({
			center: [-2.5489, 118.0149],
			zoom: 5,
		});
	}, []);

	const handleFocusCity = useCallback(() => {
		if (currentLocation?.lat && currentLocation?.lon) {
			setTargetView({
				center: [currentLocation.lat, currentLocation.lon],
				zoom: 11,
			});
		}
	}, [currentLocation?.lat, currentLocation?.lon]);

	const handleCityMarkerClick = useCallback(
		(city) => {
			onSelectCity(city);
			setTargetView({
				center: [city.lat, city.lon],
				zoom: 11,
			});
		},
		[onSelectCity],
	);

	const visibleCities = useMemo(() => {
		const activeName = currentLocation?.city || currentLocation?.name;
		if (currentZoom <= 6) {
			const hubs = INDONESIA_CITIES.slice(0, 75);
			const activeObj = INDONESIA_CITIES.find(
				(c) => c.name === activeName,
			);
			if (activeObj && !hubs.some((c) => c.name === activeName)) {
				return [...hubs, activeObj];
			}
			return hubs;
			bg - (--bg - muted);
		}
		return INDONESIA_CITIES;
	}, [currentZoom, currentLocation?.city, currentLocation?.name]);

	const toggleBtn =
		"flex min-h-8 cursor-pointer items-center gap-[0.35rem] rounded-[var(--radius-sm)] border border-[var(--border-flat)] px-2.5 py-[5px] text-[0.725rem] font-bold transition-all duration-150";

	return (
		<div className="flat-card relative p-6">
			{/* Header & Layer Filters */}
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div>
					<div className="flex flex-wrap items-center gap-[0.65rem]">
						<h3 className="m-0 text-[1.05rem] font-extrabold text-(--text-main)">
							{t.mapTitle}
						</h3>
					</div>
					<p className="mx-0 mt-0.5 mb-0 text-[0.825rem] font-medium text-(--text-muted)">
						{t.mapSubtitle}
					</p>
				</div>

				{/* Filter Badges / Layer Toggles */}
				<div className="flex flex-wrap items-center gap-[0.4rem]">
					<button
						onClick={() => setShowCities(!showCities)}
						aria-label="Toggle layer stasiun kota"
						className={`${toggleBtn} ${showCities ? "bg-[rgba(37,99,235,0.15)] text-primary-hover" : "bg-(--bg-muted) text-(--text-muted)"}`}
					>
						<MapPin size={13} strokeWidth={2.2} />
						<span>Kota ({visibleCities.length})</span>
					</button>

					<button
						onClick={() => setShowEarthquakes(!showEarthquakes)}
						aria-label="Toggle layer gempa bumi BMKG"
						className={`${toggleBtn} ${showEarthquakes ? "bg-[rgba(239,68,68,0.15)] text-danger" : "bg-(--bg-muted) text-(--text-muted)"}`}
					>
						<Activity size={13} strokeWidth={2.2} />
						<span>
							Gempa ({earthquakes ? earthquakes.length : 0})
						</span>
					</button>

					<button
						onClick={() => setShowVolcanoes(!showVolcanoes)}
						aria-label="Toggle layer gunung api PVMBG"
						className={`${toggleBtn} ${showVolcanoes ? "bg-[rgba(249,115,22,0.15)] text-[#ea580c]" : "bg-(--bg-muted) text-(--text-muted)"}`}
					>
						<Mountain size={13} strokeWidth={2.2} />
						<span>Gunung Api ({INDONESIA_VOLCANOES.length})</span>
					</button>

					<button
						onClick={() => setShowHotspots(!showHotspots)}
						aria-label="Toggle layer titik panas karhutla"
						className={`${toggleBtn} ${showHotspots ? "bg-[rgba(239,68,68,0.15)] text-[#dc2626]" : "bg-(--bg-muted) text-(--text-muted)"}`}
					>
						<Flame size={13} strokeWidth={2.2} />
						<span>
							Titik Panas ({hotspots ? hotspots.length : 0})
						</span>
					</button>
				</div>
			</div>

			{/* Map Container */}
			<div className="map-wrapper relative h-110 w-full overflow-hidden">
				<MapContainer
					key={"map-container"}
					center={initialCenter}
					zoom={9}
					minZoom={4}
					maxZoom={19}
					scrollWheelZoom={true}
					doubleClickZoom={true}
					touchZoom={true}
					zoomControl={false}
					preferCanvas={true}
					className="h-full w-full"
				>
					<MapViewManager
						targetView={targetView}
						onZoomChange={setCurrentZoom}
					/>
					<CustomMapControls
						onResetNusantara={handleResetNusantara}
						onFocusCity={handleFocusCity}
						cityName={
							currentLocation?.city || currentLocation?.name
						}
					/>

					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						subdomains={["a", "b", "c"]}
						maxZoom={19}
					/>

					{/* Current selected city indicator rings */}
					{currentLocation?.lat && currentLocation?.lon && (
						<>
							<Circle
								center={[
									currentLocation.lat,
									currentLocation.lon,
								]}
								radius={25000}
								pathOptions={{
									color: "#3b82f6",
									fillColor: "#3b82f6",
									fillOpacity: 0.2,
									weight: 2,
								}}
							/>
							<Circle
								center={[
									currentLocation.lat,
									currentLocation.lon,
								]}
								radius={8000}
								pathOptions={{
									color: "#2563eb",
									fillColor: "#2563eb",
									fillOpacity: 0.5,
									weight: 2.5,
								}}
							/>
						</>
					)}

					{/* City markers */}
					{showCities &&
						visibleCities.map((city) => {
							const isSelected =
								city.name ===
								(currentLocation?.city ||
									currentLocation?.name);
							return (
								<Marker
									key={city.name}
									position={[city.lat, city.lon]}
									icon={
										isSelected ? activeCityIcon : cityIcon
									}
									eventHandlers={{
										click: () =>
											handleCityMarkerClick(city),
									}}
								>
									<Popup>
										<div className="p-1.5 text-center font-sans">
											<strong className="block text-[0.95rem] text-gray-900">
												{city.name}
											</strong>
											<p className="mx-0 mt-0.75 mb-0 text-xs text-gray-500">
												Provinsi: {city.province}
											</p>
											<p className="mx-0 mt-0.5 mb-1.5 text-[0.7rem] text-gray-400">
												Koordinat: {city.lat.toFixed(2)}
												, {city.lon.toFixed(2)}
											</p>
											<button
												onClick={() =>
													handleCityMarkerClick(city)
												}
												className="w-full cursor-pointer rounded border-0 bg-primary-hover px-3 py-1.5 text-xs font-extrabold text-white"
											>
												Zoom & Pantau Kota Ini
											</button>
										</div>
									</Popup>
								</Marker>
							);
						})}

					{/* Karhutla Hotspot Satellite Markers */}
					{showHotspots &&
						hotspots &&
						hotspots.map((h) => {
							if (!h.lat || !h.lon) return null;
							return (
								<React.Fragment key={h.id}>
									<Circle
										center={[h.lat, h.lon]}
										radius={18000}
										pathOptions={{
											color: "#ef4444",
											fillColor: "#dc2626",
											fillOpacity: 0.35,
											weight: 1.5,
										}}
									/>
									<Marker
										position={[h.lat, h.lon]}
										icon={flameIcon}
									>
										<Popup>
											<div className="p-1.5 text-center font-sans">
												<div className="flex items-center justify-center gap-1.25">
													<span className="text-[0.95rem] font-extrabold text-gray-900">
														{h.regency}
													</span>
												</div>
												<span className="mx-0 my-1 inline-block rounded-[3px] bg-red-100 px-1.75 py-0.5 text-[0.7rem] font-extrabold text-red-700">
													Satelit {h.satellite} ·{" "}
													{h.confidence}
												</span>
												<p className="mx-0 my-0.5 text-xs font-semibold text-gray-600">
													{h.province} · {h.type}
												</p>
												<p className="mx-0 mt-0.5 mb-1.5 text-[0.7rem] text-gray-500">
													Suhu: {h.brightnessK} K ·
													Daya: {h.frpMw} MW
												</p>
												<button
													onClick={() => {
														setTargetView({
															center: [
																h.lat,
																h.lon,
															],
															zoom: 11,
														});
													}}
													className="w-full cursor-pointer rounded border-0 bg-red-700 px-2.5 py-1.25 text-[0.725rem] font-extrabold text-white"
												>
													Fokus ke Titik Ini
												</button>
											</div>
										</Popup>
									</Marker>
								</React.Fragment>
							);
						})}

					{/* Volcano markers */}
					{showVolcanoes &&
						INDONESIA_VOLCANOES.map((v) => {
							const status =
								VOLCANO_STATUS_LEVELS[v.statusLevel] ||
								VOLCANO_STATUS_LEVELS[1];
							return (
								<Circle
									key={v.id}
									center={[v.lat, v.lon]}
									radius={(v.dangerRadiusKm || 3) * 1000}
									pathOptions={{
										color: status.color,
										fillColor: status.color,
										fillOpacity: 0.55,
										weight: 2,
									}}
								>
									<Popup>
										<div className="p-1 font-sans">
											<div className="flex items-center gap-[0.4rem]">
												<Mountain
													size={15}
													color={status.color}
												/>
												<strong className="text-[0.95rem] text-gray-900">
													{v.name}
												</strong>
											</div>
											<span
												className="mx-0 my-1 inline-block rounded-[3px] px-1.5 py-0.5 text-[0.7rem] font-extrabold text-white"
												style={{
													backgroundColor:
														status.color,
												}}
											>
												{status.code} ({status.name})
											</span>
											<p className="mx-0 my-0.5 text-xs font-semibold text-gray-600">
												Elevasi: {v.elevation} mdpl ·{" "}
												{v.province}
											</p>
											<p className="mx-0 mt-0.5 mb-0 text-[0.7rem] text-gray-500">
												`Radius Bahaya PVMBG: $
												{v.dangerRadiusKm} km`
											</p>
										</div>
									</Popup>
								</Circle>
							);
						})}

					{/* Earthquake markers */}
					{showEarthquakes &&
						earthquakes &&
						earthquakes.map((q, idx) => {
							if (!q.lat || !q.lon) return null;
							const color = getEarthquakeColor(q.magnitude);

							return (
								<Circle
									key={q.id || idx}
									center={[q.lat, q.lon]}
									radius={(q.magnitude || 4) * 15000}
									pathOptions={{
										color: color,
										fillColor: color,
										fillOpacity: 0.45,
										weight: 2,
									}}
								>
									<Popup>
										<div className="p-1 font-sans">
											<span
												className="block text-[0.95rem] font-extrabold"
												style={{ color }}
											>
												Gempa M {q.magnitude}
											</span>
											<p className="mx-0 mt-0.75 mb-0 text-[0.775rem] font-semibold text-gray-900">
												{q.wilayah}
											</p>
											<p className="mx-0 mt-0.5 mb-0 text-[0.7rem] text-gray-500">
												{q.date} {q.time} • Kedalaman{" "}
												{q.depth}
											</p>
											{q.potensi && (
												<span className="mt-1 inline-block rounded-[3px] bg-red-50 px-1.25 py-0.5 text-[0.7rem] font-bold text-red-800">
													{q.potensi}
												</span>
											)}
										</div>
									</Popup>
								</Circle>
							);
						})}
				</MapContainer>
			</div>
		</div>
	);
}
