import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import callApi from "./common/scripts.tsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Chat from "./components/Chat.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const data = await callApi("/user/checkAuth", "GET");

      console.log("checkAuth response:", data);

      if (data?.success) {
        setUser(data?.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);



  if (authLoading) {
    return <div>Checking authentication...</div>;
  }

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>

        <Route
          path="/"
          element={<Login user={user} setUser={setUser} />}
        />

        <Route
          path="/login"
          element={<Login user={user} setUser={setUser} />}
        />

        <Route
          path="/signup"
          element={<Signup user={user} setUser={setUser} />}
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute user={user}>
              <Chat user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;