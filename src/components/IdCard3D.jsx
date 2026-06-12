import { useState } from "react";
import Barcode from "react-barcode";

export default function IdCard3D({
  student,
  photo,
  logoBanner,
  backBanner,
  signatureImg,
  verificationId = "KLH-2026-982103",
}) {
  const [flipped, setFlipped] = useState(false);
  const [walletMode, setWalletMode] = useState(false);

  const toggleFlip = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setFlipped(!flipped);
  };

  // Generate QR Code URL
  const verifyUrl = `${window.location.origin}/verify/${verificationId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
    verifyUrl
  )}`;

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      
      {/* Interactive Controls */}
      <div className="flex gap-4">
        <button
          onClick={toggleFlip}
          className="flex items-center gap-2 rounded-full bg-[#7A0019] border border-[#D4AF37] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#9c0020] active:scale-95 transition cursor-pointer"
        >
          <svg className="h-4.5 w-4.5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
          </svg>
          {flipped ? "Show Front Side" : "Show Back Side"}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            setWalletMode(!walletMode);
          }}
          className={`flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-bold shadow-md transition active:scale-95 cursor-pointer ${
            walletMode
              ? "bg-[#D4AF37] border-[#7A0019] text-[#7A0019] hover:bg-[#ffe066]"
              : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          }`}
        >
          <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          {walletMode ? "Standard View" : "Wallet View"}
        </button>
      </div>

      {/* Wallet Pass Outer Container (If Enabled) */}
      <div className={`relative p-8 rounded-[40px] transition-all duration-700 ${
        walletMode
          ? "bg-gradient-to-b from-[#2e0008] to-[#120002] border-2 border-[#D4AF37]/50 shadow-[0_30px_70px_rgba(0,0,0,0.8)]"
          : "bg-transparent"
      }`}>
        {walletMode && (
          <div className="absolute top-4 left-0 right-0 text-center flex flex-col items-center">
            <div className="h-1.5 w-24 bg-white/20 rounded-full mb-3"></div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-extrabold text-[#D4AF37]">
              KLH Digital Student Pass
            </span>
          </div>
        )}

        {/* Real 3D Card Flip Container */}
        <div 
          onClick={toggleFlip}
          className="relative w-[380px] h-[550px] cursor-pointer"
          style={{ perspective: "1500px" }}
        >
          <div 
            className="w-full h-full relative transition-transform duration-700 ease-out"
            style={{ 
              transformStyle: "preserve-3d", 
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" 
            }}
          >
            {/* FRONT SIDE (Face forward, clean, high-resolution) */}
            <div 
              className="absolute inset-0 w-full h-full rounded-[30px] overflow-hidden bg-white border border-slate-200 shadow-2xl flex flex-col justify-between"
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              {/* Header section with maroon/gold gradient */}
              <div className="bg-gradient-to-r from-[#7A0019] via-[#8B001A] to-[#630010] px-6 py-5 text-center text-white relative border-b-4 border-[#D4AF37]">
                <img
                  src={logoBanner}
                  alt="KL Logo"
                  className="mx-auto h-16 w-auto object-contain drop-shadow"
                />
                <p className="mt-2.5 text-base font-extrabold tracking-wide drop-shadow-sm leading-tight">
                  Koneru Lakshmaiah Education Foundation
                </p>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#D4AF37] mt-1">
                  Student Identity Card
                </p>
              </div>

              {/* Photo & Details Section */}
              <div className="px-6 py-5 flex flex-col items-center flex-1 justify-center">
                {/* Gold-accented photo ring */}
                <div className="relative mb-4 flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#D4AF37] bg-slate-100 shadow-xl overflow-hidden">
                  {photo ? (
                    <img src={photo} alt="student" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-xs font-bold text-slate-400 p-2">
                      <svg className="h-8 w-8 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      No Photo
                    </div>
                  )}
                </div>

                {/* Details Container */}
                <div className="w-full space-y-3">
                  <div className="rounded-2xl bg-[#7A0019]/5 border border-[#7A0019]/10 p-3 text-center">
                    <p className="text-[9px] uppercase tracking-[0.25em] font-extrabold text-slate-400">
                      Student Name
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold text-[#7A0019] leading-tight truncate">
                      {student.name || "STUDENT NAME"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#D4AF37]/5 p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500 uppercase tracking-wider text-[9px]">Roll Number</span>
                      <span className="font-extrabold text-[#7A0019]">{student.rollNumber || "230009XXXX"}</span>
                    </div>
                    <div className="h-px bg-slate-200/50"></div>
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500 uppercase tracking-wider text-[9px]">Department</span>
                      <span className="font-extrabold text-slate-800 truncate max-w-[65%]">{student.department || "Computer Science"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500 uppercase tracking-wider text-[9px]">Year / Course</span>
                      <span className="font-extrabold text-slate-800">
                        {student.year || "1st Year"} - {student.course || "B.Tech"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barcode section with secure academic stripe */}
              <div className="bg-[#7A0019]/5 border-t border-[#7A0019]/10 px-6 py-3 flex items-center justify-center">
                <div className="bg-white px-4 py-1 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center">
                  <Barcode
                    value={student.rollNumber || "230009XXXX"}
                    width={1.2}
                    height={35}
                    margin={0}
                    displayValue={false}
                  />
                </div>
              </div>
            </div>

            {/* BACK SIDE (Face forward, clean, high-resolution) */}
            <div 
              className="absolute inset-0 w-full h-full rounded-[30px] overflow-hidden bg-white border border-slate-200 shadow-2xl flex flex-col justify-between"
              style={{ 
                backfaceVisibility: "hidden", 
                WebkitBackfaceVisibility: "hidden", 
                transform: "rotateY(180deg)" 
              }}
            >
              {/* Banner at the top */}
              <div className="relative h-28 overflow-hidden border-b-4 border-[#D4AF37]">
                <img
                  src={backBanner}
                  alt="KL Banner"
                  className="w-full h-full object-cover brightness-[0.85]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                  <span className="text-xs font-extrabold tracking-widest text-[#D4AF37] uppercase drop-shadow">
                    Campus Information
                  </span>
                </div>
              </div>

              {/* Back Content Details & Verification QR */}
              <div className="px-5 py-4 space-y-3.5 flex-1 justify-center flex flex-col">
                <div className="rounded-2xl border border-slate-150 bg-slate-50/70 p-3 space-y-2 text-[11px] font-semibold text-slate-700">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-400 uppercase tracking-wider text-[9px] min-w-[70px]">Address</span>
                    <span className="text-right text-slate-800 font-bold leading-tight max-w-[65%]">
                      {student.address || "Bachupally, Hyderabad, TS - 500043"}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200/60"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 uppercase tracking-wider text-[9px]">Mobile</span>
                    <span className="text-slate-800 font-bold">{student.phone || "+91 XXXXXXXXXX"}</span>
                  </div>
                  <div className="h-px bg-slate-200/60"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 uppercase tracking-wider text-[9px]">Date of Birth</span>
                    <span className="text-slate-800 font-bold">{student.dob || "01/01/2004"}</span>
                  </div>
                  <div className="h-px bg-slate-200/60"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 uppercase tracking-wider text-[9px]">Blood Group</span>
                    <span className="text-[#7A0019] font-black">{student.bloodGroup || "O+"}</span>
                  </div>
                </div>

                {/* Secure Verification QR & Signature */}
                <div className="grid grid-cols-[1.2fr_1fr] gap-3 items-center">
                  {/* Dynamic Verification QR */}
                  <div className="flex flex-col items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    <img
                      src={qrCodeUrl}
                      alt="Verification QR"
                      className="h-24 w-24 object-contain"
                    />
                    <span className="text-[7.5px] uppercase font-black text-[#7A0019] tracking-wider mt-1 text-center">
                      Scan to Verify
                    </span>
                  </div>

                  {/* Signature and Verification details */}
                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center flex flex-col items-center">
                      <p className="text-[7px] uppercase tracking-wider text-slate-400 font-extrabold mb-1">
                        Principal Signature
                      </p>
                      {signatureImg ? (
                        <img
                          src={signatureImg}
                          alt="Signature"
                          className="h-10 object-contain filter contrast-125"
                        />
                      ) : (
                        <div className="h-10 flex items-center justify-center text-[9px] text-slate-400 italic">
                          Authorized Signature
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <span className="text-[8px] font-black text-[#D4AF37] bg-[#7A0019] px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        {verificationId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom security watermark banner */}
              <div className="bg-[#7A0019] py-2.5 text-center text-[8px] font-extrabold uppercase tracking-[0.25em] text-[#D4AF37]">
                KL University Academic Security System
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
