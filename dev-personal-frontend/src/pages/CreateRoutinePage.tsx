import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseService from '../services/exercise.service';
import type { Exercise, PageResponse } from '../services/exercise.service';
import RoutineService from '../services/routine.service';
import type { Routine, RoutineExercise } from '../services/routine.service';
import '../styles/Main.css';

export default function CreateRoutinePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Library search
  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<Exercise> | null>(null);
  
  // Selected Routine Exercises
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExercises();
  }, [page, search]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await ExerciseService.getExercises(search, page, 10);
      setPageData(data);
      setExercises(data.content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addExerciseToRoutine = (exercise: Exercise) => {
    const newRoutineEx: RoutineExercise = {
      exerciseId: exercise.id,
      exercise: exercise,
      defaultSets: 3,
      defaultReps: '10'
    };
    setSelectedExercises([...selectedExercises, newRoutineEx]);
  };

  const removeExercise = (index: number) => {
    const newArr = [...selectedExercises];
    newArr.splice(index, 1);
    setSelectedExercises(newArr);
  };

  const updateSetReps = (index: number, field: 'defaultSets' | 'defaultReps', value: string) => {
    const newArr = [...selectedExercises];
    if (field === 'defaultSets') {
      newArr[index].defaultSets = parseInt(value) || 0;
    } else {
      newArr[index].defaultReps = value;
    }
    setSelectedExercises(newArr);
  };

  const handleSaveRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("El nombre de la rutina es obligatorio");
      return;
    }
    if (selectedExercises.length === 0) {
      alert("Debes añadir al menos un ejercicio a la rutina.");
      return;
    }

    const payload: Routine = {
      name,
      description,
      isTemplate: false,
      exercises: selectedExercises.map((re, idx) => ({
        exerciseId: re.exerciseId,
        orderIndex: idx,
        defaultSets: re.defaultSets,
        defaultReps: re.defaultReps
      }))
    };

    try {
      setSaving(true);
      await RoutineService.createRoutine(payload);
      navigate('/personal/routines');
    } catch (err) {
      console.error(err);
      alert("Error al guardar rutina");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper glass-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="section-header">
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Crear Nueva Rutina</h1>
        <button className="secondary-btn small-btn" onClick={() => navigate('/personal/routines')}>Volver</button>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* LEFT COLUMN: Form + Selected Exercises */}
        <div style={{ flex: '1 1 50%', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <form className="glass-effect" style={{ padding: '20px', borderRadius: '12px' }}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Nombre de la Rutina:</label>
              <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Día de Pecho" required />
            </div>
            <div className="form-group">
              <label>Descripción:</label>
              <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Opcional. Breve nota de la rutina." rows={2} />
            </div>
          </form>

          <div className="glass-effect" style={{ padding: '20px', borderRadius: '12px', flexGrow: 1 }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Ejercicios Seleccionados ({selectedExercises.length})</h3>
            
            {selectedExercises.length === 0 ? (
              <p className="placeholder-text">Añade ejercicios desde la biblioteca a la derecha.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedExercises.map((re, index) => (
                  <div key={index} className="glass-effect" style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <strong>{index + 1}. {re.exercise?.name}</strong>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '0.8rem' }}>Sets:</span>
                          <input type="number" min="1" className="form-input" style={{ width: '60px', padding: '2px 5px' }} value={re.defaultSets} onChange={e => updateSetReps(index, 'defaultSets', e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '0.8rem' }}>Reps:</span>
                          <input type="text" className="form-input" style={{ width: '80px', padding: '2px 5px' }} value={re.defaultReps} onChange={e => updateSetReps(index, 'defaultReps', e.target.value)} placeholder="Ej: 10 o 8-12" />
                        </div>
                      </div>
                    </div>
                    <button className="delete-btn" onClick={() => removeExercise(index)} style={{ padding: '5px 10px', marginLeft: '10px' }}>x</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="primary-btn" onClick={handleSaveRoutine} disabled={saving} style={{ padding: '15px', fontSize: '1.1rem', background: '#1dd1a1' }}>
            {saving ? 'Guardando...' : 'Guardar Rutina'}
          </button>
        </div>

        {/* RIGHT COLUMN: Library Search */}
        <div className="glass-effect" style={{ flex: '1 1 40%', minWidth: '300px', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Biblioteca de Ejercicios</h3>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? <p>Buscando...</p> : (
              exercises.map(ex => (
                <div key={ex.id} className="glass-effect" style={{ padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{ex.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#4facfe' }}>{ex.primaryMuscle}</span>
                  </div>
                  <button className="primary-btn small-btn" onClick={() => addExerciseToRoutine(ex)}>+</button>
                </div>
              ))
            )}
          </div>
          
          {pageData && pageData.totalPages > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'center' }}>
              <button disabled={page === 0} onClick={() => setPage(page - 1)} className="secondary-btn small-btn">◄</button>
              <button disabled={page >= pageData.totalPages - 1} onClick={() => setPage(page + 1)} className="secondary-btn small-btn">►</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
