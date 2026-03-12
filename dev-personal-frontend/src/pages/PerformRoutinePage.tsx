import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoutineService from '../services/routine.service';
import type { Routine } from '../services/routine.service';
import WorkoutService from '../services/workout.service';
import type { WorkoutSession, SetEntry } from '../services/workout.service';
import '../styles/Main.css';

export default function PerformRoutinePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);

  // Maps exerciseId to local temporary state for the "Add Set" small form
  const [activeSetForms, setActiveSetForms] = useState<Record<number, { reps: string, weightKg: string, loading: boolean }>>({});

  useEffect(() => {
    initPerfomance();
  }, [id]);

  const initPerfomance = async () => {
    try {
      setLoading(true);
      if (!id) return;
      
      const routineData = await RoutineService.getRoutineById(Number(id));
      setRoutine(routineData);

      // Start the workout session in the backend implicitly
      const newSession = await WorkoutService.startSession();
      setSession(newSession);

      // Initialize forms state per exercise
      const forms: any = {};
      routineData.exercises.forEach(re => {
        // Strip out any range "8-12" to pure numbers for defaults if possible, else empty
        const defaultRepsNum = re.defaultReps.replace(/[^0-9]/g, '');
        forms[re.exerciseId] = { reps: defaultRepsNum || '', weightKg: re.defaultWeightKg?.toString() || '', loading: false };
      });
      setActiveSetForms(forms);

    } catch (e) {
      console.error(e);
      alert("No se pudo cargar la rutina");
      navigate('/personal/routines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSet = async (exerciseId: number) => {
    if (!session) return;
    const form = activeSetForms[exerciseId];
    if (!form.reps) return alert("Introduce las repeticiones");

    try {
      setActiveSetForms(prev => ({ ...prev, [exerciseId]: { ...prev[exerciseId], loading: true } }));
      
      const payload: Partial<SetEntry> = {
        exerciseId,
        reps: Number(form.reps),
        weightKg: form.weightKg ? Number(form.weightKg) : undefined
      };

      const addedSet = await WorkoutService.addSet(session.id, payload);
      
      // Update session local state optimistic-like
      setSession(prev => {
        if (!prev) return prev;
        return { ...prev, sets: [...prev.sets, addedSet] };
      });

    } catch (e) {
      console.error(e);
      alert("Error guardando el set");
    } finally {
      setActiveSetForms(prev => ({ ...prev, [exerciseId]: { ...prev[exerciseId], loading: false } }));
    }
  };

  const handleDeleteSet = async (setId: number) => {
    if (!session) return;
    try {
      await WorkoutService.deleteSet(session.id, setId);
      setSession(prev => {
        if (!prev) return prev;
        return { ...prev, sets: prev.sets.filter(s => s.id !== setId) };
      });
    } catch (e) {
      console.error(e);
      alert("No se pudo borrar el set");
    }
  };

  const handleFinish = async () => {
    if (!session) return;
    if (!window.confirm("¿Seguro que deseas terminar el entrenamiento?")) return;
    
    try {
      setFinishing(true);
      await WorkoutService.finishSession(session.id);
      navigate('/');
    } catch (e) {
      console.error(e);
      alert("Error finalizando entrenamiento");
      setFinishing(false);
    }
  };

  if (loading) return <div className="page-wrapper" style={{ padding: '2rem' }}>Cargando preparación...</div>;
  if (!routine || !session) return null;

  return (
    <div className="page-wrapper glass-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 5px 0' }}>{routine.name}</h1>
          <p style={{ margin: 0, color: '#adb5bd', fontSize: '0.9rem' }}>En progreso... ¡Dale duro!</p>
        </div>
        <button className="primary-btn" onClick={handleFinish} disabled={finishing} style={{ background: '#ff6b6b' }}>
          {finishing ? 'Terminando...' : 'Terminar Entrenamiento'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {routine.exercises.map((re, idx) => {
          const exSets = session.sets.filter(s => s.exerciseId === re.exerciseId).sort((a,b) => (a.setIndex || 0) - (b.setIndex || 0));
          const form = activeSetForms[re.exerciseId];

          return (
            <div key={idx} className="glass-effect" style={{ padding: '15px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#4facfe' }}>{re.exercise?.name}</h3>
                <span style={{ fontSize: '0.8rem', color: '#adb5bd' }}>Meta: {re.defaultSets} sets x {re.defaultReps}</span>
              </div>
              
              {/* Sets list */}
              {exSets.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {exSets.map((s, sIdx) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', gap: '15px', fontSize: '0.95rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#adb5bd', width: '20px' }}>{sIdx + 1}</span>
                        <span>{s.reps} reps</span>
                        {s.weightKg && <span>{s.weightKg} kg</span>}
                      </div>
                      <button onClick={() => handleDeleteSet(s.id!)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '0 5px', fontSize: '1rem' }}>x</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Set Inline Form */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Reps" 
                  value={form?.reps || ''} 
                  onChange={e => setActiveSetForms(p => ({ ...p, [re.exerciseId]: { ...p[re.exerciseId], reps: e.target.value } }))}
                  style={{ width: '80px' }}
                />
                <input 
                  type="number" 
                  step="0.5"
                  className="form-input" 
                  placeholder="Kg (Opcional)" 
                  value={form?.weightKg || ''} 
                  onChange={e => setActiveSetForms(p => ({ ...p, [re.exerciseId]: { ...p[re.exerciseId], weightKg: e.target.value } }))}
                  style={{ width: '120px' }}
                />
                <button 
                  className="primary-btn small-btn" 
                  onClick={() => handleAddSet(re.exerciseId)} 
                  disabled={form?.loading}
                  style={{ padding: '8px 15px', background: '#1dd1a1' }}
                >
                  {form?.loading ? '...' : '+ Set'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
