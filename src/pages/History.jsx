import { useState } from "react";
import { Link } from "react-router-dom";
import Barcode from "react-barcode";

function History({ notify }) {
  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("idCardHistory") || "[]");
  });

  const clearHistory = () => {
    localStorage.removeItem("idCardHistory");
    setHistory([]);
    notify("Preview history cleared", "History Reset");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 max-w-7xl mx-auto border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-black text-[#7A0019]">Preview History</h1>
          <p className="mt-2 text-slate-600 max-w-2xl text-sm font-semibold">
            Review previously generated student cards, check metadata, and view active verification links saved in local history.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            to="/generator"
            className="rounded-full bg-[#7A0019] hover:bg-[#9c0020] border border-[#D4AF37] px-6 py-3 text-white text-sm font-bold shadow-md transition active:scale-95"
          >
            Back to Generator
          </Link>
          <Link
            to="/admin"
            className="rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3 text-slate-700 text-sm font-bold shadow-sm transition active:scale-95"
          >
            Admin Panel
          </Link>
        </div>
      </div>

      <div className="grid gap-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-xl border-t-4 border-[#D4AF37]">
          <div>
            <h2 className="text-2xl font-black text-[#7A0019]">Saved Card Database</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{history.length} active records found</p>
          </div>
          <button
            onClick={clearHistory}
            className="rounded-full bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow transition"
          >
            Clear Database
          </button>
        </div>

        {history.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 font-semibold shadow-inner">
            No saved identity card history found. Generate a card and save it to history to see records here.
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((item) => (
              <div key={item.id} className="rounded-3xl bg-white p-8 shadow-xl border border-slate-100 hover:border-slate-200 hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-[#7A0019]">{item.name || "Student Name"}</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                      Saved {item.savedAt ? new Date(item.savedAt).toLocaleString() : "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-[#7A0019]/5 p-4 text-xs font-bold text-slate-600 space-y-1">
                    <div><span className="text-[#7A0019] uppercase tracking-wider text-[10px]">Institution:</span> {item.college}</div>
                    <div><span className="text-[#7A0019] uppercase tracking-wider text-[10px]">Department:</span> {item.department}</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Roll Number</p>
                    <p className="mt-1 text-base font-extrabold text-slate-800">{item.rollNumber || "N/A"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Course / Year</p>
                    <p className="mt-1 text-base font-extrabold text-slate-800">
                      {item.course || "N/A"} - {item.year || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
                    <p className="text-[10px] font-black text-[#7A0019] uppercase tracking-wider">Verification ID</p>
                    <p className="mt-1 text-base font-black text-[#7A0019] tracking-wider">{item.verificationId || "N/A"}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200/50 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center">
                    <Barcode value={item.rollNumber || "000000"} width={1.2} height={35} displayValue={false} />
                  </div>
                  
                  {item.verificationId && (
                    <a
                      href={`/verify/${item.verificationId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open Verification Portal
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
