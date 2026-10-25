import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFDF0] flex items-center justify-center p-6 text-black font-sans">
          <div className="max-w-md w-full border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000] text-center">
            <div className="inline-block bg-neo-pink border-2 border-black px-3 py-1 font-black text-xs uppercase mb-3">
              SYSTEM RECOVERY
            </div>
            <h2 className="text-2xl font-black mb-2">Terjadi Kesalahan Tampilan</h2>
            <p className="text-sm font-bold text-gray-700 mb-4">
              {this.state.error?.message || 'Gagal memuat komponen aplikasi.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-neo-yellow border-2 border-black font-black text-sm uppercase shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
