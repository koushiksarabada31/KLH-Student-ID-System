import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, getCurrentUser } from "../utils/auth";
import logoBanner from "../assets/logos.png";

function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirm: "",
    year: "1st Year",
    department: "Computer Science",
    identifier: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (getCurrentUser()) navigate("/");
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.username || !form.password || !form.department) {
      setError("Please fill all fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    const result = registerUser({
      fullName: form.fullName,
      email: form.email,
      username: form.username,
      password: form.password,
      year: form.year,
      department: form.department,
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setTab("login");
    setError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (!form.identifier || !form.password) {
      setError("Enter email/username and password.");
      return;
    }

    const res = loginUser({ identifier: form.identifier, password: form.password });
    if (!res.ok) {
      setError(res.message);
      return;
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      {/* Official University Header */}
      <div className="w-full bg-white border-b-4 border-[#D4AF37] py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <img src={logoBanner} alt="KL University Logo" className="h-16 w-auto object-contain" />
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-black text-[#7A0019] leading-tight tracking-wide">
              KONERU LAKSHMAIAH EDUCATION FOUNDATION
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              (Deemed to be University estd. u/s. 3 of the UGC Act, 1956)
            </p>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium">
              Off-Campus: Bachupally-Gandimaisamma Road, Bowrampet, Hyderabad, Telangana - 500043
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end text-xs text-slate-600 font-semibold gap-1 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-6">
          <div><span className="text-[#7A0019] font-bold">Phone No:</span> 7815926816</div>
          <div><span className="text-[#7A0019] font-bold">Website:</span> <a href="http://www.klh.edu.in" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">www.klh.edu.in</a></div>
        </div>
      </div>

      {/* Main Login / Register Area */}
      <div className="relative flex-1 w-full flex items-center justify-center bg-gradient-to-br from-[#4a000e] via-[#7A0019] to-[#240005] overflow-hidden p-6">
        
        {/* Decorative Floating Shapes */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-[#D4AF37]/5 rounded-full blur-3xl animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#7A0019]/20 rounded-full blur-3xl animate-pulse duration-[10000ms]"></div>
        
        {/* Glassmorphism Login Card */}
        <div className="relative z-10 w-full max-w-[480px] bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/30">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black tracking-wider text-white">KLH IDENTITY PORTAL</h2>
            <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-widest mt-1">Student Digital Identity Access</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-3 rounded-xl font-bold tracking-wide transition ${
                tab === "login"
                  ? "bg-[#7A0019] text-white border border-[#D4AF37]"
                  : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-3 rounded-xl font-bold tracking-wide transition ${
                tab === "register"
                  ? "bg-[#7A0019] text-white border border-[#D4AF37]"
                  : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-semibold text-rose-200 bg-rose-500/20 border border-rose-500/30 text-center animate-shake">
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  name="identifier"
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="Email or Username"
                  className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-white placeholder-slate-300 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
                />
              </div>
              <div>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-white placeholder-slate-300 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#D4AF37] hover:bg-[#ffe27c] text-[#7A0019] py-3 rounded-xl font-extrabold tracking-wider shadow-lg transform active:scale-95 transition"
              >
                LOGIN
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-white placeholder-slate-300 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
              />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email (must be @klh.edu.in)"
                className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-white placeholder-slate-300 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
              />
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-white placeholder-slate-300 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
              />
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                className="w-full bg-[#6d0f22] border border-white/20 px-4 py-3 rounded-xl text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
                className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-white placeholder-slate-300 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
              />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password (must match email local-part)"
                className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-white placeholder-slate-300 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
              />
              <input
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-white placeholder-slate-300 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
              />
              <button
                type="submit"
                className="w-full bg-[#D4AF37] hover:bg-[#ffe27c] text-[#7A0019] py-3 rounded-xl font-extrabold tracking-wider shadow-lg transform active:scale-95 transition"
              >
                REGISTER
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;