import React from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

export class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		console.error("JagaKota Runtime Error:", error, errorInfo);
	}

	handleReload = () => {
		try {
			localStorage.removeItem("jagakota-theme");
			if ("serviceWorker" in navigator) {
				navigator.serviceWorker
					.getRegistrations()
					.then((registrations) => {
						for (const reg of registrations) reg.unregister();
					});
			}
		} catch {}
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex min-h-screen items-center justify-center bg-[#0d1117] p-8 text-center font-[system-ui,-apple-system,sans-serif] text-[#f0f6fc]">
					<div className="max-w-120 rounded-xl border border-[#30363d] bg-[#161b22] p-8">
						<AlertCircle
							size={40}
							color="#ef4444"
							className="mx-auto mb-4"
						/>
						<h2 className="mb-2 text-xl font-bold">
							Terjadi Kendala Memuat Data
						</h2>
						<p className="mb-6 text-sm leading-relaxed text-[#8b949e]">
							Aplikasi mengalami masalah saat memuat data atau
							cache browser. Klik tombol di bawah untuk memuat
							ulang.
						</p>
						<button
							onClick={this.handleReload}
							className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-0 bg-[#2ea043] px-5 py-[0.65rem] text-sm font-semibold text-white"
						>
							<RefreshCw size={16} /> Muat Ulang JagaKota
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
