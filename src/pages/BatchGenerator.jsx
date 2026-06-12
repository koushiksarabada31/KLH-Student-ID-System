import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Barcode from "react-barcode";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import logoBanner from "../assets/logos.png";
import backBanner from "../assets/banner.png";
import signatureImg from "../assets/img.png";

const emptyStudent = {
  name: "",
  rollNumber: "",
  department: "Computer Science",
  college: "Koneru Lakshmaiah Education Foundation (KLEF)",
  year: "1st Year",
  course: "B.Tech",
  bloodGroup: "",
  phone: "",
  address: "",
  dob: "",
  expiryDate: "",
  verificationId: "",
};

function BatchGenerator({ notify }) {
  const frontRef = useRef();
  const backRef = useRef();

  const generateVerificationId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let rand = "";
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `KLH-2026-${rand}`;
  };

  const [student, setStudent] = useState(() => ({
    ...emptyStudent,
    verificationId: generateVerificationId(),
  }));
  const [photo, setPhoto] = useState(null);
  const [batchItems, setBatchItems] = useState(() => {
    return JSON.parse(localStorage.getItem("idCardBatch") || "[]");
  });

  // States for sequential off-screen DOM canvas capture
  const [captureStudent, setCaptureStudent] = useState(emptyStudent);
  const [capturePhoto, setCapturePhoto] = useState(null);

  const persistBatch = (items) => {
    localStorage.setItem("idCardBatch", JSON.stringify(items));
    setBatchItems(items);
  };

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  // Safe Photo Upload using FileReader to generate Base64 URL
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result); // Base64 encoded string
      };
      reader.readAsDataURL(file);
    }
  };

  const saveVerificationEntry = (item) => {
    const verifications = JSON.parse(localStorage.getItem("klhIdVerifications") || "{}");
    verifications[item.verificationId] = {
      name: item.name || "Student Name",
      rollNumber: item.rollNumber || "230009XXXX",
      department: item.department || "Computer Science",
      year: item.year || "1st Year",
      course: item.course || "B.Tech",
      dob: item.dob || "01/01/2004",
      bloodGroup: item.bloodGroup || "O+",
      photo: item.photo,
      status: "VALID",
      verifiedAt: new Date().toISOString()
    };
    localStorage.setItem("klhIdVerifications", JSON.stringify(verifications));
  };

  const addToBatch = () => {
    if (!student.name || !student.rollNumber) {
      notify("Please fill student name and roll number before adding to batch.", "Incomplete Credentials");
      return;
    }

    const vId = student.verificationId || generateVerificationId();
    const currentStudent = { ...student, verificationId: vId };

    const item = {
      ...currentStudent,
      id: Date.now(),
      photo,
      savedAt: new Date().toISOString(),
    };

    const next = [item, ...batchItems];
    persistBatch(next);
    saveVerificationEntry(item);
    notify("Added student card to the batch", "Batch Updated");

    // Reset student input fields for next card
    setStudent({
      ...emptyStudent,
      verificationId: generateVerificationId(),
    });
    setPhoto(null);
  };

  const clearBatch = () => {
    persistBatch([]);
    notify("Batch list cleared", "Batch Cleared");
  };

  const downloadBatchPdf = async () => {
    if (!batchItems.length) {
      notify("Add at least one card to the batch first", "Empty Batch");
      return;
    }

    notify("Compiling visual print-ready batch catalog...", "Processing");
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const cardWidth = 85;
      const cardHeight = 122;
      const xOffset = (210 - cardWidth) / 2; // Center horizontally

      for (let i = 0; i < batchItems.length; i++) {
        const item = batchItems[i];
        
        // 1. Load this item into the capture state so the off-screen templates render it
        setCaptureStudent(item);
        setCapturePhoto(item.photo);

        // 2. Wait a brief moment for React to update the DOM
        await new Promise((resolve) => setTimeout(resolve, 250));

        // 3. Capture the visual templates from off-screen
        const frontCanvas = await html2canvas(frontRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null
        });
        const frontImg = frontCanvas.toDataURL("image/png");

        const backCanvas = await html2canvas(backRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null
        });
        const backImg = backCanvas.toDataURL("image/png");

        // 4. Add pages to PDF
        if (i > 0) pdf.addPage();
        
        // PAGE 1: Front
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(122, 0, 25);
        pdf.text("KONERU LAKSHMAIAH EDUCATION FOUNDATION", 105, 18, { align: "center" });
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`STUDENT BATCH: ${i + 1} OF ${batchItems.length} - FRONT OF PASS`, 105, 24, { align: "center" });
        
        // Draw cutting border
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.rect(xOffset - 2, 31, cardWidth + 4, cardHeight + 4);
        
        pdf.addImage(frontImg, "PNG", xOffset, 33, cardWidth, cardHeight);

        // PAGE 2: Back
        pdf.addPage();
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(122, 0, 25);
        pdf.text("KONERU LAKSHMAIAH EDUCATION FOUNDATION", 105, 18, { align: "center" });
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`STUDENT BATCH: ${i + 1} OF ${batchItems.length} - REVERSE OF PASS`, 105, 24, { align: "center" });
        
        // Draw cutting border
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.rect(xOffset - 2, 31, cardWidth + 4, cardHeight + 4);

        pdf.addImage(backImg, "PNG", xOffset, 33, cardWidth, cardHeight);
      }

      // Restore central capture states
      setCaptureStudent(emptyStudent);
      setCapturePhoto(null);

      // Download beautifully compiled PDF catalog to their laptop!
      pdf.save("KLH-Student-ID-Batch-Catalog.pdf");
      notify("Visual print-ready batch catalog downloaded successfully!", "Batch Export Complete");
    } catch (err) {
      console.error("Batch download failure:", err);
      notify("Failed to compile batch visual templates.", "Error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 max-w-7xl mx-auto border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-black text-[#7A0019]">Batch ID Card Builder</h1>
          <p className="mt-2 text-slate-600 max-w-2xl text-sm font-semibold">
            Create several student identity cards in a single session, add them to a batch, preview the list, and export them as a unified catalog.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            to="/generator"
            className="rounded-full bg-[#7A0019] hover:bg-[#9c0020] border border-[#D4AF37] px-6 py-3 text-white text-sm font-bold shadow-md transition active:scale-95"
          >
            Single Generator
          </Link>
          <Link
            to="/history"
            className="rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3 text-slate-700 text-sm font-bold shadow-sm transition active:scale-95"
          >
            Preview History
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-10 max-w-7xl mx-auto items-start">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-t-4 border-[#7A0019]">
          <h2 className="text-2xl font-black text-[#7A0019] mb-6 flex items-center gap-2">
            <svg className="h-6 w-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Student to Batch Catalog
          </h2>

          <div className="grid gap-4">
            <input
              type="text"
              name="name"
              placeholder="Student Full Name"
              className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#7A0019]/25 focus:border-[#7A0019] transition"
              value={student.name}
              onChange={handleChange}
            />
            <input
              type="text"
              name="rollNumber"
              placeholder="Roll Number (e.g. 230009XXXX)"
              className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#7A0019]/25 focus:border-[#7A0019] transition"
              value={student.rollNumber}
              onChange={handleChange}
            />
            <input
              type="text"
              name="department"
              placeholder="Department (e.g. Computer Science)"
              className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#7A0019]/25 focus:border-[#7A0019] transition"
              value={student.department}
              onChange={handleChange}
            />
            <input
              type="text"
              name="college"
              placeholder="Institution Name"
              className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#7A0019]/25 focus:border-[#7A0019] transition animate-pulse"
              value={student.college}
              onChange={handleChange}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <select
                name="year"
                value={student.year}
                onChange={handleChange}
                className="w-full border border-slate-200 p-3.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#7A0019]/25 focus:border-[#7A0019] transition"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
              <input
                type="text"
                name="course"
                placeholder="Course of Study (e.g. B.Tech)"
                className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#7A0019]/25 focus:border-[#7A0019] transition"
                value={student.course}
                onChange={handleChange}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="bloodGroup"
                placeholder="Blood Group (e.g. O+)"
                className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#7A0019]/25 focus:border-[#7A0019] transition"
                value={student.bloodGroup}
                onChange={handleChange}
              />
              <input
                type="text"
                name="phone"
                placeholder="Mobile Number"
                className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#7A0019]/25 focus:border-[#7A0019] transition"
                value={student.phone}
                onChange={handleChange}
              />
            </div>

            <textarea
              name="address"
              placeholder="Residential Address"
              className="w-full border border-slate-200 p-3.5 rounded-xl h-24 outline-none focus:ring-2 focus:ring-[#7A0019]/25 focus:border-[#7A0019] transition resize-none"
              value={student.address}
              onChange={handleChange}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="dob"
                placeholder="Date of Birth (DD/MM/YYYY)"
                className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#7A0019]/25 focus:border-[#7A0019] transition"
                value={student.dob}
                onChange={handleChange}
              />
              <input
                type="text"
                name="expiryDate"
                placeholder="Valid Till (e.g. 31/05/2027)"
                className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#7A0019]/25 focus:border-[#7A0019] transition"
                value={student.expiryDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student Photo</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#7A0019]/10 file:text-[#7A0019] hover:file:bg-[#7A0019]/20 cursor-pointer"
                onChange={handlePhoto}
              />
            </div>

            <button
              onClick={addToBatch}
              className="w-full bg-[#7A0019] hover:bg-[#9c0020] text-white py-3.5 rounded-xl font-bold transition shadow-lg mt-2 flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Card to Batch
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border-t-4 border-[#D4AF37]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-black text-slate-900">Active Batch Catalog</h2>
            <div className="flex gap-2">
              <button
                onClick={downloadBatchPdf}
                className="rounded-full bg-[#7A0019] hover:bg-[#9c0020] px-4 py-2 text-xs font-bold text-white shadow transition cursor-pointer"
              >
                Export PDF
              </button>
              <button
                onClick={clearBatch}
                className="rounded-full border border-slate-300 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {batchItems.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-500 font-semibold">
              No active cards in batch. Fill out the credentials and click Add to Batch above.
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {batchItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50 hover:shadow transition">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-[#7A0019]">{item.name || "Student Name"}</p>
                      <p className="text-xs font-bold text-slate-500">{item.rollNumber || "230009XXXX"}</p>
                    </div>
                    <span className="rounded-full bg-[#7A0019]/10 border border-[#7A0019]/20 px-3 py-1 text-[10px] font-black text-[#7A0019] uppercase tracking-wider">
                      {item.department || "Department"}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-500">
                    <p className="truncate"><span className="text-slate-400">Course:</span> {item.course || "B.Tech"}</p>
                    <p className="truncate text-right"><span className="text-slate-400">Year:</span> {item.year || "1st Year"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Print capture container positioned off-viewport but fully styled with 100% opacity to prevent transparent canvas rendering */}
      <div className="fixed top-[200vh] left-0 pointer-events-none flex flex-col gap-6" style={{ opacity: 1, zIndex: -1000 }}>
        {/* FRONT CARD CAPTURE ELEMENT */}
        <div
          ref={frontRef}
          className="relative w-[380px] h-[550px] overflow-hidden bg-white border border-slate-200 flex flex-col justify-between rounded-[30px]"
        >
          {/* Header section with maroon/gold gradient */}
          <div className="bg-gradient-to-r from-[#7A0019] via-[#8B001A] to-[#630010] px-6 py-5 text-center text-white relative border-b-4 border-[#D4AF37]">
            <img
              src={logoBanner}
              alt="KL Logo"
              className="mx-auto h-16 w-auto object-contain"
            />
            <p className="mt-2.5 text-base font-extrabold tracking-wide leading-tight">
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
              {capturePhoto ? (
                <img src={capturePhoto} alt="student" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-xs font-bold text-slate-400 p-2">
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
                  {captureStudent.name || "STUDENT NAME"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-[#D4AF37]/5 p-3 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px]">Roll Number</span>
                  <span className="font-extrabold text-[#7A0019]">{captureStudent.rollNumber || "230009XXXX"}</span>
                </div>
                <div className="h-px bg-slate-200/50"></div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px]">Department</span>
                  <span className="font-extrabold text-slate-800 truncate max-w-[65%]">{captureStudent.department || "Computer Science"}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px]">Year / Course</span>
                  <span className="font-extrabold text-slate-800">
                    {captureStudent.year || "1st Year"} - {captureStudent.course || "B.Tech"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Barcode section with secure academic stripe */}
          <div className="bg-[#7A0019]/5 border-t border-[#7A0019]/10 px-6 py-3 flex items-center justify-center">
            <div className="bg-white px-4 py-1 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center">
              <Barcode
                value={captureStudent.rollNumber || "230009XXXX"}
                width={1.2}
                height={35}
                margin={0}
                displayValue={false}
              />
            </div>
          </div>
        </div>

        {/* BACK CARD CAPTURE ELEMENT */}
        <div
          ref={backRef}
          className="relative w-[380px] h-[550px] overflow-hidden bg-white border border-slate-200 flex flex-col justify-between rounded-[30px]"
        >
          {/* Banner at the top */}
          <div className="relative h-28 overflow-hidden border-b-4 border-[#D4AF37]">
            <img
              src={backBanner}
              alt="KL Banner"
              className="w-full h-full object-cover brightness-[0.85]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
              <span className="text-xs font-extrabold tracking-widest text-[#D4AF37] uppercase">
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
                  {captureStudent.address || "Bachupally, Hyderabad, TS - 500043"}
                </span>
              </div>
              <div className="h-px bg-slate-200/60"></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase tracking-wider text-[9px]">Mobile</span>
                <span className="text-slate-800 font-bold">{captureStudent.phone || "+91 XXXXXXXXXX"}</span>
              </div>
              <div className="h-px bg-slate-200/60"></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase tracking-wider text-[9px]">Date of Birth</span>
                <span className="text-slate-800 font-bold">{captureStudent.dob || "01/01/2004"}</span>
              </div>
              <div className="h-px bg-slate-200/60"></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase tracking-wider text-[9px]">Blood Group</span>
                <span className="text-[#7A0019] font-black">{captureStudent.bloodGroup || "O+"}</span>
              </div>
            </div>

            {/* Secure Verification QR & Signature */}
            <div className="grid grid-cols-[1.2fr_1fr] gap-3 items-center">
              {/* Dynamic Verification QR */}
              <div className="flex flex-col items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`${window.location.origin}/verify/${captureStudent.verificationId || 'KLH-2026-982103'}`)}`}
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
                    {captureStudent.verificationId || "KLH-2026-982103"}
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
  );
}

export default BatchGenerator;
