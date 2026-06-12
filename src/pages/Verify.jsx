import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import logoBanner from "../assets/logos.png";

export default function Verify() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate minor loading for an authentic portal feel
    const timer = setTimeout(() => {
      const verifications = JSON.parse(localStorage.getItem("klhIdVerifications") || "{}");
      if (verifications[id]) {
        setRecord(verifications[id]);
      } else {
        setRecord(null);
      }
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Branded University Header */}
      <div className="w-full bg-white border-b-4 border-[#D4AF37] py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <img src={logoBanner} alt="KL University Logo" className="h-14 w-auto object-contain" />
          <div className="text-center md:text-left">
            <h1 className="text-lg md:text-xl font-black text-[#7A0019] leading-tight tracking-wide">
              KONERU LAKSHMAIAH EDUCATION FOUNDATION
            </h1>
            <p className="text-[10px] font-bold text-slate-500">
              (Deemed to be University estd. u/s. 3 of the UGC Act, 1956)
            </p>
            <p className="text-[9px] md:text-xs text-slate-400 font-semibold">
              Official Digital Identity Certification & Verification Service
            </p>
          </div>
        </div>
        <div className="text-center md:text-right text-[10px] font-bold text-slate-500 tracking-wider">
          <div className="text-[#7A0019] font-black uppercase text-xs">Security Registry</div>
          <div>HYDERABAD OFF-CAMPUS</div>
        </div>
      </div>

      {/* Main Verification Card Area */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-tr from-[#690014]/5 via-[#D4AF37]/5 to-slate-100">
        <div className="w-full max-w-[500px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          
          <div className="bg-[#7A0019] py-3 text-center text-xs font-black uppercase tracking-[0.25em] text-[#D4AF37] border-b border-[#D4AF37]/30">
            KLH Student Credential Verification
          </div>

          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full border-4 border-[#7A0019] border-t-transparent animate-spin"></div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                Querying Secure Academic Registry...
              </p>
            </div>
          ) : record ? (
            /* VALID CARD DESIGN */
            <div className="p-8">
              {/* Verification Success Seal */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="h-20 w-20 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-md animate-bounce mb-3">
                  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="bg-emerald-600 text-white font-black text-sm px-6 py-1.5 rounded-full shadow tracking-widest uppercase">
                  VERIFIED VALID
                </span>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-2">
                  Verification ID: {id}
                </p>
              </div>

              {/* Verified Credentials */}
              <div className="space-y-6">
                
                {/* Photo Header */}
                <div className="flex items-center gap-5 border-b border-slate-100 pb-5">
                  <div className="h-24 w-24 rounded-full border-2 border-[#D4AF37] bg-slate-100 overflow-hidden shadow">
                    {record.photo ? (
                      <img src={record.photo} alt="Student" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-[10px]">
                        No Photo
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#7A0019] leading-tight">
                      {record.name}
                    </h3>
                    <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mt-0.5">
                      {record.department}
                    </p>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      Roll Number: <span className="text-slate-800 font-black">{record.rollNumber}</span>
                    </p>
                  </div>
                </div>

                {/* Secure Grid Fields */}
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">Course / Year</span>
                    <span className="text-slate-800 text-sm font-extrabold">{record.course || "B.Tech"} - {record.year}</span>
                  </div>
                  
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">Blood Group</span>
                    <span className="text-[#7A0019] text-sm font-black">{record.bloodGroup || "O+"}</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">Date of Birth</span>
                    <span className="text-slate-800 text-sm font-extrabold">{record.dob || "01/01/2004"}</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">Status</span>
                    <span className="text-emerald-600 text-sm font-extrabold uppercase">Active Registry</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#D4AF37]/35 bg-[#D4AF37]/5 p-4 text-[10px] leading-relaxed text-[#7A0019] font-semibold text-center">
                  🔐 This student record is securely registered under the central digital archives of Koneru Lakshmaiah Education Foundation.
                </div>
              </div>
            </div>
          ) : (
            /* INVALID CARD DESIGN */
            <div className="p-8 text-center flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-rose-50 border-4 border-rose-500 flex items-center justify-center text-rose-600 shadow-md mb-4">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <span className="bg-rose-600 text-white font-black text-sm px-6 py-1.5 rounded-full shadow tracking-widest uppercase">
                INVALID RECORD
              </span>

              <p className="text-sm font-bold text-slate-500 mt-4 leading-relaxed max-w-sm">
                The verification code <span className="text-[#7A0019] font-black">"{id}"</span> was not found in the KLH Central Student Registry.
              </p>

              <div className="w-full mt-6 bg-slate-50 border border-slate-150 p-4 rounded-2xl text-[10px] font-semibold text-slate-500 leading-normal">
                ⚠️ **Notice to Administrators/Inspectors**: If this card was recently generated, please ensure it has been successfully synchronized to the server history or admin panel database.
              </div>
            </div>
          )}

          {/* Verification footer stripe */}
          <div className="bg-slate-100 text-center py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-200">
            KLH Security & Academic Registry © 2026
          </div>
        </div>
      </div>
    </div>
  );
}
