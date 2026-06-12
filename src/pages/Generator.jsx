import { useState, useRef } from "react";
import Barcode from "react-barcode";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import logoBanner from "../assets/logos.png";
import backBanner from "../assets/banner.png";
import signatureImg from "../assets/img.png";
import IdCard3D from "../components/IdCard3D";


function Generator({ notify }) {
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
    name: "",
    rollNumber: "",
    department: "Computer Science",
    college: "Koneru Lakshmaiah Education Foundation (KLEF)",
    year: "1st Year",
    course: "",
    bloodGroup: "",
    phone: "",
    address: "",
    dob: "",
    expiryDate: "",
    verificationId: generateVerificationId(),
  }));

  const [photo, setPhoto] = useState(null);
  const [batchItems, setBatchItems] = useState(() => {
    return JSON.parse(localStorage.getItem("idCardBatch") || "[]");
  });

  const persistBatch = (items) => {
    localStorage.setItem("idCardBatch", JSON.stringify(items));
    setBatchItems(items);
  };

  // Handle Input Change
  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Photo Upload
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

  const saveHistory = () => {
    const vId = student.verificationId || generateVerificationId();
    const currentStudent = { ...student, verificationId: vId };

    const history = JSON.parse(localStorage.getItem("idCardHistory") || "[]");
    const next = [
      {
        ...currentStudent,
        id: Date.now(),
        photo,
        savedAt: new Date().toISOString(),
      },
      ...history,
    ];
    localStorage.setItem("idCardHistory", JSON.stringify(next));
    saveVerificationEntry({ ...currentStudent, photo });
    notify("Card saved to preview history", "Saved");
  };

  const addToBatch = () => {
    const vId = student.verificationId || generateVerificationId();
    const currentStudent = { ...student, verificationId: vId };

    const item = {
      ...currentStudent,
      id: Date.now(),
      photo,
    };
    const next = [item, ...batchItems];
    persistBatch(next);
    saveVerificationEntry({ ...currentStudent, photo });
    notify("Card added to batch list", "Batch Updated");

    // Reset fields for next card
    setStudent((prev) => ({
      ...prev,
      verificationId: generateVerificationId(),
      name: "",
      rollNumber: "",
      course: "",
      phone: "",
      address: "",
      dob: "",
      expiryDate: "",
    }));
    setPhoto(null);
  };

  const clearBatch = () => {
    persistBatch([]);
    notify("Batch cleared", "Batch Cleared");
  };

  // Download PDF
  const downloadPDF = async () => {
    if (!student.name || !student.rollNumber) {
      notify("Please fill student name and roll number before downloading.", "Incomplete Credentials");
      return;
    }

    notify("Generating official credential PDF catalog...", "Processing");
    try {
      // Capture Front Card from hidden template in DOM
      const frontCanvas = await html2canvas(frontRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      const frontImg = frontCanvas.toDataURL("image/png");

      // Capture Back Card from hidden template in DOM
      const backCanvas = await html2canvas(backRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      const backImg = backCanvas.toDataURL("image/png");

      // Create PDF Document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // A4 metrics: 210mm wide, 297mm high
      // ID Card relative size: 85mm wide, 122mm high (proportional to 380px x 550px)
      const cardWidth = 85;
      const cardHeight = 122;
      const xOffset = (210 - cardWidth) / 2; // Perfectly centered

      // PAGE 1: Front ID Card
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(122, 0, 25); // Maroon branding
      pdf.text("KONERU LAKSHMAIAH EDUCATION FOUNDATION", 105, 20, { align: "center" });
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text("OFFICIAL STUDENT IDENTITY CARD - FRONT OF PASS", 105, 26, { align: "center" });
      
      // Draw centered border card outline box for clipping/cutting lines
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.rect(xOffset - 2, 33, cardWidth + 4, cardHeight + 4);
      
      pdf.addImage(frontImg, "PNG", xOffset, 35, cardWidth, cardHeight);

      // PAGE 2: Back ID Card
      pdf.addPage();
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(122, 0, 25);
      pdf.text("KONERU LAKSHMAIAH EDUCATION FOUNDATION", 105, 20, { align: "center" });
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text("OFFICIAL STUDENT IDENTITY CARD - REVERSE OF PASS", 105, 26, { align: "center" });
      
      // Draw centered border card outline box for clipping/cutting lines
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.rect(xOffset - 2, 33, cardWidth + 4, cardHeight + 4);

      pdf.addImage(backImg, "PNG", xOffset, 35, cardWidth, cardHeight);

      // Download file to laptop
      const fileName = `KLH_ID_Card_${student.rollNumber || "Student"}.pdf`;
      pdf.save(fileName);
      notify("Identity Card PDF generated & downloaded successfully!", "Download Complete");
    } catch (err) {
      console.error("PDF download failure:", err);
      notify("Failed to capture template elements. Please retry.", "Error");
    }
  };



  const downloadBatchPDF = async () => {
    if (!batchItems.length) {
      notify("Add at least one card to the batch before exporting", "Batch Empty");
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

      // Backup current student details to restore them after batch is compiled
      const backupStudent = { ...student };
      const backupPhoto = photo;

      for (let i = 0; i < batchItems.length; i++) {
        const item = batchItems[i];
        
        // 1. Load this item into the state so the off-screen DOM templates render it
        setStudent(item);
        setPhoto(item.photo);

        // 2. Wait a brief moment for React to update the DOM
        await new Promise((resolve) => setTimeout(resolve, 250));

        // 3. Capture the visual templates
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

      // 5. Restore the original form state
      setStudent(backupStudent);
      setPhoto(backupPhoto);

      // 6. Download the beautifully compiled visual PDF to their laptop!
      pdf.save("KLH-Student-ID-Batch-Catalog.pdf");
      notify("Visual print-ready batch catalog downloaded successfully!", "Batch Export Complete");
    } catch (err) {
      console.error("Batch download failure:", err);
      notify("Failed to compile batch visual templates.", "Error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-wide text-[#7A0019]">
          KL UNIVERSITY HYDERABAD
        </h1>
        <p className="text-xs md:text-sm font-bold text-[#D4AF37] tracking-[0.25em] uppercase mt-2">
          Official Student Identity Card Generator Portal
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto items-start">
        
        {/* FORM SECTION */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border-t-4 border-[#7A0019]">
          <h2 className="text-2xl font-black text-[#7A0019] mb-6 flex items-center gap-2">
            <svg className="h-6 w-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Student Credentials
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
              placeholder="Roll Number (e.g. 2300090001)"
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
                placeholder="Course (e.g. B.Tech)"
                className="w-full border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#7A0019]/25 focus:border-[#7A0019] transition"
                value={student.course}
                onChange={handleChange}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="bloodGroup"
                placeholder="Blood Group (e.g. B+)"
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

            <div className="mt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Upload Student Photo
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#7A0019]/10 file:text-[#7A0019] hover:file:bg-[#7A0019]/20 cursor-pointer"
                onChange={handlePhoto}
              />
            </div>

            <div className="grid gap-3 mt-4">
              <button
                onClick={downloadPDF}
                className="w-full bg-[#7A0019] hover:bg-[#9c0020] text-white py-3.5 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Official PDF
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={saveHistory}
                  className="w-full bg-[#D4AF37] hover:bg-[#ffe066] text-[#7A0019] py-3.5 rounded-xl font-bold transition shadow-md"
                >
                  Save to History
                </button>
                <button
                  onClick={addToBatch}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold transition shadow-md"
                >
                  Add to Batch
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* VISIBLE 3D CARD PREVIEW */}
        <div className="space-y-6 flex flex-col items-center">
          
          <IdCard3D
            student={student}
            photo={photo}
            logoBanner={logoBanner}
            backBanner={backBanner}
            signatureImg={signatureImg}
            verificationId={student.verificationId}
          />

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
                  {photo ? (
                    <img src={photo} alt="student" className="h-full w-full object-cover" />
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
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`${window.location.origin}/verify/${student.verificationId || 'KLH-2026-982103'}`)}`}
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
                        {student.verificationId || "KLH-2026-982103"}
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

        <div className="bg-white p-6 rounded-2xl shadow-xl mt-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-slate-900">Batch Preview</h2>
              <button
                onClick={downloadBatchPDF}
                className="rounded-full bg-cyan-600 px-4 py-2 text-white"
              >
                Download Batch
              </button>
            </div>
            {batchItems.length === 0 ? (
              <p className="text-slate-500">No cards in batch. Add the current card to batch to preview it here.</p>
            ) : (
              <div className="space-y-4">
                {batchItems.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 p-4 bg-slate-50">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name || "Student Name"}</p>
                        <p className="text-sm text-slate-500">{item.rollNumber || "Roll Number"}</p>
                      </div>
                      <span className="rounded-full bg-blue-900 px-3 py-1 text-xs text-white">
                        {item.department || "Department"}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <p>{item.course || "Course"}</p>
                      <p>{item.college}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearBatch}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700"
              >
                Clear Batch
              </button>
            </div>
          </div>
        </div>

      </div>
  );
}

export default Generator;