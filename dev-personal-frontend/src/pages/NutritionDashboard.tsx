import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NutritionService from '../services/nutrition.service';
import type { NutritionProfile, DayNutritionResponse } from '../services/nutrition.service';
import AuthService from '../services/auth.service';
import './NutritionDashboard.css';

const NutritionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useState(AuthService.getCurrentUser());
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [dayInfo, setDayInfo] = useState<DayNutritionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    sex: 'male',
    age: '',
    activityLevel: 'Sedentario',
    goal: 'Mantener peso'
  });

  const [editMacros, setEditMacros] = useState(false);
  const [macroForm, setMacroForm] = useState({
    targetCalories: '',
    targetProtein: '',
    targetCarbs: '',
    targetFat: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/personal/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const p = await NutritionService.getProfile(user!.username);
      setProfile(p || null);
      if (p) {
        setMacroForm({
          targetCalories: String(p.targetCalories || ''),
          targetProtein: String(p.targetProtein || ''),
          targetCarbs: String(p.targetCarbs || ''),
          targetFat: String(p.targetFat || '')
        });
      }

      const d = await NutritionService.getDayInfo(user!.username, today);
      setDayInfo(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const saved = await NutritionService.saveProfile(user.username, {
        weight: Number(formData.weight),
        height: Number(formData.height),
        sex: formData.sex,
        age: Number(formData.age),
        activityLevel: formData.activityLevel,
        goal: formData.goal
      });
      setProfile(saved);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMacros = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;
    try {
      const updated = await NutritionService.saveProfile(user.username, {
        ...profile,
        targetCalories: Number(macroForm.targetCalories),
        targetProtein: Number(macroForm.targetProtein),
        targetCarbs: Number(macroForm.targetCarbs),
        targetFat: Number(macroForm.targetFat)
      });
      setProfile(updated);
      setEditMacros(false);
      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!user) return;
    try {
      await NutritionService.removeFoodFromDay(user.username, entryId);
      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  const handleResetMacros = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await NutritionService.resetMacros(user.username);
      await fetchData();
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  if (!profile || !profile.id) {
    return (
      <div className="nutrition-container setup-container glass-effect">
        <h1 className="main-title">Nutrición</h1>
        <h2 className="subtitle">Empieza a controlar tus macros</h2>
        <form onSubmit={handleCreateProfile} className="setup-form">
          <label>Peso (kg) <input required type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} /></label>
          <label>Altura (cm) <input required type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} /></label>
          <label>Edad <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} /></label>
          <label>Sexo 
            <select value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})}>
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
            </select>
          </label>
          <label>Nivel de actividad diaria
            <select value={formData.activityLevel} onChange={e => setFormData({...formData, activityLevel: e.target.value})}>
              <option value="Sedentario">Sedentario</option>
              <option value="Ligero">Ligero</option>
              <option value="Moderado">Moderado</option>
              <option value="Alto">Alto</option>
              <option value="Muy alto">Muy alto</option>
            </select>
          </label>
          <label>Objetivo
            <select value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})}>
              <option value="Perder grasa">Perder grasa</option>
              <option value="Mantener peso">Mantener peso</option>
              <option value="Ganar masa muscular">Ganar masa muscular</option>
            </select>
          </label>
          <button type="submit" className="primary-btn mt-4">Guardar</button>
        </form>
      </div>
    );
  }

  const calData = dayInfo ? dayInfo : { totalCalories: 0, targetCalories: profile.targetCalories || 0, totalProtein: 0, targetProtein: profile.targetProtein || 0, totalCarbs: 0, targetCarbs: profile.targetCarbs || 0, totalFat: 0, targetFat: profile.targetFat || 0, entries: [] };

  return (
    <div className="nutrition-container">
      <header className="nutrition-header">
        <h1>Dashboard Nutricional</h1>
        <button className="back-btn" onClick={() => navigate('/personal')}>← Volver</button>
      </header>

      <section className="dashboard-cards glass-effect">
        <div className="card calories-card">
          <h3>Calorías</h3>
          <p className="card-value">{Math.round(calData.totalCalories)} / {Math.round(calData.targetCalories)} kcal</p>
          <progress value={calData.totalCalories} max={calData.targetCalories || 1}></progress>
        </div>
        <div className="card macronutrient-card pro-card">
          <h3>Proteínas</h3>
          <p className="card-value">{Math.round(calData.totalProtein)} / {Math.round(calData.targetProtein)} g</p>
          <progress value={calData.totalProtein} max={calData.targetProtein || 1}></progress>
        </div>
        <div className="card macronutrient-card car-card">
          <h3>Carbohidratos</h3>
          <p className="card-value">{Math.round(calData.totalCarbs)} / {Math.round(calData.targetCarbs)} g</p>
          <progress value={calData.totalCarbs} max={calData.targetCarbs || 1}></progress>
        </div>
        <div className="card macronutrient-card fat-card">
          <h3>Grasas</h3>
          <p className="card-value">{Math.round(calData.totalFat)} / {Math.round(calData.targetFat)} g</p>
          <progress value={calData.totalFat} max={calData.targetFat || 1}></progress>
        </div>
      </section>

      <section className="food-list-section glass-effect mt-4">
        <div className="section-header">
          <h2>Alimentos Consumidos Hoy</h2>
          <button className="primary-btn small-btn" onClick={() => navigate('/personal/nutrition/add-food')}>+</button>
        </div>
        
        {calData.entries.length === 0 ? (
          <p className="text-muted">No has registrado alimentos hoy.</p>
        ) : (
          <ul className="food-list">
            {calData.entries.map((entry) => (
              <li key={entry.id} className="food-item">
                <div className="food-item-info">
                  <h4>{entry.food?.name} ({entry.grams}g)</h4>
                  <p>{Math.round(entry.calories)} kcal · P: {Math.round(entry.protein)}g · C: {Math.round(entry.carbs)}g · G: {Math.round(entry.fat)}g</p>
                </div>
                <button className="danger-btn" onClick={() => handleDeleteEntry(entry.id)}>X</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="macros-setting-section glass-effect mt-4">
        <div className="section-header">
          <h2>Ajuste de Macros</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="secondary-btn small-btn" onClick={() => setEditMacros(!editMacros)}>
              {editMacros ? 'Cancelar' : 'Ajustar Manualmente'}
            </button>
            <button className="primary-btn small-btn" onClick={handleResetMacros} style={{ backgroundColor: '#f59e0b' }} title="Restaurar a los recomendados por la app">
              Restablecer sugeridos
            </button>
          </div>
        </div>
        
        {editMacros && (
          <form onSubmit={handleUpdateMacros} className="macros-form">
            <label>Calorías (kcal)<input required type="number" step="0.1" value={macroForm.targetCalories} onChange={e => setMacroForm({...macroForm, targetCalories: e.target.value})}/></label>
            <label>Proteínas (g)<input required type="number" step="0.1" value={macroForm.targetProtein} onChange={e => setMacroForm({...macroForm, targetProtein: e.target.value})}/></label>
            <label>Carbohidratos (g)<input required type="number" step="0.1" value={macroForm.targetCarbs} onChange={e => setMacroForm({...macroForm, targetCarbs: e.target.value})}/></label>
            <label>Grasas (g)<input required type="number" step="0.1" value={macroForm.targetFat} onChange={e => setMacroForm({...macroForm, targetFat: e.target.value})}/></label>
            <button type="submit" className="primary-btn mt-2">Guardar Cambios</button>
          </form>
        )}
      </section>

    </div>
  );
};

export default NutritionDashboard;
