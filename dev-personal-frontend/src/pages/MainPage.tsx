import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import HabitService from "../services/habit.service";
import type { Habit } from "../services/habit.service";
import DailyRecordService from "../services/dailyRecord.service";
import ReminderService from "../services/reminder.service";
import type { Reminder } from "../services/reminder.service";
import ObjectiveService from "../services/objective.service";
import type { Objective } from "../services/objective.service";
import NutritionService from "../services/nutrition.service";
import type { DayNutritionResponse } from "../services/nutrition.service";
import GymStatsService from "../services/gymStats.service";
import type { DailyWorkoutSnapshot } from "../services/gymStats.service";
import "../styles/Main.css";

// Formatear fecha local YYYY-MM-DD
const getLocalDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface User {
  name: string;
  username: string;
}

interface Props {
  auth: {
    isAuthenticated: () => boolean;
    isAdmin: () => boolean;
    logout: () => void;
  };
  user?: User | null;
  rallies: any[];
  getBackground: (fondo: string) => string;
}

export default function Home({
  auth,
  user,
}: Props) {

  const [habits, setHabits] = useState<Habit[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [nutrition, setNutrition] = useState<DayNutritionResponse | null>(null);
  const [gymStat, setGymStat] = useState<DailyWorkoutSnapshot | null>(null);
  const [journalText, setJournalText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.username) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.username) return;
    try {
      setLoading(true);
      const todayStr = getLocalDateString();
      const [userHabits, allReminders, todayRecord, userObjectives, todayNutrition, todayGym] = await Promise.all([
        HabitService.getHabits(user.username),
        ReminderService.getReminders(user.username),
        DailyRecordService.getTodayRecord(user.username),
        ObjectiveService.getObjectives(user.username),
        NutritionService.getDayInfo(user.username, todayStr).catch(() => null),
        GymStatsService.getDailySnapshot(todayStr).catch(() => null)
      ]);

      setHabits(userHabits);
      setObjectives(userObjectives);
      if (todayNutrition) setNutrition(todayNutrition);
      if (todayGym) setGymStat(todayGym);

      setReminders(allReminders.filter(r => r.startTime.startsWith(todayStr)));

      if (todayRecord && todayRecord.journalText) {
        setJournalText(todayRecord.journalText);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (id: string) => {
    try {
      const updatedHabit = await HabitService.toggleHabit(id);
      setHabits(habits.map(h => h.id === id ? updatedHabit : h));
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  const decrementHabit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updatedHabit = await HabitService.decrementHabit(id);
      setHabits(habits.map(h => h.id === id ? updatedHabit : h));
    } catch (error) {
      console.error("Error decrementing habit:", error);
    }
  };

  const finalizeDay = async () => {
    if (!user?.username) return;
    try {
      setLoading(true);
      const completedIds = habits.filter(h => h.completed).map(h => Number(h.id));

      await DailyRecordService.finalizeDay(user.username, {
        date: getLocalDateString(),
        journalText: journalText,
        completedHabitIds: completedIds
      });

      alert("¡Día guardado con éxito!");
      await loadDashboardData();
    } catch (error) {
      console.error("Error finalizing day:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <header className="header">
        <div className="logo">
          <Link to="/">PERSONAL DEV</Link>
        </div>

        <nav className="main-nav">
          {!auth.isAuthenticated() ? (
            <Link to="/personal/login">Login</Link>
          ) : (
            <>
              {auth.isAdmin() && (
                <div className="dropdown" tabIndex={0}>
                  <button className="dropbtn">Admin</button>
                  <ul className="dropdown-menu">
                    <li><Link to="/personal/admin/users">Gestionar Usuarios</Link></li>
                    <li><button onClick={auth.logout}>Cerrar Sesión</button></li>
                  </ul>
                </div>
              )}

              <div className="dropdown" tabIndex={0}>
                <button className="dropbtn">{user?.name || 'Perfil'}</button>
                <ul className="dropdown-menu">
                  <li><Link to="/personal/habits">Mis Hábitos</Link></li>
                  <li><Link to="/personal/routines">Rutinas y Ejercicio</Link></li>
                  <li><Link to="/personal/stats">Estadísticas</Link></li>
                  <li><Link to="/personal/reminders">Calendario / Recordatorios</Link></li>
                  <li><Link to="/personal/objectives">Objetivos</Link></li>
                  <li><button onClick={auth.logout}>Cerrar Sesión</button></li>
                </ul>
              </div>
            </>
          )}
        </nav>
      </header>

      <main className="home-container">
        <section className="dashboard-grid">
          <div className="dashboard-card Ejercicio">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ borderBottom: 'none', margin: 0, padding: 0 }}>Entrenamiento</h3>
              <Link to="/personal/routines" className="generic-link" style={{ marginTop: 0 }}>Entrar →</Link>
            </div>
            <div style={{ width: '100%', height: '2px', background: 'rgba(29, 209, 161, 0.3)', marginBottom: '0.5rem' }}></div>
            
            {gymStat ? (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#1dd1a1' }}>
                        <span>Ejercicios: {gymStat.totalExercises || 0}</span>
                        <span>Volumen: {gymStat.totalVolumeKg || 0} kg</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>Has completado {gymStat.totalSets} series con un total de {gymStat.totalReps} repeticiones el día de hoy. ¡Buen trabajo!</p>
                    </div>
                </div>
            ) : (
                <p className="placeholder-text" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                    "Aún no has entrenado hoy."
                </p>
            )}

            <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
               <Link to="/personal/routines" className="primary-btn small-btn" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(45deg, #1dd1a1, #10ac84)', color: 'white', padding: '8px' }}>Mis Rutinas</Link>
               <Link to="/personal/exercise-library" className="secondary-btn small-btn" style={{ flex: 1, textAlign: 'center', padding: '8px' }}>Biblioteca</Link>
            </div>
          </div>

          <div className="dashboard-card Recordatorios">
            <h3>Recordatorios de Hoy</h3>
            <div className="reminders-mini-list">
              {reminders.length === 0 ? (
                <p className="no-data">No tienes tareas para hoy.</p>
              ) : (
                reminders.map(r => (
                  <div key={r.id} className="reminder-mini-item" style={{ borderLeftColor: r.color }}>
                    <span>{r.text}</span>
                    <small>{r.allDay ? 'Todo el día' : r.startTime.split('T')[1].substring(0, 5)}</small>
                  </div>
                ))
              )}
            </div>
            <Link to="/personal/reminders" className="generic-link">Ver Calendario</Link>
          </div>

          <div className="dashboard-card Habitos">
            <h3>Hábitos de Hoy</h3>
            <div className="dashboard-habits-list">
              {habits.length === 0 && !loading && (
                <p className="no-habits-text">No tienes hábitos. <Link to="/personal/habits">Añade algunos</Link>.</p>
              )}
              {habits.map(habit => (
                <div
                  key={habit.id}
                  className={`dashboard-habit-item ${habit.completed ? 'completed' : ''}`}
                  onClick={() => toggleHabit(habit.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="habit-check">
                      {habit.completed ? '✓' : habit.currentCount > 0 ? habit.currentCount : ''}
                    </div>
                    <div className="habit-info">
                      <span className="habit-name">{habit.name}</span>
                      {habit.type !== 'daily' && (
                        <small className="habit-progress">
                          ({habit.currentCount}/{habit.targetCount}) {habit.type === 'weekly' ? 'Semanal' : 'Mensual'}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="habit-actions" style={{ display: 'flex', gap: '5px' }}>
                     <button
                        className="complete-btn"
                        onClick={(e) => decrementHabit(habit.id, e)}
                        disabled={habit.type === 'daily' ? !habit.completed : (habit.currentCount === 0)}
                        style={{ 
                          opacity: (habit.type === 'daily' ? !habit.completed : (habit.currentCount === 0)) ? 0.3 : 1, 
                          width: '24px', 
                          height: '24px', 
                          padding: 0, 
                          fontSize: '1rem',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'var(--text-color, white)',
                          cursor: (habit.type === 'daily' ? !habit.completed : (habit.currentCount === 0)) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Restar progreso"
                      >
                       -
                     </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="dashboard-journal-box">
              <h3>Diario</h3>
              <textarea
                className="journal-textarea"
                placeholder="¿Cómo va el día?"
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
              />
            </div>

            <button className="finalize-day-btn" onClick={finalizeDay} disabled={loading}>
              {loading ? 'Guardando...' : 'GUARDAR PROGRESO'}
            </button>
            <p className="auto-save-info">Tu día se cerrará automáticamente a las 00:00</p>
          </div>

          <div className="dashboard-card Comidas">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ borderBottom: 'none', margin: 0, padding: 0 }}>Nutrición</h3>
              <Link to="/personal/nutrition" className="generic-link" style={{ marginTop: 0 }}>Entrar →</Link>
            </div>
            <div style={{ width: '100%', height: '2px', background: 'rgba(255, 107, 107, 0.3)', marginBottom: '0.5rem' }}></div>
            
            {nutrition ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Calorías</span>
                    <span>{Math.round(nutrition.totalCalories)} / {Math.round(nutrition.targetCalories)}</span>
                  </div>
                  <progress 
                    value={nutrition.totalCalories} 
                    max={nutrition.targetCalories || 1} 
                    style={{ width: '100%', height: '6px', borderRadius: '4px', accentColor: '#ff6b6b' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4facfe' }}>
                    <span>Proteína</span>
                    <span>{Math.round(nutrition.totalProtein)}g / {Math.round(nutrition.targetProtein)}g</span>
                  </div>
                  <progress 
                    value={nutrition.totalProtein} 
                    max={nutrition.targetProtein || 1} 
                    style={{ width: '100%', height: '4px', borderRadius: '4px', accentColor: '#4facfe' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ffd93d' }}>
                    <span>Carbohidratos</span>
                    <span>{Math.round(nutrition.totalCarbs)}g / {Math.round(nutrition.targetCarbs)}g</span>
                  </div>
                  <progress 
                    value={nutrition.totalCarbs} 
                    max={nutrition.targetCarbs || 1} 
                    style={{ width: '100%', height: '4px', borderRadius: '4px', accentColor: '#ffd93d' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ff9f43' }}>
                    <span>Grasas</span>
                    <span>{Math.round(nutrition.totalFat)}g / {Math.round(nutrition.targetFat)}g</span>
                  </div>
                  <progress 
                    value={nutrition.totalFat} 
                    max={nutrition.targetFat || 1} 
                    style={{ width: '100%', height: '4px', borderRadius: '4px', accentColor: '#ff9f43' }}
                  />
                </div>
                
                {nutrition.entries && nutrition.entries.length > 0 && (
                  <div style={{ marginTop: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
                    <p style={{ fontSize: '0.75rem', color: '#adb5bd', marginBottom: '0.3rem' }}>Alimentos de hoy:</p>
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {nutrition.entries.slice(0, 3).map((e, i) => (
                        <li key={i} style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{e.food?.name}</span>
                          <span style={{ color: '#ff6b6b' }}>{Math.round(e.calories)}kc</span>
                        </li>
                      ))}
                      {nutrition.entries.length > 3 && (
                         <li style={{ fontSize: '0.7rem', color: '#adb5bd', textAlign: 'center' }}>+ {nutrition.entries.length - 3} más...</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="placeholder-text" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                "Mide tus macros y alcanza tus objetivos."
              </p>
            )}
          </div>

          <div className="dashboard-card Objetivos">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ borderBottom: 'none', margin: 0, padding: 0 }}>La Forja</h3>
              <Link to="/personal/objectives" className="generic-link" style={{ marginTop: 0 }}>Entrar →</Link>
            </div>
            <div style={{ width: '100%', height: '2px', background: 'rgba(192, 132, 252, 0.3)', marginBottom: '0.5rem' }}></div>

            {objectives.length === 0 ? (
              <p className="placeholder-text" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                "Tus sueños, ahora con un plan."
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {objectives.slice(0, 4).map(o => (
                  <div key={o.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ color: '#8f94fb', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>{o.type}</span>
                      <span style={{ fontSize: '0.7rem', color: o.status === 'COMPLETED' ? '#1dd1a1' : (o.status === 'IN_PROGRESS' ? '#54a0ff' : '#ff9f43') }}>
                        {o.status === 'COMPLETED' ? 'Terminado' : (o.status === 'IN_PROGRESS' ? 'En curso' : 'Pendiente')}
                      </span>
                    </div>
                    <strong style={{ marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.title}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

