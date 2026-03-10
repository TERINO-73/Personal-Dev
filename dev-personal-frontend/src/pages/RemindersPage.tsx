import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import ReminderService from '../services/reminder.service';
import type { Reminder } from '../services/reminder.service';
import '../styles/RemindersPage.css';

export default function RemindersPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [text, setText] = useState('');
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

    const handleAddReminder = async () => {
        if (!user || !text) return;
        try {
            const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
            const startDateTime = `${dateStr}T${startTime.length === 5 ? startTime + ':00' : startTime}`;

            await ReminderService.addReminder(user.username, {
                text,
                color,
                startTime: startDateTime,
                allDay: isAllDay
            });

            setShowModal(false);
            setText('');
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
                            className={`calendar-day ${day ? 'active' : ''} ${isToday(day) ? 'today' : ''}`}
                            onClick={() => {
                                if (day) {
                                    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
                                    setShowModal(true);
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

            <div className="reminders-list">
                <h3>Eventos para el {selectedDate.toLocaleDateString()}</h3>
                {getRemindersForDay(selectedDate.getDate()).length === 0 ? (
                    <p>No hay eventos este día.</p>
                ) : (
                    getRemindersForDay(selectedDate.getDate()).map(r => (
                        <div key={r.id} className="reminder-item-card" style={{ borderLeftColor: r.color }}>
                            <div className="reminder-info">
                                <strong>{r.text}</strong>
                                <span>{r.allDay ? 'Todo el día' : r.startTime.split('T')[1].substring(0, 5)}</span>
                            </div>
                            <button className="delete-btn" onClick={() => handleDelete(r.id)}>×</button>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Nuevo Recordatorio</h2>
                        <label>Tarea</label>
                        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Ej: Peluquería" />

                        <div className="form-row">
                            <div>
                                <label>Color</label>
                                <input type="color" value={color} onChange={e => setColor(e.target.value)} />
                            </div>
                            <div>
                                <label>Hora</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} disabled={isAllDay} />
                            </div>
                        </div>

                        <label className="checkbox-label">
                            <input type="checkbox" checked={isAllDay} onChange={e => setIsAllDay(e.target.checked)} /> Todo el día
                        </label>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn-confirm" onClick={handleAddReminder}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
