import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import ReminderService from '../services/reminder.service';
import type { Reminder } from '../services/reminder.service';
import RoutineService from '../services/routine.service';
import type { RoutineAssignment } from '../services/routine.service';
import '../styles/RemindersPage.css';

export default function RemindersPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [assignments, setAssignments] = useState<RoutineAssignment[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    // Form state
    const [text, setText] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#6366f1');
    const [startTime, setStartTime] = useState('09:00');
    const [isAllDay, setIsAllDay] = useState(false);

    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/personal/login');
            return;
        }
        loadReminders();
    }, [user?.username, navigate]);

    const loadReminders = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await ReminderService.getReminders(user.username);
            setReminders(data);
        } catch (error) {
            console.error("Error loading reminders:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAssignments = async (date: Date) => {
        if (!user) return;
        try {
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const data = await RoutineService.getAssignments(dateStr);
            setAssignments(data);
        } catch (error) {
            console.error("Error loading assignments:", error);
        }
    };

    // Load assignments when selectedDate changes
    useEffect(() => {
        if (user) {
            loadAssignments(selectedDate);
        }
    }, [selectedDate, user]);

    const handleAddReminder = async () => {
        if (!user || !text) return;
        try {
            const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
            const startDateTime = `${dateStr}T${startTime.length === 5 ? startTime + ':00' : startTime}`;

            await ReminderService.addReminder(user.username, {
                text,
                description,
                color,
                startTime: startDateTime,
                allDay: isAllDay
            });

            setText('');
            setDescription('');
            loadReminders();
        } catch (error) {
            console.error("Error adding reminder:", error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await ReminderService.deleteReminder(id);
            setReminders(reminders.filter(r => r.id !== id));
        } catch (error) {
            console.error("Error deleting reminder:", error);
        }
    };

    // Calendar logic
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const startDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

    const days = [];
    const daysCount = getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth());

    for (let i = 0; i < startDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysCount; i++) days.push(i);

    const isToday = (day: number | null) => {
        if (!day) return false;
        const today = new Date();
        return today.getDate() === day &&
            today.getMonth() === selectedDate.getMonth() &&
            today.getFullYear() === selectedDate.getFullYear();
    };

    const getRemindersForDay = (day: number | null) => {
        if (!day) return [];
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return reminders.filter(r => r.startTime.startsWith(dateStr));
    };

    if (loading) {
        return <div className="reminders-page"><div className="loader">Cargando...</div></div>;
    }

    return (
        <div className="reminders-page">
            <header className="stats-header">
                <Link to="/personal" className="back-link">← Volver</Link>
                <h1>Recordatorios</h1>
            </header>

            <div className="calendar-card">
                <div className="calendar-header">
                    <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}>&lt;</button>
                    <h2>{selectedDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
                    <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}>&gt;</button>
                </div>

                <div className="calendar-grid">
                    {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(d => <div key={d} className="calendar-day-label">{d}</div>)}
                    {days.map((day, i) => (
                        <div
                            key={i}
                            className={`calendar-day ${day ? 'active' : ''} ${isToday(day) ? 'today' : ''} ${day === selectedDate.getDate() ? 'selected-day' : ''}`}
                            onClick={() => {
                                if (day) {
                                    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
                                }
                            }}
                        >
                            <span className="day-number">{day}</span>
                            <div className="day-dots">
                                {getRemindersForDay(day).map(r => (
                                    <div key={r.id} className="reminder-dot" style={{ backgroundColor: r.color }}></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="reminders-content-wrapper">
                <div className="reminders-list-section">
                    <h3>Eventos para el {selectedDate.toLocaleDateString()}</h3>
                    
                    {assignments.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ color: '#1dd1a1', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px', marginBottom: '10px' }}>Entrenamientos Asignados</h4>
                            {assignments.map(a => (
                                <div key={`assign-${a.id}`} className="reminder-item-card" style={{ borderLeftColor: '#1dd1a1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{a.routine?.name}</strong>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#adb5bd' }}>Rutina de Gimnasio</p>
                                    </div>
                                    <button 
                                        className="primary-btn small-btn" 
                                        onClick={() => navigate(`/personal/routines/${a.routineId}/perform`)}
                                        style={{ background: '#1dd1a1', padding: '5px 10px', fontSize: '0.8rem' }}>
                                        Comenzar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <h4 style={{ color: '#6366f1', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px', marginBottom: '10px' }}>Recordatorios Generales</h4>
                    <div className="reminders-list-container">
                        {getRemindersForDay(selectedDate.getDate()).length === 0 ? (
                            <p className="empty-message">No tienes recordatorios para este día.</p>
                        ) : (
                            getRemindersForDay(selectedDate.getDate()).map(r => (
                                <div key={r.id} className="reminder-item-card" style={{ borderLeftColor: r.color }}>
                                    <div className="reminder-info">
                                        <strong>{r.text}</strong>
                                        {r.description && <p className="reminder-desc">{r.description}</p>}
                                        <span className="reminder-time">{r.allDay ? 'Todo el día' : r.startTime.split('T')[1].substring(0, 5)}</span>
                                    </div>
                                    <button className="delete-btn" onClick={() => handleDelete(r.id)} title="Eliminar recordatorio">×</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="add-reminder-form-section">
                    <h3>Crear nuevo recordatorio</h3>
                    <div className="form-group">
                        <label>Título</label>
                        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Ej: Cita en el médico" />
                    </div>
                    
                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalles de la cita..."></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Color</label>
                            <input className="color-picker-input" type="color" value={color} onChange={e => setColor(e.target.value)} />
                        </div>
                        <div className="form-group half-width">
                            <label>Hora</label>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} disabled={isAllDay} />
                        </div>
                    </div>

                    <label className="checkbox-label">
                        <input type="checkbox" checked={isAllDay} onChange={e => setIsAllDay(e.target.checked)} /> Todo el día
                    </label>

                    <button className="btn-confirm full-width-btn" onClick={handleAddReminder} disabled={!text}>
                        Añadir Recordatorio
                    </button>
                </div>
            </div>
        </div>
    );
}
