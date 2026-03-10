import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ObjectiveService from '../services/objective.service';
import type { Objective, Subtask, Book, SubtaskStatus } from '../services/objective.service';
import AuthService from '../services/auth.service';
import '../styles/ObjectivesPage.css';

export default function ObjectivesPage() {
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'GENERAL' | 'READING' | 'LIST' | 'FINANCIAL' | 'SKILL'>('GENERAL');
    const [status, setStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING');
    const [deadline, setDeadline] = useState('');

    // Subtasks form
    const [newSubtask, setNewSubtask] = useState('');
    const [tempSubtasks, setTempSubtasks] = useState<Subtask[]>([]);

    // Books form
    const [bookTitle, setBookTitle] = useState('');
    const [bookDesc, setBookDesc] = useState('');
    const [bookPages, setBookPages] = useState(0);
    const [tempBooks, setTempBooks] = useState<Partial<Book>[]>([]);

    const user = AuthService.getCurrentUser();

    useEffect(() => {
        if (user) loadObjectives();
    }, []);

    const loadObjectives = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await ObjectiveService.getObjectives(user.username);
            setObjectives(data);
        } catch (error) {
            console.error("Error loading objectives:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            setTempSubtasks([...tempSubtasks, { title: newSubtask, status: 'PENDING' }]);
            setNewSubtask('');
        }
    };

    const handleAddBook = () => {
        if (bookTitle.trim()) {
            setTempBooks([...tempBooks, {
                title: bookTitle,
                description: bookDesc,
                totalPages: bookPages,
                currentPage: 0,
                completed: false
            }]);
            setBookTitle('');
            setBookDesc('');
            setBookPages(0);
        }
    };

    const openEditModal = (obj: Objective) => {
        setEditingId(obj.id || null);
        setTitle(obj.title);
        setDescription(obj.description);
        setType(obj.type);
        setStatus(obj.status || 'PENDING');
        setDeadline(obj.deadline || '');
        setTempSubtasks(obj.subtasks || []);
        setTempBooks(obj.books || []);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!title.trim() || !user) return;

        try {
            const objective: Partial<Objective> = {
                title,
                description,
                type,
                status: editingId ? status : 'PENDING',
                deadline: deadline || undefined,
                subtasks: type === 'LIST' ? tempSubtasks : undefined,
                books: type === 'READING' ? tempBooks as Book[] : undefined
            };

            if (editingId) {
                const updated = await ObjectiveService.updateObjective(editingId, objective);
                setObjectives(objectives.map(o => o.id === editingId ? updated : o));
            } else {
                const saved = await ObjectiveService.addObjective(user.username, objective);
                setObjectives([...objectives, saved]);
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving objective:", error);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setType('GENERAL');
        setStatus('PENDING');
        setDeadline('');
        setTempSubtasks([]);
        setTempBooks([]);
        setEditingId(null);
    };

    const deleteObjective = async (id: number) => {
        if (!window.confirm("¿Seguro que quieres forjar el destino y borrar esta meta?")) return;
        try {
            await ObjectiveService.deleteObjective(id);
            setObjectives(objectives.filter(obj => obj.id !== id));
        } catch (error) {
            console.error("Error deleting objective:", error);
        }
    };

    const cycleSubtaskStatus = async (subId: number, currentStatus: SubtaskStatus) => {
        const statusFlow: SubtaskStatus[] = ['PENDING', 'DOING', 'DONE'];
        const nextIndex = (statusFlow.indexOf(currentStatus) + 1) % 3;
        const nextStatus = statusFlow[nextIndex];

        try {
            const updatedObjective = await ObjectiveService.updateSubtaskStatus(subId, nextStatus);
            setObjectives(objectives.map(obj => obj.id === updatedObjective.id ? updatedObjective : obj));
        } catch (error) {
            console.error("Error updating subtask:", error);
        }
    };

    const updateBookPage = async (bookId: number, newPage: number) => {
        try {
            const updatedObjective = await ObjectiveService.updateBookProgress(bookId, newPage);
            setObjectives(objectives.map(obj => obj.id === updatedObjective.id ? updatedObjective : obj));
        } catch (error) {
            console.error("Error updating book:", error);
        }
    };

    if (loading) return <div className="objectives-container">Reconstruyendo la Forja...</div>;

    return (
        <div className="objectives-container">
            <header className="objectives-header">
                <Link to="/personal" style={{ color: '#8f94fb', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
                    ← Dashboard
                </Link>
                <h1>La Forja</h1>
                <p>Donde los sueños se hacen realidad.</p>
            </header>

            <div className="objectives-grid">
                {objectives.map(obj => (
                    <div key={obj.id} className="objective-card">
                        <span className="objective-type-badge">{obj.type}</span>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{obj.title}</h2>
                        <p style={{ opacity: 0.8, fontSize: '1.1rem', marginBottom: '1.5rem' }}>{obj.description}</p>

                        {obj.deadline && (
                            <span className="deadline-badge">⌛ Límite: {obj.deadline}</span>
                        )}

                        {obj.type === 'READING' && obj.books && (
                            <div className="books-container" style={{ display: 'flex', flexDirection: 'column', marginTop: '2rem', gap: '1.5rem' }}>
                                {[...obj.books].sort((a, b) => Number(a.completed) - Number(b.completed)).map(book => (
                                    <div key={book.id} className={`book-item ${book.completed ? 'completed' : ''}`} style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{book.title}</h3>
                                            {book.completed && <span style={{ color: '#1dd1a1', fontWeight: 'bold' }}>¡COMPLETADO!</span>}
                                        </div>
                                        <p style={{ fontSize: '1rem', opacity: 0.7, margin: '10px 0' }}>{book.description}</p>

                                        <div className="reading-progress-container" style={{ marginTop: '1.5rem' }}>
                                            <div className="progress-info" style={{ fontSize: '1.1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    Pág.
                                                    <input
                                                        type="number"
                                                        value={book.currentPage}
                                                        onChange={(e) => updateBookPage(book.id!, parseInt(e.target.value))}
                                                        style={{ width: '70px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', padding: '5px', textAlign: 'center' }}
                                                    />
                                                    <span>/ {book.totalPages}</span>
                                                </div>
                                            </div>
                                            <div className="progress-bar-bg" style={{ height: '12px', marginTop: '1rem' }}>
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{
                                                        width: `${(book.currentPage / book.totalPages) * 100}%`,
                                                        background: book.completed ? '#1dd1a1' : undefined
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {obj.type === 'LIST' && obj.subtasks && (
                            <div className="subtasks-list" style={{ marginTop: '2rem', gap: '1.2rem' }}>
                                {obj.subtasks.map((st) => (
                                    <div key={st.id} className="subtask-item" style={{ fontSize: '1.1rem' }}>
                                        <div
                                            className={`subtask-checkbox ${st.status}`}
                                            onClick={() => cycleSubtaskStatus(st.id!, st.status)}
                                            style={{ width: '24px', height: '24px' }}
                                        >
                                            {st.status === 'DONE' && '✓'}
                                            {st.status === 'DOING' && '●'}
                                        </div>
                                        <span className={`subtask-title ${st.status}`}>
                                            {st.title} {st.status === 'DOING' && <small style={{ color: '#54a0ff', marginLeft: '10px' }}>(En curso...)</small>}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: '#8f94fb', fontWeight: 'bold', textTransform: 'uppercase' }}>Estado: {obj.status}</span>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="options-btn" style={{ background: 'rgba(84, 160, 255, 0.2)' }} onClick={() => openEditModal(obj)}>Editar</button>
                                <button className="options-btn" onClick={() => deleteObjective(obj.id!)}>Borrar Meta</button>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="add-objective-trigger" onClick={() => setIsModalOpen(true)} style={{ padding: '3rem' }}>
                    <span style={{ fontSize: '4rem', color: '#8f94fb' }}>+</span>
                    <p style={{ fontSize: '1.2rem' }}>Forjar Nuevo Objetivo</p>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="objective-modal" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                        <h2>{editingId ? 'Reforjar Meta' : 'Definir Meta'}</h2>

                        <label className="form-label">Título</label>
                        <input className="form-input" placeholder="Ej. Biblioteca 2024" value={title} onChange={e => setTitle(e.target.value)} />

                        <label className="form-label">Descripción</label>
                        <textarea className="form-input" placeholder="Cuenta de qué se trata la meta..." value={description} onChange={e => setDescription(e.target.value)} />

                        <label className="form-label">Tipo de Meta</label>
                        <select className="form-input" value={type} onChange={e => setType(e.target.value as any)}>
                            <option value="GENERAL">General</option>
                            <option value="READING">Biblioteca (Muchos Libros)</option>
                            <option value="LIST">Lista de Proyectos (3 Fases)</option>
                            <option value="FINANCIAL">Ahorro / Finanzas</option>
                            <option value="SKILL">Aprendizaje / Skill</option>
                        </select>

                        {editingId && (
                            <>
                                <label className="form-label">Estado</label>
                                <select className="form-input" value={status} onChange={e => setStatus(e.target.value as any)}>
                                    <option value="PENDING">Pendiente</option>
                                    <option value="IN_PROGRESS">En curso</option>
                                    <option value="COMPLETED">Completado</option>
                                </select>
                            </>
                        )}

                        <label className="form-label">Fecha Límite (Dejar vacío para infinita)</label>
                        <input type="date" className="form-input" value={deadline} onChange={e => setDeadline(e.target.value)} />

                        {type === 'READING' && (
                            <div className="book-form-section" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '15px', marginBottom: '1.5rem' }}>
                                <h4>Añadir Libro a la colección</h4>
                                <input className="form-input" placeholder="Título del libro" value={bookTitle} onChange={e => setBookTitle(e.target.value)} />
                                <textarea className="form-input" placeholder="Pequeña descripción" value={bookDesc} onChange={e => setBookDesc(e.target.value)} />
                                <input type="number" className="form-input" placeholder="Total páginas" value={bookPages} onChange={e => setBookPages(parseInt(e.target.value))} />
                                <button onClick={handleAddBook} className="btn-primary" style={{ background: '#4e54c8' }}>Añadir al Listado</button>

                                <div style={{ marginTop: '10px' }}>
                                    {tempBooks.map((b, i) => <div key={i} style={{ fontSize: '0.8rem' }}>📖 {b.title} ({b.totalPages} pág.)</div>)}
                                </div>
                            </div>
                        )}

                        {type === 'LIST' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input className="form-input" placeholder="Nueva subtarea..." value={newSubtask} onChange={e => setNewSubtask(e.target.value)} />
                                    <button onClick={handleAddSubtask} className="btn-primary" style={{ width: 'auto' }}>+</button>
                                </div>
                                {tempSubtasks.map((st, i) => <div key={i} style={{ fontSize: '0.8rem', opacity: 0.7 }}>• {st.title}</div>)}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                            <button className="btn-primary" onClick={handleSave}>
                                {editingId ? 'Reforjar' : 'Forjar'} Meta
                            </button>
                            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
