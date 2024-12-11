"use client";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white">Government of NCT Delhi</h3>
            <span className="text-zinc-400">|</span>
            <p className="text-sm text-zinc-400">Load Forecasting System</p>
          </div>
          <p className="text-zinc-400 text-sm">
            © 2024 All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
} 