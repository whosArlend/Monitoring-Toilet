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
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULT_ITEMS.map((label, i) => ({ id: i + 1, label, status: "BELUM", note: "" }));
  });

  const [location, setLocation] = useState("");
  const [coordinator, setCoordinator] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setSavedAt(new Date().toISOString());
    } catch (e) {}
  }, [items]);

  function toggleStatus(id, next) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: next } : it)));
  }

  function updateNote(id, note) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, note } : it)));
  }

  function resetAll() {
    if (!confirm("Reset semua checklist ke BELUM dan hapus catatan?")) return;
    setItems(DEFAULT_ITEMS.map((label, i) => ({ id: i + 1, label, status: "BELUM", note: "" })));
    setCoordinator("");
    setLocation("");
  }

  function exportCSV() {
    const header = ["No","Checklist","Status","Catatan","Lokasi","Koordinator"].join(",");
    const rows = items.map(it => [it.id, `"${it.label.replace(/"/g,'""') }"`, it.status, `"${(it.note||"").replace(/"/g,'""') }"`, `"${location.replace(/"/g,'""')}"`, `"${coordinator.replace(/"/g,'""')}"`].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-toilet-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-semibold">Monitoring Kebersihan Toilet</h1>
            <p className="text-sm text-gray-600">Pilih <span className="font-medium">SUDAH</span> atau <span className="font-medium">BELUM</span> dan tambahkan catatan.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Lokasi" className="border rounded px-3 py-2 text-sm" />
            <input value={coordinator} onChange={e=>setCoordinator(e.target.value)} placeholder="Koordinator" className="border rounded px-3 py-2 text-sm" />
            <button onClick={exportCSV} className="px-3 py-2 bg-indigo-600 text-white rounded">Export CSV</button>
            <button onClick={printReport} className="px-3 py-2 bg-green-600 text-white rounded">Cetak / Print</button>
            <button onClick={resetAll} className="px-3 py-2 border rounded text-sm">Reset</button>
          </div>
        </header>

        {/* PRINT HEADER */}
        <div className="hidden print:block text-center mb-4">
          <h2 className="text-xl font-bold">LAPORAN MONITORING KEBERSIHAN TOILET</h2>
          <p className="text-sm">Tanggal: {new Date().toLocaleDateString()}</p>
          <p className="text-sm">Lokasi: {location || '-'} | Koordinator: {coordinator || '-'}</p>
        </div>

        <main className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">No</th>
                  <th className="border px-2 py-1 text-left">Checklist</th>
                  <th className="border px-2 py-1 text-left">Status</th>
                  <th className="border px-2 py-1 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id} className="align-top">
                    <td className="border px-2 py-1 w-10">{it.id}</td>
                    <td className="border px-2 py-1">{it.label}</td>
                    <td className="border px-2 py-1 text-center">
                      <div className="flex gap-1 justify-center print:justify-start">
                        <button onClick={()=>toggleStatus(it.id, 'SUDAH')} className={`px-2 py-1 rounded text-xs ${it.status==='SUDAH' ? 'bg-green-600 text-white' : 'bg-white border'} print:hidden`}>SUDAH</button>
                        <button onClick={()=>toggleStatus(it.id, 'BELUM')} className={`px-2 py-1 rounded text-xs ${it.status==='BELUM' ? 'bg-red-600 text-white' : 'bg-white border'} print:hidden`}>BELUM</button>
                        <span className="hidden print:inline">{it.status}</span>
                      </div>
                    </td>
                    <td className="border px-2 py-1">
                      <textarea value={it.note} onChange={e=>updateNote(it.id, e.target.value)} className="w-full p-1 border rounded text-xs print:hidden" rows={2} />
                      <div className="hidden print:block whitespace-pre-wrap text-xs">{it.note}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-between text-sm text-gray-600 print:hidden">
            <div>Terakhir disimpan: {savedAt ? new Date(savedAt).toLocaleString() : '—'}</div>
            <div>
              <button onClick={()=>{navigator.share ? navigator.share({title:'Monitoring Toilet', text:'Laporan Monitoring Toilet', url:location.href}).catch(()=>{}) : alert('Share tidak tersedia di device ini')}} className="px-3 py-2 border rounded">Share</button>
            </div>
          </div>

          {/* Print footer with signature area */}
          <div className="hidden print:block mt-10 text-sm">
            <div className="flex justify-between">
              <div>
                <p>Mengetahui,</p>
                <p className="mt-12 underline">({coordinator || '................................'})</p>
                <p>Koordinator Kebersihan</p>
              </div>
              <div>
                <p>Petugas,</p>
                <p className="mt-12 underline">(................................)</p>
                <p>Petugas Kebersihan</p>
              </div>
            </div>
          </div>

        </main>
      </div>

      <footer className="max-w-5xl mx-auto text-center text-xs text-gray-500 mt-4 print:hidden">Aplikasi sederhana — responsif dan bisa dicetak sebagai laporan resmi.</footer>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          table { font-size: 11px; }
          th, td { border: 1px solid black !important; }
          textarea, button, input { display: none !important; }
          .print\:hidden { display: none !important; }
          .print\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
}
