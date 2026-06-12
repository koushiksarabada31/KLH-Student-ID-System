import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import DashboardHeader from "./components/DashboardHeader";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Generator from "./pages/Generator";
import BatchGenerator from "./pages/BatchGenerator";
import History from "./pages/History";
import Admin from "./pages/Admin";
import NotificationsPage from "./pages/Notifications";
import Verify from "./pages/Verify";
import Notification from "./components/Notification";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [notifications, setNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem("appNotifications") || "[]");
  });

  const notify = (message, title) => {
    const id = Date.now();
    setNotifications((current) => {
      const next = [
        ...current,
        { id, message, title, createdAt: new Date().toISOString() },
      ];
      localStorage.setItem("appNotifications", JSON.stringify(next));
      return next;
    });
  };

  const dismissNotification = (id) => {
    setNotifications((current) => {
      const next = current.filter((item) => item.id !== id);
      localStorage.setItem("appNotifications", JSON.stringify(next));
      return next;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("appNotifications");
  };

  return (
    <BrowserRouter>
      <Navbar notifications={notifications} onDismiss={dismissNotification} />
      <DashboardHeader />

      <Routes>

        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generator"
          element={
            <ProtectedRoute>
              <Generator notify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/batch"
          element={
            <ProtectedRoute>
              <BatchGenerator notify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History notify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Admin notify={notify} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage notifications={notifications} onDismiss={dismissNotification} onClearAll={clearAllNotifications} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verify/:id"
          element={<Verify />}
        />

      </Routes>
      <Notification notifications={notifications} onDismiss={dismissNotification} />
    </BrowserRouter>
  );
}

export default App;