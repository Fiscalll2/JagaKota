import React, { useState } from "react";
import {
	ShieldAlert,
	PhoneCall,
	Wind,
	Waves,
	X,
	Activity,
	AlertTriangle,
} from "lucide-react";

const EMERGENCY_CONTACTS = [
	{
		number: "112",
		name: "Panggilan Darurat Nasional",
		desc: "Layanan Terpadu Bebas Pulsa (Polisi, Ambulans, Damkar, Bencana)",
		color: "#ef4444",
		bg: "#fef2f2",
	},
	{
		number: "115",
		name: "BASARNAS",
		desc: "Badan Nasional Pencarian & Pertolongan Bencana / Evakuasi",
		color: "#f97316",
		bg: "#fff7ed",
	},
	{
		number: "119",
		name: "Ambulans & Kemenkes (PSC 119)",
		desc: "Layanan Gawat Darurat Medis & Ambulans Rumah Sakit",
		color: "#10b981",
		bg: "#ecfdf5",
	},
	{
		number: "113",
		name: "Pemadam Kebakaran (Damkar)",
		desc: "Kebakaran, Penyelamatan Runtuhan, & Penanganan Bahaya",
		color: "#dc2626",
		bg: "#fef2f2",
	},
	{
		number: "110",
		name: "Kepolisian RI",
		desc: "Layanan Keamanan & Ketertiban Masyarakat",
		color: "#3b82f6",
		bg: "#eff6ff",
	},
	{
		number: "123",
		name: "PLN Gangguan Listrik",
		desc: "Lapor Kabel Terputus, Korsleting, & Pemadaman Pascabencana",
		color: "#f59e0b",
		bg: "#fffbeb",
	},
];

