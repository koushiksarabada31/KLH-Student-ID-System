import { useEffect } from "react";

function Notification({ notifications, onDismiss }) {
  useEffect(() => {
    const timers = notifications.map((notification) =>
      setTimeout(() => onDismiss(notification.id), 4500)
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [notifications, onDismiss]);

  if (!notifications.length) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="max-w-sm rounded-2xl border border-slate-200 bg-slate-900/95 p-4 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{notification.title || "Notice"}</p>
              <p className="text-sm text-slate-200 mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => onDismiss(notification.id)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Notification;
