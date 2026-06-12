import { useMemo } from "react";

function Notifications({ notifications, onDismiss, onClearAll }) {
  const storedNotifications = useMemo(() => {
    return [...notifications].reverse();
  }, [notifications]);

  const clearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      localStorage.removeItem("appNotifications");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold text-blue-900">Notifications</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Review recent system notes and dismiss or clear notification history.
          </p>
        </div>
        <button
          onClick={clearAll}
          className="rounded-full bg-rose-500 px-5 py-3 text-white"
        >
          Clear All
        </button>
      </div>

      <div className="grid gap-6">
        {storedNotifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No notifications yet. Actions like student registration, card generation, and admin updates will appear here.
          </div>
        ) : (
          storedNotifications.map((notification) => (
            <div key={notification.id} className="rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{notification.title || "Notification"}</p>
                  <p className="text-sm text-slate-500">{notification.message}</p>
                </div>
                <button
                  onClick={() => onDismiss(notification.id)}
                  className="rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-slate-700"
                >
                  Dismiss
                </button>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Just now"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