export function EmergencyGuideModal({ isOpen, onClose }) {
	const [activeTab, setActiveTab] = useState("kontak");

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-9999 flex items-center justify-center bg-[rgba(15,23,42,0.75)] p-3 backdrop-blur-sm animate-fade-in"
			onClick={onClose}
		>
			<div
				className="flat-card flex max-h-[92vh] w-full max-w-140 flex-col overflow-hidden rounded-lg bg-(--bg-card) shadow-2xl animate-scale-up"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div className="flex items-center justify-between gap-3 border-b-2 border-(--border-flat) bg-(--bg-card) px-[1.15rem] py-4">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex h-9.5 w-9.5 min-w-9.5 shrink-0 items-center justify-center rounded-sm bg-danger text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)]">
							<ShieldAlert size={20} strokeWidth={2.5} />
						</div>
						<div className="min-w-0">
							<h3 className="m-0 text-[1.05rem] font-extrabold leading-tight text-(--text-main)">
								Tanggap Bencana & Kontak Darurat
							</h3>
							<p className="mt-0.5 text-xs font-medium leading-[1.3] text-(--text-muted)">
								Panduan Kesiapsiagaan & Hotline Bencana Resmi
								Indonesia
							</p>
						</div>
					</div>

					<button
						onClick={onClose}
						aria-label="Tutup"
						className="flat-btn-secondary flex min-h-8 min-w-8 shrink-0 items-center justify-center p-1"
					>
						<X size={18} strokeWidth={2.5} />
					</button>
				</div>

				{/* Tab Navigation with Clean Responsive Touch Bar */}
				<div className="no-scrollbar flex shrink-0 items-center gap-[0.45rem] overflow-x-auto overflow-y-hidden border-b-2 border-(--border-flat) bg-(--bg-muted) px-[0.85rem] py-3 [-ms-overflow-style:none] scrollbar-none [-webkit-overflow-scrolling:touch]">
					<button
						onClick={() => setActiveTab("kontak")}
						className="inline-flex h-9.5 min-h-9.5 box-border shrink-0 cursor-pointer items-center gap-[0.35rem] whitespace-nowrap rounded-sm px-[0.85rem] py-[0.45rem] text-[0.775rem] font-extrabold transition-all duration-150"
						style={{
							border:
								activeTab === "kontak"
									? "2px solid var(--color-danger)"
									: "var(--border-thick)",
							backgroundColor:
								activeTab === "kontak"
									? "var(--color-danger)"
									: "var(--bg-card)",
							color:
								activeTab === "kontak"
									? "#ffffff"
									: "var(--text-main)",
						}}
					>
						<PhoneCall size={14} strokeWidth={2.5} />
						<span>Kontak Darurat</span>
					</button>

					<button
						onClick={() => setActiveTab("gempa")}
						className="inline-flex h-9.5 min-h-9.5 box-border shrink-0 cursor-pointer items-center gap-[0.35rem] whitespace-nowrap rounded-sm px-[0.85rem] py-[0.45rem] text-[0.775rem] font-extrabold transition-all duration-150"
						style={{
							border:
								activeTab === "gempa"
									? "2px solid var(--color-accent)"
									: "var(--border-thick)",
							backgroundColor:
								activeTab === "gempa"
									? "var(--color-accent)"
									: "var(--bg-card)",
							color:
								activeTab === "gempa"
									? "#ffffff"
									: "var(--text-main)",
						}}
					>
						<Activity size={14} strokeWidth={2.5} />
						<span>Mitigasi Gempa</span>
					</button>

					<button
						onClick={() => setActiveTab("polusi")}
						className="inline-flex h-9.5 min-h-9.5 box-border shrink-0 cursor-pointer items-center gap-[0.35rem] whitespace-nowrap rounded-sm px-[0.85rem] py-[0.45rem] text-[0.775rem] font-extrabold transition-all duration-150"
						style={{
							border:
								activeTab === "polusi"
									? "2px solid var(--color-secondary)"
									: "var(--border-thick)",
							backgroundColor:
								activeTab === "polusi"
									? "var(--color-secondary)"
									: "var(--bg-card)",
							color:
								activeTab === "polusi"
									? "#ffffff"
									: "var(--text-main)",
						}}
					>
						<Wind size={14} strokeWidth={2.5} />
						<span>Polusi Udara</span>
					</button>

					<button
						onClick={() => setActiveTab("tsunami")}
						className="inline-flex h-9.5 min-h-9.5 box-border shrink-0 cursor-pointer items-center gap-[0.35rem] whitespace-nowrap rounded-sm px-[0.85rem] py-[0.45rem] text-[0.775rem] font-extrabold transition-all duration-150"
						style={{
							border:
								activeTab === "tsunami"
									? "2px solid var(--color-primary)"
									: "var(--border-thick)",
							backgroundColor:
								activeTab === "tsunami"
									? "var(--color-primary)"
									: "var(--bg-card)",
							color:
								activeTab === "tsunami"
									? "#ffffff"
									: "var(--text-main)",
						}}
					>
						<Waves size={14} strokeWidth={2.5} />
						<span>Tsunami & UV</span>
					</button>
				</div>

				{/* Content Body */}
				<div className="flex-1 overflow-y-auto bg-(--bg-card) px-[1.15rem] py-4">
					{/* TAB 1: KONTAK DARURAT */}
					{activeTab === "kontak" && (
						<div className="grid grid-cols-1 gap-[0.65rem]">
							{/* Notice Banner */}
							<div className="flex items-start gap-2 rounded-sm border border-danger bg-(--color-danger-bg) px-[0.85rem] py-3 text-[0.775rem] font-bold leading-[1.4] text-danger">
								<AlertTriangle
									size={15}
									className="mt-0.5 shrink-0"
								/>
								<span>
									Panggilan 112 dapat dihubungi dari semua
									operator seluler bebas pulsa, bahkan saat
									ponsel terkunci.
								</span>
							</div>

							{/* Emergency Contact List */}
							{EMERGENCY_CONTACTS.map((c) => (
								<div
									key={c.number}
									className="flex flex-wrap items-center justify-between gap-[0.65rem] rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-[0.9rem] py-3"
								>
									<div className="flex min-w-0 flex-[1_1_180px] items-center gap-3">
										<div
											className="flex h-10.5 w-10.5 min-w-10.5 shrink-0 items-center justify-center rounded-sm text-[1.1rem] font-extrabold text-white"
											style={{ backgroundColor: c.color }}
										>
											{c.number}
										</div>
										<div className="min-w-0">
											<strong className="block text-[0.875rem] leading-tight text-(--text-main)">
												{c.name}
											</strong>
											<span className="mt-0.5 block text-[0.725rem] font-medium leading-[1.3] text-(--text-muted)">
												{c.desc}
											</span>
										</div>
									</div>

									<a
										href={"tel:" + c.number}
										className="flat-btn-primary inline-flex min-h-8.5 shrink-0 items-center gap-[0.35rem] rounded-sm px-[0.85rem] text-[0.775rem] font-extrabold no-underline"
										style={{ backgroundColor: c.color }}
									>
										<PhoneCall
											size={13}
											strokeWidth={2.5}
										/>{" "}
										Hubungi
									</a>
								</div>
							))}
						</div>
					)}

					{/* TAB 2: MITIGASI GEMPA */}
					{activeTab === "gempa" && (
						<div className="flex flex-col gap-3">
							<div className="rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-4 py-[0.85rem]">
								<h4 className="mb-[0.45rem] text-[0.925rem] font-extrabold text-accent">
									1. Saat Guncangan Terjadi (DROP, COVER, HOLD
									ON)
								</h4>
								<ul className="m-0 pl-[1.15rem] text-[0.8rem] font-medium leading-[1.55] text-(--text-main)">
									<li>
										<strong>Merunduk (Drop)</strong> ke
										lantai sebelum guncangan merobohkan
										keseimbangan Anda.
									</li>
									<li>
										<strong>Lindungi Kepala (Cover)</strong>{" "}
										di bawah meja yang kokoh atau lindungi
										kepala dengan tas/bantal/lengan.
									</li>
									<li>
										<strong>Bertahan (Hold On)</strong>{" "}
										pegang kaki meja hingga guncangan
										benar-benar reda.
									</li>
									<li>
										Jauhi kaca jendela, cermin, lemari
										tinggi, dan benda yang berisiko jatuh.
									</li>
								</ul>
							</div>

							<div className="rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-4 py-[0.85rem]">
								<h4 className="mb-[0.45rem] text-[0.925rem] font-extrabold text-danger">
									2. Jika Berada di Gedung Bertingkat
								</h4>
								<ul className="m-0 pl-[1.15rem] text-[0.8rem] font-medium leading-[1.55] text-(--text-main)">
									<li>
										<strong>
											JANGAN gunakan lift / elevator
										</strong>
										. Selalu gunakan tangga darurat.
									</li>
									<li>
										Jangan panik berebut keluar pintu secara
										bersamaan untuk mencegah penumpukan
										massa.
									</li>
								</ul>
							</div>

							<div className="rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-4 py-[0.85rem]">
								<h4 className="mb-[0.45rem] text-[0.925rem] font-extrabold text-secondary">
									3. Pasca Guncangan Mereda
								</h4>
								<ul className="m-0 pl-[1.15rem] text-[0.8rem] font-medium leading-[1.55] text-(--text-main)">
									<li>
										Segera matikan kompor gas dan saklar
										listrik utama untuk mencegah kebakaran.
									</li>
									<li>
										Evakuasi ke titik kumpul terbuka yang
										jauh dari tiang listrik, baliho, dan
										tembok retak.
									</li>
									<li>
										Pantau pembaruan gempa susulan resmi
										BMKG di aplikasi JagaKota.
									</li>
								</ul>
							</div>
						</div>
					)}

					{/* TAB 3: POLUSI UDARA */}
					{activeTab === "polusi" && (
						<div className="flex flex-col gap-3">
							<div className="rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-4 py-[0.85rem]">
								<h4 className="mb-[0.45rem] text-[0.925rem] font-extrabold text-danger">
									Saat Kualitas Udara Tidak Sehat (AQI &gt;
									150)
								</h4>
								<ul className="m-0 pl-[1.15rem] text-[0.8rem] font-medium leading-[1.55] text-(--text-main)">
									<li>
										<strong>Wajib Masker Respirator</strong>
										: Gunakan masker standar N95, KN95, atau
										KF94 saat keluar ruangan. Masker kain
										tipis tidak mampu menyaring partikel
										mikro PM2.5.
									</li>
									<li>
										<strong>
											Tutup Jendela & Ventilasi
										</strong>
										: Cegah masuknya polusi luar ruangan ke
										dalam kamar dan ruang keluarga.
									</li>
									<li>
										<strong>Gunakan Pembersih Udara</strong>
										: Nyalakan HEPA Air Purifier jika
										tersedia di dalam ruangan.
									</li>
									<li>
										<strong>Batasi Aktivitas Berat</strong>:
										Hindari jogging atau bersepeda di
										pinggir jalan raya utama pada jam sibuk.
									</li>
									<li>
										<strong>Lindungi Anak & Lansia</strong>:
										Kelompok rentan pernapasan/asma
										sebaiknya tetap berada di dalam ruangan.
									</li>
								</ul>
							</div>
						</div>
					)}

					{/* TAB 4: TSUNAMI & UV */}
					{activeTab === "tsunami" && (
						<div className="flex flex-col gap-3">
							<div className="rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-4 py-[0.85rem]">
								<h4 className="mb-[0.45rem] text-[0.925rem] font-extrabold text-primary">
									Mitigasi Ancaman Tsunami (Pedoman BMKG)
								</h4>
								<ul className="m-0 pl-[1.15rem] text-[0.8rem] font-medium leading-[1.55] text-(--text-main)">
									<li>
										<strong>Metode 20-20-20</strong>: Jika
										merasakan gempa selama lebih dari{" "}
										<strong>20 detik</strong> di wilayah
										pantai, Anda memiliki waktu sekitar{" "}
										<strong>20 menit</strong> untuk evakuasi
										ke ketinggian minimal{" "}
										<strong>20 meter</strong>.
									</li>
									<li>
										Jika air laut surut secara tiba-tiba
										setelah gempa,{" "}
										<strong>
											SEGERA lari menjauhi pantai
										</strong>{" "}
										menuju perbukitan atau gedung tinggi
										evakuasi.
									</li>
								</ul>
							</div>

							<div className="rounded-md border-2 border-(--border-flat) bg-(--bg-muted) px-4 py-[0.85rem]">
								<h4 className="mb-[0.45rem] text-[0.925rem] font-extrabold text-accent">
									Perlindungan Radiasi UV Ekstrem (UV 8+)
								</h4>
								<ul className="m-0 pl-[1.15rem] text-[0.8rem] font-medium leading-[1.55] text-(--text-main)">
									<li>
										Gunakan tabir surya (*Sunscreen SPF
										30+*) setiap 2 jam saat terpapar sinar
										matahari.
									</li>
									<li>
										Gunakan topi bertepi lebar, pakaian
										lengan panjang, dan kacamata anti-UV.
									</li>
									<li>
										Hindari paparan sinar langsung di jam
										puncak (10.00 – 15.00 WIB).
									</li>
								</ul>
							</div>
						</div>
					)}
				</div>

				{/* Responsive Footer */}
				<div className="flex flex-wrap items-center justify-between gap-[0.4rem] border-t-2 border-(--border-flat) bg-(--bg-muted) px-[1.15rem] py-3 text-[0.725rem] font-semibold text-(--text-muted)">
					<span>Pedoman Resmi BNPB, BMKG & Kemenkes RI</span>
					<span className="font-extrabold text-danger">
						Bebas Pulsa 112
					</span>
				</div>
			</div>
		</div>
	);
}

export default EmergencyGuideModal;
