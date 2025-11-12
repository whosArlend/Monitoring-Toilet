import React, { useEffect, useState } from "react";

const DEFAULT_ITEMS = [
  "Menyikat lantai",
  "Membersihkan lantai dengan cairan pembersih",
  "Mengosongkan tempat sampah",
  "Membersihkan saringan/saluran air dari kotoran yang menyumbat",
  "Membersihkan dinding",
  "Membersihkan langit-langit",
  "Membersihkan ventilasi",
  "Menguras bak/ember",
  "Mengecek kelayakan fungsi kran air",
  "Mengecek alat/perlengkapan toilet",
  "Mengecek kelayakan fungsi pengharum ruangan",
  "Mengecek kelayakan fungsi egsel, gagang, kunci, gembok, gerendel pintu",
  "Mengecek fungsi saklar dan lampu",
  "Membersihkan keset",
];

const STORAGE_KEY = "monitoringToiletData_v1";

export default function MonitoringToiletApp() {
  // ✅ Fix hydration mismatch
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [items, setItems] = useState([]);
  const [dayDate, setDayDate] = useState("");
  const [location, setLocation] = useState("");
  const [coordinator, setCoordinator] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    if (!isClient) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw));
      } else {
        setItems(
          DEFAULT_ITEMS.map((label, i) => ({
            id: i + 1,
            label,
            status: "BELUM",
            note: "",
          }))
        );
      }
    } catch (e) {}
    setCurrentDate(new Date().toLocaleDateString());
  }, [isClient]);

  useEffect(() => {
    if (!isClient || items.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setSavedAt(new Date().toISOString());
    } catch (e) {}
  }, [items, isClient]);

  if (!isClient) {
    return <div className="p-6 text-center text-gray-500">Memuat aplikasi...</div>;
  }

  // 🔘 Handlers
  function toggleStatus(id, next) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: next } : it))
    );
  }

  function updateNote(id, note) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, note } : it))
    );
  }

  function resetAll() {
    if (!confirm("Reset semua checklist ke BELUM dan hapus catatan?")) return;
    setItems(
      DEFAULT_ITEMS.map((label, i) => ({
        id: i + 1,
        label,
        status: "BELUM",
        note: "",
      }))
    );
    setCoordinator("");
    setLocation("");
    setDayDate("");
  }

  function exportCSV() {
    const header = [
      "No",
      "Checklist",
      "Status",
      "Catatan",
      "Hari & Tanggal",
      "Lokasi",
      "Koordinator",
    ].join(",");
    const rows = items.map((it) =>
      [
        it.id,
        `"${it.label.replace(/"/g, '""')}"`,
        it.status,
        `"${(it.note || "").replace(/"/g, '""')}"`,
        `"${dayDate.replace(/"/g, '""')}"`,
        `"${location.replace(/"/g, '""')}"`,
        `"${coordinator.replace(/"/g, '""')}"`,
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monitoring-toilet-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    window.print();
  }

  // 🧩 UI
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-semibold">
              Monitoring Toilet
            </h1>
            <p className="text-sm text-gray-600">
              Checklist kebersihan dan kelengkapan toilet
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={dayDate}
              onChange={(e) => setDayDate(e.target.value)}
              placeholder="Hari & Tanggal"
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lokasi"
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              value={coordinator}
              onChange={(e) => setCoordinator(e.target.value)}
              placeholder="Koordinator"
              className="border rounded px-3 py-2 text-sm"
            />
            <button
              onClick={exportCSV}
              className="px-3 py-2 bg-indigo-600 text-white rounded text-sm"
            >
              Export CSV
            </button>
            <button
              onClick={printReport}
              className="px-3 py-2 bg-green-600 text-white rounded text-sm"
            >
              Cetak
            </button>
            <button
              onClick={resetAll}
              className="px-3 py-2 border rounded text-sm"
            >
              Reset
            </button>
          </div>
        </header>

        {/* Header untuk print */}
        <div className="hidden print:block text-center mb-4">
          <h2 className="text-lg font-bold">
            LAPORAN MONITORING KEBERSIHAN DAN KELENGKAPAN TOILET
          </h2>
          <p>Hari & Tanggal: {dayDate || currentDate}</p>
          <p>
            Lokasi: {location || "-"} | Koordinator: {coordinator || "-"}
          </p>
        </div>

        {/* Checklist */}
        <main className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <div
              key={it.id}
              className="no-break border rounded-lg p-4 bg-gray-50 flex flex-col justify-between h-full min-h-[180px]"
            >
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-gray-500">No. {it.id}</div>
                    <div className="font-medium text-base">{it.label}</div>
                  </div>

                  {/* Status */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStatus(it.id, "SUDAH")}
                      className={`px-3 py-1 rounded text-sm print:hidden ${
                        it.status === "SUDAH"
                          ? "bg-green-600 text-white"
                          : "bg-white border"
                      }`}
                    >
                      SUDAH
                    </button>
                    <button
                      onClick={() => toggleStatus(it.id, "BELUM")}
                      className={`px-3 py-1 rounded text-sm print:hidden ${
                        it.status === "BELUM"
                          ? "bg-red-600 text-white"
                          : "bg-white border"
                      }`}
                    >
                      BELUM
                    </button>

                    {/* Status print */}
                    <span className="hidden print:inline font-semibold">
                      {it.status}
                    </span>
                  </div>
                </div>

                {/* Catatan */}
                <div className="mt-3 flex flex-col flex-grow justify-end">
                  <label className="text-xs text-gray-600">Catatan</label>
                  <textarea
                    value={it.note}
                    onChange={(e) => updateNote(it.id, e.target.value)}
                    className="w-full mt-1 p-2 border rounded text-sm resize-none h-[60px] print:hidden"
                  />
                  <p className="hidden print:block text-sm mt-1 whitespace-pre-line border-t pt-1">
                    {it.note || "-"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </main>

        {/* Footer */}
        <footer className="mt-6 text-xs text-gray-500 text-center print:hidden">
          Terakhir disimpan:{" "}
          {savedAt ? new Date(savedAt).toLocaleString() : "—"}
        </footer>

        {/* Footer untuk print */}
        <div className="hidden print:block mt-10 text-sm">
          <div className="flex justify-between">
            <div>
              <p>Mengetahui,</p>
              <p className="mt-12 underline">
                ({coordinator || "................................"})
              </p>
              <p>Koordinator Kebersihan</p>
            </div>
            <div>
              <p>Petugas,</p>
              <p className="mt-12 underline">(................................)</p>
              <p>Petugas Kebersihan</p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Print Style Fix */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }

          /* agar setiap card tidak terpotong */
          .no-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* margin halaman print */
          @page {
            margin: 1.5cm;
          }
        }
      `}</style>
    </div>
  );
}
