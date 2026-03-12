import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RoutineService from '../services/routine.service';
import type { Routine } from '../services/routine.service';
import '../styles/Main.css';

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      setLoading(true);
      // Fetching all routines that belong to user OR are templates
      const data = await RoutineService.getRoutines(false);
      setRoutines(data);
    } catch (error) {
      console.error("Failed to load routines", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta rutina?')) return;
    try {
      await RoutineService.deleteRoutine(id);
      setRoutines(routines.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
      alert("Error eliminando rutina (puede que no seas el dueño)");
    }
  }

  return (
    <div className="page-wrapper glass-container" style={{ padding: '2rem' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Mis Rutinas</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/personal/exercise-library" className="secondary-btn small-btn">Ver Ejercicios</Link>
          <Link to="/personal/routines/create" className="primary-btn small-btn" style={{ background: '#1dd1a1' }}>+ Crear Rutina</Link>
        </div>
      </div>

      {loading ? (
        <p>Cargando rutinas...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {routines.length === 0 ? (
            <p className="placeholder-text">No tienes rutinas todavía. ¡Crea una!</p>
          ) : (
            routines.map(routine => (
              <div key={routine.id} className="glass-effect" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', color: 'var(--text-color, white)' }}>{routine.name}</h2>
                  {routine.isTemplate && <span style={{ fontSize: '0.7rem', background: '#f59e0b', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Global</span>}
                </div>
                {routine.description && <p style={{ fontSize: '0.85rem', color: '#adb5bd', marginBottom: '15px' }}>{routine.description}</p>}
                
                <div style={{ fontSize: '0.8rem', color: '#4facfe', marginBottom: '20px', flexGrow: 1 }}>
                  <strong>{routine.exercises?.length || 0} ejercicios</strong> listos para la acción.
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <button className="delete-btn small-btn" onClick={() => handleDelete(routine.id!)} style={{ flex: 1 }}>Eliminar</button>
                  <button className="primary-btn small-btn" onClick={() => navigate(`/personal/routines/${routine.id}/perform`)} style={{ flex: 2, background: 'linear-gradient(45deg, #ff6b6b, #ff4757)' }}>
                    Ejecutar Ahora
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
