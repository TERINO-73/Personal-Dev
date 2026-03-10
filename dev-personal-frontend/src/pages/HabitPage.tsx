import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HabitService from '../services/habit.service';
import type { Habit } from '../services/habit.service';
import AuthService from '../services/auth.service';
import '../styles/HabitPage.css';

const USUAL_HABITS = [
    { name: 'Beber 2L de agua', type: 'daily', icon: '💧' },
    { name: 'Meditar', type: 'daily', icon: '🧘' },
    { name: 'Hacer ejercicio', type: 'weekly', targetCount: 3, icon: '🏋️' },
    { name: 'Leer 30 min', type: 'daily', icon: '📚' },
    { name: 'Dormir 8h', type: 'daily', icon: '😴' },
    { name: 'Limpiar la casa', type: 'weekly', targetCount: 1, icon: '🧹' },
];

export default function HabitPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [newTargetCount, setNewTargetCount] = useState(1);
    const [loading, setLoading] = useState(true);

    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/personal/login');
            return;
        }
        loadHabits();
    }, []);

    const loadHabits = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await HabitService.getHabits(user.username);
            setHabits(data);
        } catch (error) {
            console.error("Error loading habits:", error);
        } finally {
            setLoading(false);
        }
    };

    const addHabit = async (name: string, type: string = 'daily', targetCount: number = 1) => {
        if (!name.trim() || !user) return;
        try {
            const newHabit = await HabitService.addHabit(user.username, {
                name,
                type,
                targetCount,
            });
            setHabits([...habits, newHabit]);
            setNewName('');
        } catch (error) {
            console.error("Error adding habit:", error);
        }
    };

    const toggleComplete = async (id: string) => {
        try {
            const updatedHabit = await HabitService.toggleHabit(id);
            setHabits(habits.map(h => h.id === id ? updatedHabit : h));
        } catch (error) {
            console.error("Error toggling habit:", error);
        }
    };

    const deleteHabit = async (id: string) => {
        try {
            await HabitService.deleteHabit(id);
            setHabits(habits.filter(h => h.id !== id));
        } catch (error) {
            console.error("Error deleting habit:", error);
        }
    };

    const completionPercentage = habits.length > 0
        ? Math.round((habits.filter(h => h.completed).length / habits.length) * 100)
        : 0;

    if (loading) {
        return <div className="habit-page-container">Cargando tus hábitos...</div>;
    }

    return (
        <div className="habit-page-container">
            <main className="habit-main-content">
                <header className="habit-header">
                    <Link to="/personal" style={{ color: '#8f94fb', textDecoration: 'none', display: 'block', marginBottom: '1rem' }}>
                        ← Volver al Dashboard
                    </Link>
                    <h1>Mis Hábitos</h1>
                    <p>Construye tu mejor versión, un paso a la vez.</p>
                </header>

                {habits.length === 0 ? (
                    <div className="empty-state">
                        <h2>Parece que no tienes hábitos aún...</h2>
                        <p>Elige uno de los más comunes para empezar:</p>
                        <div className="usual-habits-grid">
                            {USUAL_HABITS.map(uh => (
                                <div
                                    key={uh.name}
                                    className="usual-habit-card"
                                    onClick={() => addHabit(uh.name, uh.type, uh.targetCount)}
                                >
                                    <span style={{ fontSize: '2rem' }}>{uh.icon}</span>
                                    <h3>{uh.name}</h3>
                                    <p>{uh.type === 'weekly' ? `${uh.targetCount} vez/sem` : 'Diario'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="habit-list-section">
                        <div className="habit-grid">
                            {habits.map(habit => (
                                <div key={habit.id} className={`habit-card ${habit.completed ? 'completed' : ''}`}>
                                    <div className="habit-info">
                                        <h3>{habit.name}</h3>
                                        <p>
                                            {habit.type === 'daily' && 'Diario'}
                                            {habit.type === 'weekly' && `Semanal (${habit.targetCount} veces)`}
                                            {habit.type === 'monthly' && `Mensual (${habit.targetCount} veces)`}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        {habit.type !== 'daily' && (
                                            <span style={{ fontSize: '0.8rem', opacity: 0.7, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                {habit.currentCount} / {habit.targetCount}
                                            </span>
                                        )}
                                        <button
                                            className={`complete-btn ${habit.completed ? 'active' : ''}`}
                                            onClick={() => toggleComplete(habit.id)}
                                        >
                                            {habit.completed ? '✓' : habit.type !== 'daily' ? '+' : ''}
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => deleteHabit(habit.id)}
                                            style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1.2rem' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <section className="add-habit-section">
                    <h2>Añadir Nuevo Hábito</h2>
                    <div className="add-habit-form">
                        <div className="form-group">
                            <label>Nombre del hábito</label>
                            <input
                                type="text"
                                placeholder="Ej. Leer, Gym..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Frecuencia</label>
                            <select
                                value={newType}
                                onChange={(e) => setNewType(e.target.value as any)}
                            >
                                <option value="daily">Diario</option>
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensual</option>
                            </select>
                        </div>
                        {newType !== 'daily' && (
                            <div className="form-group" style={{ minWidth: '100px', flex: '0' }}>
                                <label>Veces</label>
                                <select
                                    value={newTargetCount}
                                    onChange={(e) => setNewTargetCount(parseInt(e.target.value))}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 10, 15, 20, 30].map(v => (
                                        <option key={v} value={v}>{v} {v === 1 ? 'vez' : 'veces'}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button className="submit-btn" onClick={() => addHabit(newName, newType, newTargetCount)}>
                            Añadir
                        </button>
                    </div>
                </section>
            </main>

            <aside className="habit-sidebar">
                <div className="progress-section">
                    <h3>Progreso Diario</h3>
                    <div className="progress-bar-vertical">
                        <div
                            className="progress-fill"
                            style={{ height: `${completionPercentage}%` }}
                        ></div>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem' }}>
                        {completionPercentage}%
                    </p>
                    <p style={{ opacity: 0.6 }}>{habits.filter(h => h.completed).length} de {habits.length} completados</p>
                </div>

                <div className="sidebar-stats" style={{ marginTop: '2rem' }}>
                    <h4>Tip</h4>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8, fontStyle: 'italic' }}>
                        "La constancia es la llave del éxito. No rompas la cadena."
                    </p>
                </div>
            </aside>
        </div>
    );
}
