import React, { useState } from "react";
import {
	Share2,
	Download,
	Copy,
	Check,
	X,
	Sparkles,
	Calendar,
	Flame,
	Zap,
	AlertTriangle,
	ShieldCheck,
	Cigarette,
} from "lucide-react";
import { getAqiInfo } from "../../utils/aqi.js";
import { calculateEcoHealthScore } from "../../utils/healthIndex.js";
import { getWeatherVisual } from "../../utils/weatherIcons.jsx";
import { formatFullCurrentDate } from "../../utils/format.js";
import {
	calculateFdrs,
	getNearbyHotspots,
	getHazeStatus,
} from "../../utils/karhutla.js";
import { translations } from "../../utils/i18n.js";

export function ShareCardModal({
	isOpen,
	onClose,
	location,
	airQualityData,
	weatherData,
	latestEarthquake,
	karhutlaData,
}) {
	const [copied, setCopied] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	if (!isOpen) return null;

	const t = translations;

	const locationName = location?.name || location?.city || "Indonesia";
	const locationProvince = location?.province || "Indonesia";

	const aqi = Number(airQualityData?.current?.aqi) || 0;
	const pm25 =
		Number(
			airQualityData?.current?.pm25 ?? airQualityData?.current?.pm2_5,
		) || 0;
	const temp = Number(
		weatherData?.current?.temp ?? weatherData?.current?.temperature ?? 28,
	);
	const humidity = Number(weatherData?.current?.humidity ?? 70);
	const uvIndex = Number(weatherData?.current?.uvIndex ?? 0);
	const weatherCode = Number(weatherData?.current?.weatherCode ?? 0);

	const aqiInfo = getAqiInfo(aqi);
	const health = calculateEcoHealthScore(aqi, temp, humidity, uvIndex, pm25);
	const weatherVisual = getWeatherVisual(weatherCode);
	const dateFormatted = formatFullCurrentDate(new Date());

	// Dynamic Infallible Karhutla resolution based on active location coordinates
	const activeKarhutla =
		karhutlaData ||
		(location?.lat
			? {
					fdrs: calculateFdrs(weatherData),
					nearest: getNearbyHotspots(location.lat, location.lon)
						.nearest,
				}
			: null);

	const fdrs = activeKarhutla?.fdrs || calculateFdrs(weatherData);
	const nearestFire =
		activeKarhutla?.nearest ||
		(location?.lat
			? getNearbyHotspots(location.lat, location.lon).nearest
			: null);

	// Cross-Correlation Kabut Asap
	const { isHazeActive } = getHazeStatus(nearestFire, aqi, pm25);

	const hazeStatusText = isHazeActive
		? "⚠️ Terpapar Asap Karhutla"
		: "🟢 Bebas Asap";
	const fireProximityText = nearestFire
		? ` (Titik Api Terdekat: ${nearestFire.regency}, ${nearestFire.distanceKm} km)`
		: "";
	const quakeText = latestEarthquake
		? `• Gempa Terkini: M ${latestEarthquake.magnitude} (${latestEarthquake.wilayah})\n`
		: "";
	const cigsCount = health.cigs ?? health.cigarettesEquivalent ?? 0;
	const shareText = `📍 Laporan Lingkungan & Cuaca Real-Time: ${locationName}\n🌱 Kualitas Udara: AQI ${aqi} (${health.category})\n🚬 Paparan Rokok: ${cigsCount} btg/hari\n🌡️ Cuaca: ${temp}°C • ${weatherVisual.label || "Cerah"}\n⚠️ Status Asap: ${hazeStatusText}${fireProximityText}\n${quakeText}\nPantau selengkapnya di JagaKota: https://jagakota.vercel.app/`;

	// Draw 9:16 high quality story infographic on HTML5 canvas (1080 x 1920) with mathematically guaranteed bounds
	const generateCanvasImage = () => {
		return new Promise((resolve) => {
			const canvas = document.createElement("canvas");
			canvas.width = 1080;
			canvas.height = 1920;
			const ctx = canvas.getContext("2d");

			// 1. Clean Background
			ctx.fillStyle = "#F8FAFC";
			ctx.fillRect(0, 0, 1080, 1920);

			// Top Decorative Brand Banner
			ctx.fillStyle = "#10B981";
			ctx.fillRect(0, 0, 1080, 20);

			// Helper for clean rounded cards
			const drawCard = (x, y, w, h, fill, border) => {
				ctx.beginPath();
				if (ctx.roundRect) {
					ctx.roundRect(x, y, w, h, 24);
				} else {
					ctx.rect(x, y, w, h);
				}
				ctx.fillStyle = fill;
				ctx.fill();
				ctx.strokeStyle = border || "#E2E8F0";
				ctx.lineWidth = 3.5;
				ctx.stroke();
			};

			// Helper: Draw Wrapped and Truncated Text with Strict Bounds
			const drawWrappedText = (
				text,
				x,
				y,
				maxWidth,
				lineHeight,
				maxLines = 2,
			) => {
				if (!text) return y;
				const words = String(text).split(" ");
				let line = "";
				let linesCount = 0;
				let currentY = y;

				for (let n = 0; n < words.length; n++) {
					const testLine = line + (line ? " " : "") + words[n];
					const metrics = ctx.measureText(testLine);

					if (metrics.width > maxWidth && n > 0) {
						linesCount++;
						if (linesCount >= maxLines) {
							let truncated = line;
							while (
								truncated.length > 0 &&
								ctx.measureText(truncated + "...").width >
									maxWidth
							) {
								truncated = truncated.slice(0, -1);
							}
							ctx.fillText(truncated + "...", x, currentY);
							return currentY + lineHeight;
						}
						ctx.fillText(line, x, currentY);
						line = words[n] + " ";
						currentY += lineHeight;
					} else {
						line = testLine;
					}
				}
				ctx.fillText(line, x, currentY);
				return currentY + lineHeight;
			};

			// Infographic Header
			ctx.fillStyle = "#0F172A";
			ctx.font = '800 60px "Outfit", sans-serif';
			ctx.fillText("JagaKota", 80, 115);

			ctx.fillStyle = "#64748B";
			ctx.font = '700 26px "Outfit", sans-serif';
			ctx.fillText("Laporan Lingkungan & Cuaca Real-Time", 80, 160);

			// 1. Location Hero Card (Y=195, H=205)
			drawCard(80, 195, 920, 205, "#FFFFFF", "#E2E8F0");

			const locFont =
				locationName.length > 24
					? '800 40px "Outfit", sans-serif'
					: '800 46px "Outfit", sans-serif';
			ctx.fillStyle = "#0F172A";
			ctx.font = locFont;
			drawWrappedText(locationName, 120, 260, 840, 48, 1);

			ctx.fillStyle = "#64748B";
			ctx.font = '600 26px "Outfit", sans-serif';
			drawWrappedText(locationProvince, 120, 312, 840, 32, 1);

			ctx.fillStyle = "#059669";
			ctx.font = '700 24px "Outfit", sans-serif';
			ctx.fillText(`${dateFormatted}`, 120, 362);

			// 2. Eco-Health Composite Score Card (Y=425, H=245)
			drawCard(80, 425, 920, 245, "#FFFFFF", "#E2E8F0");

			ctx.fillStyle = "#64748B";
			ctx.font = '800 22px "Outfit", sans-serif';
			ctx.fillText(t.ecoScoreTitle, 120, 470);

			ctx.fillStyle = health.color || "#10B981";
			ctx.font = '800 84px "Outfit", sans-serif';
			ctx.fillText(`${health.score}`, 120, 565);

			ctx.fillStyle = "#64748B";
			ctx.font = '800 38px "Outfit", sans-serif';
			ctx.fillText("/100", 250, 565);

			// Dynamic Score Badge
			const badgeText = health.category || "Baik";
			ctx.font = '800 28px "Outfit", sans-serif';
			const badgeTextWidth = ctx.measureText(badgeText).width;
			const badgeWidth = Math.min(
				420,
				Math.max(220, badgeTextWidth + 48),
			);
			const badgeX = 960 - badgeWidth;

			ctx.beginPath();
			if (ctx.roundRect) ctx.roundRect(badgeX, 505, badgeWidth, 68, 16);
			else ctx.rect(badgeX, 505, badgeWidth, 68);
			ctx.fillStyle = health.color || "#10B981";
			ctx.fill();

			ctx.fillStyle = "#FFFFFF";
			ctx.textAlign = "center";
			ctx.fillText(badgeText, badgeX + badgeWidth / 2, 548);
			ctx.textAlign = "left";

			ctx.fillStyle = "#334155";
			ctx.font = '600 24px "Outfit", sans-serif';
			const cigsVal = health.cigs ?? health.cigarettesEquivalent ?? 0;
			const cigsNote = `Setara ${cigsVal} batang rokok/hari (Paparan PM2.5)`;
			drawWrappedText(cigsNote, 120, 635, 840, 30, 1);

			// 3. Grid: AQI & Weather Cards (Y=695, H=310)

			// AQI Card
			drawCard(80, 695, 440, 310, "#FFFFFF", "#E2E8F0");

			ctx.fillStyle = aqiInfo.color || "#10B981";
			ctx.font = '800 22px "Outfit", sans-serif';
			ctx.fillText("KUALITAS UDARA", 120, 745);

			ctx.fillStyle = aqiInfo.color || "#10B981";
			ctx.font = '800 76px "Outfit", sans-serif';
			ctx.fillText(`${aqi}`, 120, 835);

			ctx.fillStyle = "#64748B";
			ctx.font = '700 26px "Outfit", sans-serif';
			ctx.fillText("AQI US", 265, 835);

			ctx.fillStyle = "#0F172A";
			ctx.font = '800 28px "Outfit", sans-serif';
			drawWrappedText(aqiInfo.label, 120, 900, 360, 32, 1);

			ctx.fillStyle = "#64748B";
			ctx.font = '600 22px "Outfit", sans-serif';
			ctx.fillText(`PM2.5: ${pm25} µg/m³`, 120, 960);

			// Weather Card
			drawCard(560, 695, 440, 310, "#FFFFFF", "#E2E8F0");

			ctx.fillStyle = "#3B82F6";
			ctx.font = '800 22px "Outfit", sans-serif';
			ctx.fillText("CUACA SAAT INI", 600, 745);

			ctx.fillStyle = "#0F172A";
			ctx.font = '800 76px "Outfit", sans-serif';
			ctx.fillText(`${temp}°C`, 600, 835);

			ctx.fillStyle = "#0F172A";
			ctx.font = '800 28px "Outfit", sans-serif';
			drawWrappedText(weatherVisual.label, 600, 900, 360, 32, 1);

			ctx.fillStyle = "#64748B";
			ctx.font = '600 22px "Outfit", sans-serif';
			ctx.fillText(`${t.humidity}: ${humidity}%`, 600, 960);

			// 4. Karhutla & Wildfire Haze Alert Card (Y=1030, H=325)
			const hazeCardBorder = isHazeActive ? "#EF4444" : "#E2E8F0";
			drawCard(80, 1030, 920, 325, "#FFFFFF", hazeCardBorder);

			ctx.fillStyle = "#EA580C";
			ctx.font = '800 22px "Outfit", sans-serif';
			ctx.fillText(t.karhutlaCardHeader, 120, 1078);

			// Dynamically Sized Badges Row
			const b1Text = `${t.landLocalBadge}: ${fdrs.code}`;
			ctx.font = '800 20px "Outfit", sans-serif';
			const b1TextWidth = ctx.measureText(b1Text).width;
			const b1Width = Math.max(220, b1TextWidth + 36);

			ctx.beginPath();
			if (ctx.roundRect) ctx.roundRect(120, 1105, b1Width, 48, 12);
			else ctx.rect(120, 1105, b1Width, 48);
			ctx.fillStyle = fdrs.bg || "#ECFDF5";
			ctx.fill();

			ctx.fillStyle = fdrs.color || "#10B981";
			ctx.font = '800 20px "Outfit", sans-serif';
			ctx.fillText(b1Text, 138, 1136);

			// Badge 2: Kabut Asap
			const hazeBadgeBg = isHazeActive ? "#FEE2E2" : "#ECFDF5";
			const hazeBadgeColor = isHazeActive ? "#DC2626" : "#059669";
			const hazeBadgeText = isHazeActive
				? "TERPAPAR KABUT ASAP"
				: "Kabut Asap: Bersih";
			const b2TextWidth = ctx.measureText(hazeBadgeText).width;
			const b2Width = Math.max(240, b2TextWidth + 36);
			const b2X = 120 + b1Width + 14;

			ctx.beginPath();
			if (ctx.roundRect) ctx.roundRect(b2X, 1105, b2Width, 48, 12);
			else ctx.rect(b2X, 1105, b2Width, 48);
			ctx.fillStyle = hazeBadgeBg;
			ctx.fill();

			ctx.fillStyle = hazeBadgeColor;
			ctx.font = '800 20px "Outfit", sans-serif';
			ctx.fillText(hazeBadgeText, b2X + 18, 1136);

			// Plain language advisory
			ctx.fillStyle = isHazeActive ? "#DC2626" : "#334155";
			ctx.font = isHazeActive
				? '700 22px "Outfit", sans-serif'
				: '600 22px "Outfit", sans-serif';
			if (isHazeActive) {
				const hazeWarnText = `Peringatan: Terdeteksi paparan kabut asap (${nearestFire ? `${nearestFire.distanceKm} km dari ${nearestFire.regency}` : "partikel asap karhutla"}). Gunakan masker N95.`;
				drawWrappedText(hazeWarnText, 120, 1195, 840, 30, 2);
			} else {
				const hazeSafeText =
					"Kondisi udara terpantau bersih dari kabut asap karhutla langsung.";
				drawWrappedText(hazeSafeText, 120, 1195, 840, 30, 2);
			}

			ctx.fillStyle = "#64748B";
			ctx.font = '600 21px "Outfit", sans-serif';
			if (nearestFire) {
				const hotspotText = `Titik Api Terdekat: ${nearestFire.regency} (${nearestFire.distanceKm} km) • Satelit ${nearestFire.satellite || "SNPP"}`;
				drawWrappedText(hotspotText, 120, 1315, 840, 26, 1);
			} else {
				const noFireText =
					"Tidak terdeteksi titik panas dalam radius pemantauan satelit";
				drawWrappedText(noFireText, 120, 1315, 840, 26, 1);
			}

			// 5. Seismic & Earthquake Card (Y=1380, H=265)
			if (latestEarthquake) {
				drawCard(80, 1380, 920, 265, "#FFFFFF", "#E2E8F0");

				ctx.fillStyle = "#EF4444";
				ctx.font = '800 22px "Outfit", sans-serif';
				ctx.fillText("GEMPA TERKINI (BMKG)", 120, 1428);

				// Magnitude Pill Badge
				ctx.beginPath();
				if (ctx.roundRect) ctx.roundRect(120, 1455, 145, 135, 16);
				else ctx.rect(120, 1455, 145, 135);
				ctx.fillStyle = "#FEF2F2";
				ctx.fill();
				ctx.strokeStyle = "#EF4444";
				ctx.lineWidth = 3;
				ctx.stroke();

				ctx.fillStyle = "#EF4444";
				ctx.font = '800 44px "Outfit", sans-serif';
				ctx.textAlign = "center";
				ctx.fillText(`M ${latestEarthquake.magnitude}`, 192, 1530);
				ctx.font = '700 19px "Outfit", sans-serif';
				ctx.fillText(t.magnitude.toUpperCase(), 192, 1565);
				ctx.textAlign = "left";

				// Location & Depth with auto-wrap
				ctx.fillStyle = "#0F172A";
				ctx.font = '700 25px "Outfit", sans-serif';
				const nextY = drawWrappedText(
					latestEarthquake.wilayah || "Indonesia",
					290,
					1490,
					670,
					32,
					2,
				);

				ctx.fillStyle = "#64748B";
				ctx.font = '600 21px "Outfit", sans-serif';
				const depthStr =
					latestEarthquake.depth || latestEarthquake.kedalaman || "-";
				const quakeDetails = `${t.depth}: ${depthStr} • ${latestEarthquake.potensi || "Tidak berpotensi tsunami"}`;
				drawWrappedText(
					quakeDetails,
					290,
					Math.max(1570, nextY + 6),
					670,
					28,
					2,
				);
			} else {
				drawCard(80, 1380, 920, 265, "#FFFFFF", "#E2E8F0");

				ctx.fillStyle = "#10B981";
				ctx.font = '800 22px "Outfit", sans-serif';
				ctx.fillText("INFORMASI KESELAMATAN", 120, 1428);

				ctx.fillStyle = "#0F172A";
				ctx.font = '700 25px "Outfit", sans-serif';
				ctx.fillText(
					"Tidak ada peringatan bencana kritis saat ini.",
					120,
					1495,
				);

				ctx.fillStyle = "#64748B";
				ctx.font = '600 21px "Outfit", sans-serif';
				ctx.fillText(
					"Tetap pantau pembaruan berkala dari BMKG, KLHK SiPongi+ & JagaKota.",
					120,
					1550,
				);
			}

			// 6. Footer Branding & Attribution (Y=1710 onwards)
			ctx.fillStyle = "#0F172A";
			ctx.font = '800 32px "Outfit", sans-serif';
			ctx.textAlign = "center";
			ctx.fillText("jagakota.vercel.app", 540, 1735);

			ctx.fillStyle = "#64748B";
			ctx.font = '600 23px "Outfit", sans-serif';
			ctx.fillText(
				"Data Resmi BMKG, PVMBG, NASA & SiPongi+ • Dipantau Secara Real-Time",
				540,
				1780,
			);

			ctx.textAlign = "left";

			resolve(canvas.toDataURL("image/png", 0.95));
		});
	};

	const handleNativeShare = async () => {
		setIsGenerating(true);
		try {
			const dataUrl = await generateCanvasImage();
			const res = await fetch(dataUrl);
			const blob = await res.blob();
			const safeCityName = String(locationName)
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-");
			const file = new File([blob], `jagakota-${safeCityName}.png`, {
				type: "image/png",
			});

			if (navigator.canShare && navigator.canShare({ files: [file] })) {
				await navigator.share({
					files: [file],
					title: `${locationName} - JagaKota`,
					text: shareText,
				});
			} else if (navigator.share) {
				await navigator.share({
					title: `${locationName} - JagaKota`,
					text: shareText,
					url: window.location.href,
				});
			} else {
				handleDownloadImage();
			}
		} catch (err) {
			if (err.name !== "AbortError") {
				console.error("Share error:", err);
				handleDownloadImage();
			}
		} finally {
			setIsGenerating(false);
		}
	};

	const handleDownloadImage = async () => {
		setIsGenerating(true);
		try {
			const dataUrl = await generateCanvasImage();
			const safeCityName = String(locationName)
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-");
			const link = document.createElement("a");
			link.download = `jagakota-${safeCityName}-${Date.now()}.png`;
			link.href = dataUrl;
			link.click();
		} catch (err) {
			console.error("Download error:", err);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCopyText = () => {
		navigator.clipboard.writeText(shareText);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const cigsVal = health.cigs ?? health.cigarettesEquivalent ?? 0;
	const depthStr =
		latestEarthquake?.depth || latestEarthquake?.kedalaman || "-";

	return (
		<div
			className="fixed inset-0 z-9999 flex items-center justify-center bg-[rgba(15,23,42,0.75)] p-4 backdrop-blur-sm animate-fade-in"
			onClick={onClose}
		>
			<div
				className="flat-card flex max-h-[92vh] w-full max-w-120 flex-col overflow-hidden rounded-lg bg-(--bg-card) shadow-2xl animate-scale-up"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Window Header */}
				<div className="flex items-center justify-between border-b-2 border-(--border-flat) bg-(--bg-card) px-5 py-4">
					<div>
						<h3 className="m-0 flex items-center gap-[0.45rem] text-[1.05rem] font-extrabold text-(--text-main)">
							<Sparkles size={16} color="var(--color-primary)" />
							{t.shareModalTitle}
						</h3>
						<p className="mt-0.5 text-[0.775rem] font-medium text-(--text-muted)">
							{t.shareModalSubtitle}
						</p>
					</div>
					<button
						onClick={onClose}
						aria-label="Tutup modal bagikan"
						className="flex cursor-pointer items-center justify-center rounded-sm border-0 bg-(--bg-muted) p-[0.4rem] text-(--text-muted)"
					>
						<X size={18} />
					</button>
				</div>

				{/* Modal Body / 1:1 Clean Infographic Preview Container */}
				<div className="flex-1 overflow-y-auto px-5 py-4">
					{/* Live Preview Canvas Card */}
					<div className="relative overflow-hidden rounded-2xl border-2 border-[#E2E8F0] bg-[#F8FAFC] shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
						{/* Top Decorative Brand Banner */}
						<div className="h-1.5 w-full bg-secondary" />

						<div className="p-[1.15rem]">
							{/* Infographic Header */}
							<div className="mb-[0.85rem]">
								<h4 className="m-0 font-sans text-[1.25rem] font-black leading-[1.15] text-[#0F172A]">
									JagaKota
								</h4>
								<p className="mt-0.5 font-sans text-xs font-bold text-[#64748B]">
									Laporan Lingkungan & Cuaca Real-Time
								</p>
							</div>

							{/* 1. Location Hero Card */}
							<div className="mb-3 rounded-xl border-[1.5px] border-[#E2E8F0] bg-white px-4 py-[0.85rem]">
								<h5 className="m-0 font-sans text-[1.05rem] font-black leading-[1.2] text-[#0F172A]">
									{locationName}
								</h5>
								<p className="mb-1 mt-0.5 font-sans text-[0.775rem] font-semibold text-[#64748B]">
									{locationProvince}
								</p>
								<span className="inline-flex items-center gap-1 font-sans text-[0.725rem] font-bold text-[#059669]">
									<Calendar size={13} /> {dateFormatted}
								</span>
							</div>

							{/* 2. Eco-Health Composite Score Card */}
							<div className="mb-3 rounded-xl border-[1.5px] border-[#E2E8F0] bg-white px-4 py-[0.85rem]">
								<div className="font-sans text-[0.675rem] font-extrabold uppercase tracking-[0.03em] text-[#64748B]">
									{t.ecoScoreTitle}
								</div>

								<div className="mb-1.5 mt-1 flex flex-wrap items-center justify-between gap-1.5">
									<div className="flex items-baseline gap-0.75">
										<span
											className="font-sans text-[1.85rem] font-black leading-none"
											style={{ color: health.color }}
										>
											{health.score}
										</span>
										<span className="font-sans text-[0.9rem] font-extrabold text-[#64748B]">
											/100
										</span>
									</div>

									<span
										className="font-sans text-xs font-extrabold text-white shadow-[0_2px_6px_rgba(0,0,0,0.1)] rounded-lg px-2.5 py-1"
										style={{
											backgroundColor: health.color,
										}}
									>
										{health.category}
									</span>
								</div>

								<div className="inline-flex items-center gap-1.25 font-sans text-[0.725rem] font-semibold text-[#334155]">
									<Cigarette size={14} color="#64748b" />{" "}
									Setara {cigsVal} batang rokok/hari (Paparan
									PM2.5)
								</div>
							</div>

							{/* 3. Grid: AQI & Weather Cards */}
							<div className="mb-3 grid grid-cols-2 gap-[0.65rem]">
								{/* AQI Card */}
								<div className="rounded-xl border-[1.5px] border-[#E2E8F0] bg-white p-3">
									<div
										className="font-sans text-[0.65rem] font-extrabold uppercase"
										style={{ color: aqiInfo.color }}
									>
										KUALITAS UDARA
									</div>
									<div className="my-0.5 flex items-baseline gap-1">
										<span
											className="font-sans text-[1.65rem] font-black leading-[1.1]"
											style={{ color: aqiInfo.color }}
										>
											{aqi}
										</span>
										<span className="font-sans text-[0.7rem] font-bold text-[#64748B]">
											AQI US
										</span>
									</div>
									<div className="overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[0.8rem] font-extrabold text-[#0F172A]">
										{aqiInfo.label}
									</div>
									<div className="mt-0.5 font-sans text-[0.675rem] font-semibold text-[#64748B]">
										PM2.5: {pm25} µg/m³
									</div>
								</div>

								{/* Weather Card */}
								<div className="rounded-xl border-[1.5px] border-[#E2E8F0] bg-white p-3">
									<div className="font-sans text-[0.65rem] font-extrabold uppercase text-primary">
										CUACA SAAT INI
									</div>
									<div className="my-0.5 font-sans text-[1.65rem] font-black leading-[1.1] text-[#0F172A]">
										{temp}°C
									</div>
									<div className="overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[0.8rem] font-extrabold text-[#0F172A]">
										{weatherVisual.label}
									</div>
									<div className="mt-0.5 font-sans text-[0.675rem] font-semibold text-[#64748B]">
										{t.humidity}: {humidity}%
									</div>
								</div>
							</div>

							{/* 4. Karhutla & Kabut Asap Alert Card */}
							<div
								className="mb-3 rounded-xl border-[1.5px] bg-white px-4 py-[0.85rem]"
								style={{
									border: `1.5px solid ${isHazeActive ? "#EF4444" : "#E2E8F0"}`,
								}}
							>
								<div className="mb-[0.4rem] inline-flex items-center gap-1 font-sans text-[0.675rem] font-extrabold uppercase text-[#EA580C]">
									<Flame size={13} />{" "}
									{t.karhutlaCardHeader.toUpperCase()}
								</div>

								{/* Status Badges Row */}
								<div className="mb-[0.45rem] flex flex-wrap items-center gap-1.5">
									<span
										className="font-sans text-[0.68rem] font-extrabold rounded-md px-2 py-0.75"
										style={{
											backgroundColor:
												fdrs.bg || "#ECFDF5",
											color: fdrs.color || "#10B981",
										}}
									>
										{t.landLocalBadge}: {fdrs.code}
									</span>

									<span
										className="inline-flex items-center gap-1 font-sans text-[0.68rem] font-extrabold rounded-md px-2 py-0.75"
										style={{
											backgroundColor: isHazeActive
												? "#FEE2E2"
												: "#ECFDF5",
											color: isHazeActive
												? "#DC2626"
												: "#059669",
										}}
									>
										{isHazeActive ? (
											<>
												<AlertTriangle size={11} />{" "}
												TERPAPAR KABUT ASAP
											</>
										) : (
											<>
												<ShieldCheck size={11} /> Kabut
												Asap: Bersih
											</>
										)}
									</span>
								</div>

								{/* Advisory */}
								<div
									className="mb-[0.35rem] font-sans text-[0.7rem] leading-[1.35]"
									style={{
										fontWeight: isHazeActive
											? "700"
											: "600",
										color: isHazeActive
											? "#DC2626"
											: "#334155",
									}}
								>
									{isHazeActive
										? `Peringatan: Terdeteksi paparan kabut asap (${nearestFire ? `${nearestFire.distanceKm} km dari ${nearestFire.regency}` : "partikel asap karhutla"}). Gunakan masker N95.`
										: "Kondisi udara terpantau bersih dari kabut asap karhutla langsung."}
								</div>

								{/* Hotspot details */}
								<div className="font-sans text-[0.68rem] font-semibold text-[#64748B]">
									{nearestFire
										? `Titik Api Terdekat: ${nearestFire.regency} (${nearestFire.distanceKm} km) • Satelit ${nearestFire.satellite || "SNPP"}`
										: "Tidak terdeteksi titik panas dalam radius pemantauan satelit"}
								</div>
							</div>

							{/* 5. Seismic / Earthquake Card */}
							{latestEarthquake ? (
								<div className="mb-[0.85rem] rounded-xl border-[1.5px] border-[#E2E8F0] bg-white px-4 py-[0.85rem]">
									<div className="mb-[0.45rem] inline-flex items-center gap-1 font-sans text-[0.675rem] font-extrabold uppercase text-danger">
										<Zap size={13} /> GEMPA TERKINI (BMKG)
									</div>

									<div className="flex items-center gap-3">
										<div className="min-w-16.25 shrink-0 rounded-lg border-[1.5px] border-danger bg-[#FEF2F2] px-2 py-1 text-center">
											<div className="font-sans text-[1.05rem] font-black leading-[1.1] text-danger">
												M {latestEarthquake.magnitude}
											</div>
											<div className="font-sans text-[0.55rem] font-extrabold uppercase text-danger">
												{t.magnitude}
											</div>
										</div>

										<div className="min-w-0 flex-1">
											<div className="font-sans text-[0.775rem] font-bold leading-[1.3] text-[#0F172A] wrap-break-word">
												{latestEarthquake.wilayah}
											</div>
											<div className="mt-0.5 font-sans text-[0.68rem] font-semibold text-[#64748B]">
												{t.depth}: {depthStr} •{" "}
												{latestEarthquake.potensi ||
													"Tidak berpotensi tsunami"}
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className="mb-[0.85rem] rounded-xl border-[1.5px] border-[#E2E8F0] bg-white px-4 py-[0.85rem]">
									<div className="mb-[0.2rem] font-sans text-[0.675rem] font-extrabold uppercase text-secondary">
										INFORMASI KESELAMATAN
									</div>
									<div className="font-sans text-[0.75rem] font-bold text-[#0F172A]">
										Tidak ada peringatan bencana kritis saat
										ini.
									</div>
									<div className="font-sans text-[0.68rem] font-semibold text-[#64748B]">
										Tetap pantau pembaruan berkala dari
										BMKG, KLHK SiPongi+ & JagaKota.
									</div>
								</div>
							)}

							{/* 6. Footer Branding */}
							<div className="pt-1 text-center">
								<div className="font-sans text-[0.825rem] font-black text-[#0F172A]">
									jagakota.vercel.app
								</div>
								<div className="mt-px font-sans text-[0.65rem] font-semibold text-[#64748B]">
									Data Resmi BMKG, PVMBG, NASA & SiPongi+ •
									Dipantau Secara Real-Time
								</div>
							</div>
						</div>
					</div>

					{/* Action Sharing Buttons Grid */}
					<div className="mt-[1.15rem] flex flex-col gap-[0.65rem]">
						{/* Primary Action: Bagikan */}
						<button
							onClick={handleNativeShare}
							disabled={isGenerating}
							className="flat-btn-primary w-full justify-center gap-2 min-h-11.5 text-[0.95rem] font-extrabold shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
						>
							<Share2 size={18} strokeWidth={2.5} />
							<span>
								{isGenerating
									? "Menyiapkan Gambar..."
									: t.shareBtn}
							</span>
						</button>

						{/* Secondary Actions: Simpan PNG & Salin Teks */}
						<div className="grid grid-cols-2 gap-2">
							{/* Download PNG */}
							<button
								onClick={handleDownloadImage}
								disabled={isGenerating}
								className="flat-btn-secondary justify-center gap-[0.4rem] px-2 py-[0.65rem] text-[0.8rem] font-bold"
							>
								<Download size={16} strokeWidth={2.5} />
								<span>{t.downloadPngBtn}</span>
							</button>

							{/* Copy Text Button */}
							<button
								onClick={handleCopyText}
								className="flat-btn-secondary justify-center gap-[0.4rem] px-2 py-[0.65rem] text-[0.8rem] font-bold"
							>
								{copied ? (
									<Check
										size={16}
										color="var(--color-secondary)"
										strokeWidth={2.5}
									/>
								) : (
									<Copy size={16} strokeWidth={2.2} />
								)}
								<span>
									{copied ? t.copiedBtn : t.copyTextBtn}
								</span>
							</button>
						</div>
					</div>
				</div>

				{/* Footer info */}
				<div className="border-t-2 border-(--border-flat) bg-(--bg-muted) px-5 py-[0.65rem] text-center text-[0.725rem] font-semibold text-(--text-muted)">
					{t.shareSupportHint}
				</div>
			</div>
		</div>
	);
}

export default ShareCardModal;
