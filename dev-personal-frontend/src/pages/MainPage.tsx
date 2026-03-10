import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import HabitService from "../services/habit.service";
import type { Habit } from "../services/habit.service";
import DailyRecordService from "../services/dailyRecord.service";
import ReminderService from "../services/reminder.service";
import type { Reminder } from "../services/reminder.service";
import ObjectiveService from "../services/objective.service";
import type { Objective } from "../services/objective.service";
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
      const [userHabits, allReminders, todayRecord, userObjectives] = await Promise.all([
        HabitService.getHabits(user.username),
        ReminderService.getReminders(user.username),
        DailyRecordService.getTodayRecord(user.username),
        ObjectiveService.getObjectives(user.username)
      ]);

      setHabits(userHabits);
      setObjectives(userObjectives);

      const todayStr = getLocalDateString();
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
            <h3>Entrenamiento</h3>
            <p className="placeholder-text">Próximamente: Tus rutinas y ejercicios de hoy.</p>
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
                >
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
            <h3>Nutrición</h3>
            <p className="placeholder-text">Próximamente: Registro de comidas y calorías.</p>
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

