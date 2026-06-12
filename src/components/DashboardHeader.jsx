import { getCurrentUser } from "../utils/auth";

export default function DashboardHeader() {
  const user = getCurrentUser();
  if (!user) return null;

  return (
    <div className="sticky top-0 z-40 w-full bg-white border-b border-[#D4AF37] shadow-md py-4 px-8 flex flex-col md:flex-row items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7A0019]/15 text-[#7A0019] border border-[#7A0019]/20 shadow-inner font-extrabold text-sm">
          KLH
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-xl font-extrabold tracking-wider text-[#7A0019] leading-tight">
            KL UNIVERSITY HYDERABAD
          </h2>
          <p className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase mt-0.5">
            Student Digital Identity Management System
          </p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-3 bg-[#7A0019]/5 px-4 py-1.5 rounded-full border border-[#7A0019]/10">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-xs font-bold text-[#7A0019] uppercase tracking-wider">
          Official Academic Portal
        </span>
      </div>
    </div>
  );
}
