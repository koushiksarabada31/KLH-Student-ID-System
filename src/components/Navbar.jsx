import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../utils/auth";

function Navbar({ notifications = [], onDismiss }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  const dismissAll = () => {
    notifications.forEach((notification) => onDismiss(notification.id));
  };

  return (
    <nav className="relative bg-[#7A0019] text-white px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b-2 border-[#D4AF37] shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <svg className="h-7 w-7 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          <span className="text-xl font-bold tracking-wider text-white">KL UNIVERSITY HYDERABAD</span>
        </div>
        <div className="hidden md:flex items-center gap-5 text-sm font-semibold tracking-wide ml-4 text-slate-100">
          {user && (
            <>
              <Link to="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
              <Link to="/generator" className="hover:text-[#D4AF37] transition-colors">Generate ID</Link>
              <Link to="/batch" className="hover:text-[#D4AF37] transition-colors">Batch Generate</Link>
              <Link to="/history" className="hover:text-[#D4AF37] transition-colors">History</Link>
              <Link to="/notifications" className="hover:text-[#D4AF37] transition-colors">Notifications</Link>
              {user.username === "admin" && <Link to="/admin" className="hover:text-[#D4AF37] transition-colors">Admin Dashboard</Link>}
            </>
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="relative rounded-full border border-white/20 bg-white/10 p-3 text-white hover:bg-white/20 hover:border-[#D4AF37]/50 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 2C9.794 2 8 3.794 8 6v1.1c0 .55-.45 1-1 1H6c-.552 0-1 .448-1 1v1.7c0 .628-.146 1.23-.415 1.776L3.08 14.06c-.17.342-.08.747.227 1.004.305.256.74.281 1.07.066L5 15.273V16c0 1.654 1.346 3 3 3h8c1.654 0 3-1.346 3-3v-.727l.624.797c.33.215.765.19 1.07-.066.307-.257.397-.662.227-1.004l-1.504-2.484A4.009 4.009 0 0 1 20 10.8V9.1c0-.552-.448-1-1-1h-1c-.55 0-1-.45-1-1V6c0-2.206-1.794-4-4-4Zm0 20c1.103 0 2-.897 2-2H10c0 1.103.897 2 2 2Z" />
          </svg>
          {notifications.length > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-[#7A0019] border border-[#7A0019]">
              {notifications.length}
            </span>
          )}
        </button>

        {!user ? (
          <Link
            to="/login"
            className="rounded-full bg-[#D4AF37] px-5 py-2 text-sm font-bold text-[#7A0019] shadow hover:bg-[#ffe066] transition"
          >
            Login
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{user.fullName || user.username}</span>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition"
            >
              Logout
            </button>
          </div>
        )}

        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="font-semibold">Notifications</span>
              <button
                type="button"
                onClick={dismissAll}
                className="text-sm text-slate-500 hover:text-slate-900"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">No notifications yet.</div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="border-b border-slate-200 px-4 py-3 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{notification.title}</p>
                        <p className="text-sm text-slate-600">{notification.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDismiss(notification.id)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
