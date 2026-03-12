import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExerciseService from '../services/exercise.service';
import type { Exercise, PageResponse } from '../services/exercise.service';
import '../styles/Main.css';

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [pageData, setPageData] = useState<PageResponse<Exercise> | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', description: '', primaryMuscle: '', equipment: '' });

  useEffect(() => {
    loadExercises();
  }, [page, search]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await ExerciseService.getExercises(search, page, 20);
      setPageData(data);
      setExercises(data.content);
    } catch (error) {
      console.error("Failed to load exercises", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadExercises();
  };

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newExercise.name || !newExercise.primaryMuscle) return alert("Nombre y músculo son obligatorios");
      await ExerciseService.createExercise(newExercise);
      setShowCreateModal(false);
      setNewExercise({ name: '', description: '', primaryMuscle: '', equipment: '' });
      loadExercises();
    } catch (error) {
      console.error(error);
      alert("Error al crear ejercicio");
    }
  };

  return (
    <div className="page-wrapper glass-container" style={{ padding: '2rem' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Biblioteca de Ejercicios</h1>
        <Link to="/personal/routines" className="secondary-btn small-btn">Ir a Mis Rutinas</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1 }}>
          <input 
            type="text" 
            placeholder="Buscar ejercicio..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ maxWidth: '400px' }}
          />
          <button type="submit" className="primary-btn small-btn">Buscar</button>
        </form>
        <button className="primary-btn small-btn" onClick={() => setShowCreateModal(true)} style={{ background: '#1dd1a1' }}>+ Crear Ejercicio</button>
      </div>

      {showCreateModal && (
        <div className="glass-effect" style={{ padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #1dd1a1' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Crear Nuevo Ejercicio</h3>
          <form onSubmit={handleCreateExercise} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input type="text" className="form-input" placeholder="Nombre (ej. Press de Banca)" value={newExercise.name} onChange={e => setNewExercise({...newExercise, name: e.target.value})} required style={{ flex: '1 1 200px' }} />
            <input type="text" className="form-input" placeholder="Músculo (ej. Pecho)" value={newExercise.primaryMuscle} onChange={e => setNewExercise({...newExercise, primaryMuscle: e.target.value})} required style={{ flex: '1 1 150px' }} />
            <input type="text" className="form-input" placeholder="Equipo (ej. Barra)" value={newExercise.equipment} onChange={e => setNewExercise({...newExercise, equipment: e.target.value})} style={{ flex: '1 1 150px' }} />
            <input type="text" className="form-input" placeholder="Descripción breve" value={newExercise.description} onChange={e => setNewExercise({...newExercise, description: e.target.value})} style={{ flex: '1 1 250px' }} />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="primary-btn small-btn" style={{ background: '#1dd1a1' }}>Guardar</button>
              <button type="button" className="secondary-btn small-btn" onClick={() => setShowCreateModal(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Cargando ejercicios...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
          {exercises.length === 0 ? (
            <p className="placeholder-text">No se encontraron ejercicios.</p>
          ) : (
            exercises.map(ex => (
              <div key={ex.id} className="glass-effect" style={{ padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: 'var(--text-color, white)' }}>{ex.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem' }}>
                   <span style={{ color: '#4facfe' }}><strong>Músculo:</strong> {ex.primaryMuscle}</span>
                   {ex.equipment && <span style={{ color: '#adb5bd' }}><strong>Equipo:</strong> {ex.equipment}</span>}
                   {ex.createdById && <span style={{ color: '#ff9f43', fontSize: '0.75rem', marginTop: '5px' }}>Personal</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {pageData && pageData.totalPages > 1 && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
          <button 
            className="secondary-btn small-btn" 
            disabled={page === 0} 
            onClick={() => setPage(p => p - 1)}
          >
            Anterior
          </button>
          <span style={{ alignSelf: 'center' }}>Página {page + 1} de {pageData.totalPages}</span>
          <button 
            className="secondary-btn small-btn" 
            disabled={page >= pageData.totalPages - 1} 
            onClick={() => setPage(p => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
