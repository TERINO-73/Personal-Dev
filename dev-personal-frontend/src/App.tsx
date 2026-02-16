import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import MainPage from "./pages/MainPage";
import AuthService from "./services/auth.service";

function App() {
  const [user, setUser] = useState(AuthService.getCurrentUser());

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const auth = {
    isAuthenticated: () => !!user,
    isAdmin: () => user?.role === 'ADMIN',
    logout: () => {
      AuthService.logout();
      setUser(null);
      window.location.href = '/personal/login';
    }
  };

  const getBackground = (fondo: string) => {
    return fondo || ''; // Placeholder simple
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/personal" element={
          <MainPage
            auth={auth}
            user={user}
            rallies={[]}
            getBackground={getBackground}
          />
        } />
        <Route path="/personal/users" element={<UsersPage />} />
        <Route path="/personal/register" element={<RegisterPage />} />
        <Route path="/personal/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;