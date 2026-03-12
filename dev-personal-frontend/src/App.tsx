import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import MainPage from "./pages/MainPage";
import HabitPage from "./pages/HabitPage";
import StatsPage from "./pages/StatsPage";
import RemindersPage from "./pages/RemindersPage";
import ObjectivesPage from "./pages/ObjectivesPage";
import AuthService from "./services/auth.service";
import NutritionDashboard from "./pages/NutritionDashboard";
import AddFoodPage from "./pages/AddFoodPage";
import CreateFoodPage from "./pages/CreateFoodPage";
import BarcodeFoodPage from "./pages/BarcodeFoodPage";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";
import RoutinesPage from "./pages/RoutinesPage";
import CreateRoutinePage from "./pages/CreateRoutinePage";
import PerformRoutinePage from "./pages/PerformRoutinePage";

function App() {
  const [user, setUser] = useState(AuthService.getCurrentUser());

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const auth = {
    isAuthenticated: () => !!user,
    isAdmin: () => user?.role === 'ADMIN',
    logout: logout
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
        <Route path="/personal/register" element={<RegisterPage onRegister={(userData) => setUser(userData)} />} />
        <Route path="/personal/login" element={<LoginPage onLogin={(userData) => setUser(userData)} />} />
        <Route path="/personal/habits" element={<HabitPage />} />
        <Route path="/personal/stats" element={<StatsPage />} />
        <Route path="/personal/reminders" element={<RemindersPage />} />
        <Route path="/personal/objectives" element={<ObjectivesPage />} />
        <Route path="/personal/nutrition" element={<NutritionDashboard />} />
        <Route path="/personal/nutrition/add-food" element={<AddFoodPage />} />
        <Route path="/personal/nutrition/create-food" element={<CreateFoodPage />} />
        <Route path="/personal/nutrition/barcode" element={<BarcodeFoodPage />} />
        <Route path="/personal/exercise-library" element={<ExerciseLibraryPage />} />
        <Route path="/personal/routines" element={<RoutinesPage />} />
        <Route path="/personal/routines/create" element={<CreateRoutinePage />} />
        <Route path="/personal/routines/:id/perform" element={<PerformRoutinePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;