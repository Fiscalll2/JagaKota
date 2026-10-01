import React from 'react';
import { RefreshCw, CloudOff } from 'lucide-react';

// Penangkap galat tingkat aplikasi JagaKota: tampilkan panel ramah + tombol pulih.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('JagaKota Runtime Error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('jagakota-theme');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((daftar) => {
          daftar.forEach((pendaftaran) => pendaftaran.unregister());
        });
      }
    } catch {
      // Abaikan: pemulihan tetap lanjut memuat ulang halaman.
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-slate-950 px-6 py-12 text-center">
          <div className="w-full max-w-md rounded-3xl border-2 border-slate-800 bg-slate-900 p-8">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-500/15 text-red-400">
              <CloudOff size={28} />
            </span>
            <h2 className="mt-4 text-xl font-black tracking-tight text-white">
              JagaKota butuh dimuat ulang
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Cache atau data sesi bermasalah sehingga dasbor gagal dibuka. Semua
              pengaturan tersimpan aman — tekan tombol di bawah untuk menyegarkan.
            </p>
            {this.state.error?.message && (
              <p className="mt-3 truncate rounded-xl bg-slate-800 px-3 py-2 font-mono text-[11px] text-slate-500">
                {String(this.state.error.message).slice(0, 120)}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-600"
            >
              <RefreshCw size={16} /> Segarkan JagaKota
            </button>
            <p className="mt-3 text-[11px] font-medium text-slate-500">
              Masih gagal? Buka lewat mode samaran sekali saja.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const BatasRusak = ErrorBoundary;
export default ErrorBoundary;
