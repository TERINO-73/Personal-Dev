import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import DailyRecordService from '../services/dailyRecord.service';
import type { DailyRecord } from '../services/dailyRecord.service';
import HabitService from '../services/habit.service';
import type { Habit } from '../services/habit.service';
import '../styles/StatsPage.css';

export default function StatsPage() {
    const [history, setHistory] = useState<DailyRecord[]>([]);
    const [allHabits, setAllHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);

    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/personal/login');
            return;
        }
        loadData();
    }, [user?.username, navigate]);

    const loadData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [records, habitsData] = await Promise.all([
                DailyRecordService.getHistory(user.username),
                HabitService.getHabits(user.username)
            ]);
            setHistory(records);
            setAllHabits(habitsData);
        } catch (error) {
            console.error("Error loading stats data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getHabitNames = (completedIds: any): string[] => {
        const ids = Array.isArray(completedIds) ? completedIds : [];
        if (ids.length === 0) return [];
        return ids.map(id => {
            const habit = allHabits.find(h => String(h.id) === String(id));
            return habit ? habit.name : `Hábito (#${id})`;
        });
    };

    const formatDate = (dateString: string) => {
        try {
            const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('es-ES', options);
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return <div className="stats-page-container"><div className="loader">Cargando tu historial...</div></div>;
    }

    // Filtrar solo hábitos diarios para el cálculo de porcentaje histórico
    const dailyHabitsCount = allHabits.filter(h => h.type === 'daily').length;

    return (
        <div className="stats-page-container">
            <header className="stats-header">
                <Link to="/personal" className="back-link">
                    ← Volver al Dashboard
                </Link>
                <h1>Tu Historial y Estadísticas</h1>
                <p>Repasa tus logros diarios y tus pensamientos.</p>
            </header>

            <main className="timeline-container">
                {history.length === 0 ? (
                    <div className="empty-history">
                        <h2>Aún no hay registros</h2>
                        <p>Tus hábitos se guardarán automáticamente cada noche o cuando finalices el día.</p>
                    </div>
                ) : (
                    [...history].reverse().map((record, index) => {
                        const completedIds = record.completedHabitIds || [];
                        const completedNames = getHabitNames(completedIds);
                        const completionRatio = dailyHabitsCount > 0
                            ? Math.round((completedIds.length / dailyHabitsCount) * 100)
                            : 0;

                        return (
                            <div key={record.id || index} className="timeline-item">
                                <div className="timeline-date">
                                    <span className="date-badge">{formatDate(record.date)}</span>
                                </div>

                                <div className="timeline-content">
                                    <div className="stats-header-bar">
                                        <h3>Resumen del Día</h3>
                                        <div className="completion-pill">
                                            {completedIds.length} Hábitos Completados ({completionRatio}%)
                                        </div>
                                    </div>

                                    {completedNames.length > 0 && (
                                        <div className="completed-habits-tags">
                                            {completedNames.map((name, i) => (
                                                <span key={i} className="habit-tag">✓ {name}</span>
                                            ))}
                                        </div>
                                    )}

                                    {record.journalText && (
                                        <div className="journal-entry">
                                            <h4>Diario/Nota</h4>
                                            <p>"{record.journalText}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </main>
        </div>
    );

}
