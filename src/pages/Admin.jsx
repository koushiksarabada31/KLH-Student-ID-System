import { useMemo, useState } from "react";
import { getUsers, saveUsers } from "../utils/auth";
import logoBanner from "../assets/logos.png";

const tabs = [
  { id: "dashboard", label: "Registry Overview" },
  { id: "students", label: "Student Profiles" },
  { id: "generated", label: "Identity Database" },
];

const yearOptions = ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function Admin({ notify }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState(() => {
    return getUsers().filter((user) => !user.isAdmin);
  });
  const [generatedIds] = useState(() => {
    return JSON.parse(localStorage.getItem("idCardHistory") || "[]");
  });
  const [notificationsCount] = useState(() => {
    const notifications = JSON.parse(localStorage.getItem("appNotifications") || "[]");
    return notifications.length;
  });
  
  // Search & Filter state for Student Profiles
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("All");
  const [filterDepartment, setFilterDepartment] = useState("All");
  
  // Search, Filter, Sort state for Identity Database
  const [idSearch, setIdSearch] = useState("");
  const [idFilterYear, setIdFilterYear] = useState("All");
  const [idFilterDept, setIdFilterDept] = useState("All");
  const [idSortField, setIdSortField] = useState("savedAt");
  const [idSortOrder, setIdSortOrder] = useState("desc");

  // Email Sharing & SMTP Simulator State
  const [emailSimulatorCard, setEmailSimulatorCard] = useState(null);
  const [simulatorStep, setSimulatorStep] = useState(0);
  const [simulatorLogs, setSimulatorLogs] = useState([]);
  const [emailStatuses, setEmailStatuses] = useState(() => {
    return JSON.parse(localStorage.getItem("klhIdEmails") || "{}");
  });

  // Filter & Search Student Profiles
  const filteredStudents = useMemo(() => {
    let list = [...students];
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.fullName.toLowerCase().includes(term) ||
          item.email.toLowerCase().includes(term) ||
          item.username.toLowerCase().includes(term) ||
          item.department.toLowerCase().includes(term) ||
          item.year.toLowerCase().includes(term)
      );
    }
    if (filterYear !== "All") {
      list = list.filter((item) => item.year === filterYear);
    }
    if (filterDepartment !== "All") {
      list = list.filter((item) => item.department === filterDepartment);
    }
    return list;
  }, [search, filterYear, filterDepartment, students]);

  // Filter, Search, and Sort Identity Database (Generated Cards)
  const filteredGeneratedIds = useMemo(() => {
    let list = [...generatedIds];
    
    // Search
    if (idSearch.trim()) {
      const term = idSearch.toLowerCase();
      list = list.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(term) ||
          (item.rollNumber || "").toLowerCase().includes(term) ||
          (item.department || "").toLowerCase().includes(term)
      );
    }

    // Filter Year
    if (idFilterYear !== "All") {
      list = list.filter((item) => item.year === idFilterYear);
    }

    // Filter Department
    if (idFilterDept !== "All") {
      list = list.filter((item) => item.department === idFilterDept);
    }

    // Sort
    list.sort((a, b) => {
      let aVal = a[idSortField] || "";
      let bVal = b[idSortField] || "";

      if (idSortField === "savedAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }

      if (aVal < bVal) return idSortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return idSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [idSearch, idFilterYear, idFilterDept, idSortField, idSortOrder, generatedIds]);

  const removeStudent = (studentId) => {
    const nextStudents = students.filter((student) => student.id !== studentId);
    saveUsers(nextStudents);
    setStudents(nextStudents);
    notify("Student profile deleted successfully", "Student Removed");
  };

  // Reusable departments list
  const departments = useMemo(
    () => Array.from(new Set(students.map((student) => student.department).filter(Boolean))),
    [students]
  );

  const studentsByYear = useMemo(() => {
    return students.reduce(
      (acc, student) => {
        const year = student.year || "Unknown";
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      },
      { "1st Year": 0, "2nd Year": 0, "3rd Year": 0, "4th Year": 0 }
    );
  }, [students]);

  const studentsByDepartment = useMemo(() => {
    return students.reduce((acc, student) => {
      const department = student.department || "Unknown";
      acc[department] = (acc[department] || 0) + 1;
      return acc;
    }, {});
  }, [students]);

  const recentRegistrations = useMemo(() => {
    return [...students].sort((a, b) => b.id - a.id).slice(0, 5);
  }, [students]);

  const recentIds = useMemo(() => {
    return [...generatedIds]
      .sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0))
      .slice(0, 5);
  }, [generatedIds]);

  // SMTP Simulation Engine
  const triggerEmailSimulation = (card) => {
    setEmailSimulatorCard(card);
    setSimulatorStep(0);
    setSimulatorLogs([]);

    const studentEmail = card.rollNumber ? `${card.rollNumber}@klh.edu.in` : "student@klh.edu.in";
    const vId = card.verificationId || "KLH-2026-XXXXXX";

    const logs = [
      "⚡ Initializing SMTP client network layers...",
      "🔌 Resolving DNS records for MX: mail.klh.edu.in...",
      "🔗 Connecting to SMTP server at smtp.klh.edu.in:587...",
      "🛡️ Executing STARTTLS Handshake... Connection secured via TLSv1.3",
      "🔑 Authenticating admin credentials (identity-portal@klh.edu.in)...",
      "📝 Generating official KLH student digital identity pass assets...",
      "📎 Bundling High-Resolution Student Identity Card archive (student-id.pdf)...",
      "🔗 Binding public secure verification URI: " + window.location.origin + "/verify/" + vId,
      "📤 Dispatching data packet stream to: " + studentEmail,
      "🚀 Data streams successfully acknowledged by university exchange server.",
      "✅ Deliverability report: 250 OK Message accepted for delivery.",
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setSimulatorLogs((prev) => [...prev, logs[currentLogIndex]]);
        setSimulatorStep(currentLogIndex);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        // Simulation complete, update localStorage status
        setEmailStatuses((prev) => {
          const next = { ...prev, [card.id]: "Sent" };
          localStorage.setItem("klhIdEmails", JSON.stringify(next));
          return next;
        });
        notify(`Academic Digital ID card successfully shared with ${studentEmail}!`, "ID Card Emailed");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 select-none font-sans">
      
      {/* Visual Header Banner */}
      <div className="mb-8 rounded-[30px] bg-gradient-to-r from-[#4a000e] via-[#7A0019] to-[#240005] p-8 text-white shadow-2xl border-b-4 border-[#D4AF37]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black tracking-wider text-white">KL UNIVERSITY HYDERABAD</h1>
            <p className="text-xs md:text-sm font-bold text-[#D4AF37] tracking-[0.2em] uppercase mt-2">
              Student Digital Identity Management System • Administrator Command Center
            </p>
          </div>
          <img src={logoBanner} alt="KL University Logo" className="h-16 w-auto object-contain brightness-110 drop-shadow" />
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3 max-w-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-2xl border py-4 text-xs font-black uppercase tracking-widest transition active:scale-95 ${
              activeTab === tab.id
                ? "border-[#7A0019] bg-[#7A0019] text-white shadow-lg"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl bg-white p-8 shadow border border-slate-100">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Registered Students</p>
              <p className="mt-3 text-4xl font-black text-[#7A0019]">{students.length}</p>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow border border-slate-100">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Generated ID Cards</p>
              <p className="mt-3 text-4xl font-black text-[#7A0019]">{generatedIds.length}</p>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow border border-slate-100">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Total Notifications</p>
              <p className="mt-3 text-4xl font-black text-[#7A0019]">{notificationsCount}</p>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow border border-slate-100">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Academic Branches</p>
              <p className="mt-3 text-4xl font-black text-[#7A0019]">{departments.length}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl bg-white p-8 shadow border border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">Year Distribution</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">Enrollment data breakdown by student academic year.</p>
              </div>
              <div className="space-y-4 mt-6">
                {Object.entries(studentsByYear).map(([year, count]) => {
                  const total = students.length || 1;
                  return (
                    <div key={year} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>{year}</span>
                        <span className="text-[#7A0019]">{count}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7A0019] to-[#D4AF37]"
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="rounded-3xl bg-white p-8 shadow border border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">Branch Distribution</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">Active registered student accounts grouped by branch.</p>
              </div>
              <div className="space-y-4 mt-6">
                {Object.entries(studentsByDepartment).map(([department, count]) => {
                  const total = students.length || 1;
                  return (
                    <div key={department} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="truncate max-w-[80%]">{department}</span>
                        <span className="text-[#7A0019]">{count}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#7A0019]"
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 shadow border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-5">Recent Student Registrations</h2>
              <div className="space-y-4">
                {recentRegistrations.map((student) => (
                  <div key={student.id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50 flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-[#7A0019] text-sm">{student.fullName}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{student.email}</p>
                    </div>
                    <span className="rounded-full bg-[#7A0019]/5 border border-[#7A0019]/10 px-3 py-1 text-[9px] font-black text-[#7A0019] uppercase tracking-wider">
                      {student.year}
                    </span>
                  </div>
                ))}
                {recentRegistrations.length === 0 && <p className="text-xs text-slate-400 font-bold">No registered student accounts yet.</p>}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-5">Recent Generated ID Cards</h2>
              <div className="space-y-4">
                {recentIds.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50 flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-[#7A0019] text-sm">{item.name || "Student Name"}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Roll Number: {item.rollNumber}</p>
                    </div>
                    <span className="rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3 py-1 text-[9px] font-black text-[#7A0019] uppercase tracking-wider">
                      {item.verificationId || "VALID"}
                    </span>
                  </div>
                ))}
                {recentIds.length === 0 && <p className="text-xs text-slate-400 font-bold">No student ID cards generated yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROFILES TAB */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow border border-slate-100">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-[#7A0019]">Student Profiles</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">Filter, delete, and audit central student authentication files.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 w-full lg:max-w-2xl">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, username..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-[#7A0019] focus:border-[#7A0019] transition"
                />
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-[#7A0019] focus:border-[#7A0019] transition"
                >
                  <option value="All">All Years</option>
                  {yearOptions.slice(1).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-[#7A0019] focus:border-[#7A0019] transition"
                >
                  <option value="All">All Branches</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-700 font-semibold">
                <thead className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Year</th>
                    <th className="px-4 py-3.5">Branch</th>
                    <th className="px-4 py-3.5">Username</th>
                    <th className="px-4 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-4 font-extrabold text-[#7A0019]">{student.fullName}</td>
                      <td className="px-4 py-4 text-slate-600 font-bold">{student.email}</td>
                      <td className="px-4 py-4">{student.year}</td>
                      <td className="px-4 py-4">{student.department}</td>
                      <td className="px-4 py-4 text-slate-500 font-bold">{student.username}</td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => removeStudent(student.id)}
                          className="rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 px-4 py-2 text-[10px] font-bold text-rose-600 shadow-sm transition active:scale-95"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-slate-400 font-bold italic">
                        No student profiles match the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* IDENTITY DATABASE TAB (GENERATED CARDS) */}
      {activeTab === "generated" && (
        <div className="space-y-6">
          {/* Filters & Sorting Controls */}
          <div className="rounded-3xl bg-white p-8 shadow border border-slate-100">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-[#7A0019]">Identity Registry Database</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">Audit verification credentials, filter catalog, and dispatch college emails.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 w-full lg:max-w-4xl">
                <input
                  value={idSearch}
                  onChange={(e) => setIdSearch(e.target.value)}
                  placeholder="Search Name or Roll..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-[#7A0019] focus:border-[#7A0019] transition"
                />
                
                <select
                  value={idFilterYear}
                  onChange={(e) => setIdFilterYear(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-[#7A0019] focus:border-[#7A0019] transition"
                >
                  <option value="All">All Years</option>
                  {yearOptions.slice(1).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                <select
                  value={idFilterDept}
                  onChange={(e) => setIdFilterDept(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-[#7A0019] focus:border-[#7A0019] transition"
                >
                  <option value="All">All Branches</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <select
                    value={idSortField}
                    onChange={(e) => setIdSortField(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-[#7A0019] focus:border-[#7A0019] transition"
                  >
                    <option value="savedAt">Date Saved</option>
                    <option value="name">Student Name</option>
                    <option value="rollNumber">Roll Number</option>
                  </select>
                  <button
                    onClick={() => setIdSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                    className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl transition active:scale-95 text-slate-600"
                  >
                    {idSortOrder === "asc" ? "▲" : "▼"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cards database list */}
          <div className="rounded-3xl bg-white p-8 shadow border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-700 font-semibold">
                <thead className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Roll Number</th>
                    <th className="px-4 py-3.5">Student Name</th>
                    <th className="px-4 py-3.5">Branch</th>
                    <th className="px-4 py-3.5">Verification ID</th>
                    <th className="px-4 py-3.5 text-center">Delivery status</th>
                    <th className="px-4 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGeneratedIds.map((item) => {
                    const emailStatus = emailStatuses[item.id] || "Pending";
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-4 font-extrabold text-[#7A0019]">{item.rollNumber}</td>
                        <td className="px-4 py-4 text-slate-800 font-extrabold">{item.name || "Student Name"}</td>
                        <td className="px-4 py-4 text-slate-500 font-bold">{item.department}</td>
                        <td className="px-4 py-4 font-mono font-bold text-slate-600">{item.verificationId}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            emailStatus === "Sent"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-amber-50 text-amber-600 border border-amber-200"
                          }`}>
                            {emailStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => triggerEmailSimulation(item)}
                            className="rounded-full bg-[#7A0019] hover:bg-[#9c0020] text-white px-4 py-2.5 text-[10px] font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                          >
                            Send Email
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredGeneratedIds.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-slate-400 font-bold italic">
                        No generated student identity cards match current search/filter metrics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SMTP EMAIL SIMULATOR OVERLAY MODAL */}
      {emailSimulatorCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Title */}
            <div className="bg-[#7A0019] border-b border-slate-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  KLH SMTP Transaction Relay
                </span>
              </div>
              <button
                onClick={() => setEmailSimulatorCard(null)}
                className="text-slate-400 hover:text-white font-extrabold text-base"
              >
                ✕
              </button>
            </div>

            {/* Simulated Live Console Logs */}
            <div className="flex-1 p-6 overflow-y-auto bg-black text-emerald-400 font-mono text-[11px] leading-relaxed space-y-2.5 min-h-[300px]">
              <p className="text-slate-500">// Connected to mail.klh.edu.in client stack...</p>
              {simulatorLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-500 font-semibold">{`[${idx + 1}]`}</span>
                  <span className="flex-1 whitespace-pre-wrap">{log}</span>
                </div>
              ))}
              
              {simulatorStep < 10 ? (
                <div className="flex items-center gap-2 mt-4 text-slate-400 italic">
                  <div className="h-3 w-3 rounded-full border border-slate-400 border-t-transparent animate-spin"></div>
                  Relaying packet streams...
                </div>
              ) : (
                <div className="mt-6 border border-emerald-500/20 bg-emerald-950/20 p-4 rounded-xl text-center text-xs font-bold text-emerald-400 animate-pulse">
                  ✅ STACK SECURE & SHARED: Identity card successfully dispatched!
                </div>
              )}
            </div>

            {/* Email Preview Detail Summary */}
            <div className="bg-slate-800 border-t border-slate-700 p-5 text-xs text-slate-300 font-bold space-y-2">
              <div>
                <span className="text-slate-500">SMTP Host:</span> smtp.klh.edu.in:587
              </div>
              <div>
                <span className="text-slate-500">Recipient student:</span> {emailSimulatorCard.name} ({emailSimulatorCard.rollNumber}@klh.edu.in)
              </div>
              <div>
                <span className="text-slate-500">Verification Link:</span> <span className="text-blue-400 font-mono">/verify/{emailSimulatorCard.verificationId}</span>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  disabled={simulatorStep < 10}
                  onClick={() => setEmailSimulatorCard(null)}
                  className={`rounded-full px-6 py-2 text-xs font-black uppercase tracking-wider transition ${
                    simulatorStep >= 10
                      ? "bg-emerald-500 hover:bg-emerald-600 text-slate-900"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Close Console
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
