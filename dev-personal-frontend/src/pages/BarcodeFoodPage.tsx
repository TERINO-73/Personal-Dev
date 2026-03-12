import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodService from '../services/food.service';
import type { Food } from '../services/food.service';
import NutritionService from '../services/nutrition.service';
import AuthService from '../services/auth.service';
import './NutritionDashboard.css';

const BarcodeFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useState(AuthService.getCurrentUser());
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState<Food | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [grams, setGrams] = useState('100');

  const handleSearchBarcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const food = await FoodService.getFoodByBarcode(barcode);
      setResult(food);
    } catch (err) {
      console.error(err);
      setError('No se pudo encontrar el alimento. Verifica el código de barras o créalo manualmente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFoodToDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      await NutritionService.addFoodToDay(user.username, {
        foodId: result.id,
        grams: Number(grams),
        date: today
      });
      navigate('/personal/nutrition');
    } catch (err) {
      console.error(err);
      alert('Error adding food to day');
    }
  };

  return (
    <div className="nutrition-container setup-container glass-effect">
      <header className="nutrition-header" style={{ width: '100%', marginBottom: '2rem' }}>
        <button className="back-btn" onClick={() => navigate('/personal/nutrition/add-food')}>← Volver</button>
      </header>

      <h1 className="main-title" style={{ fontSize: '2rem' }}>Escanear Código</h1>
      <p className="subtitle">Introduce el código de barras del producto</p>

      <form onSubmit={handleSearchBarcode} className="setup-form">
        <label>
          Código de barras
          <input required type="text" value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Ej: 8410123456789" />
        </label>
        <button type="submit" className="primary-btn mt-2" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar Alimento'}
        </button>
      </form>

      {error && <p className="text-danger mt-4" style={{ color: '#ff4757', textAlign: 'center' }}>{error}</p>}

      {result && (
        <div className="card glass-effect mt-4" style={{ width: '100%', maxWidth: '500px', textAlign: 'left' }}>
          <h3 style={{ color: '#00c6ff', marginBottom: '1rem' }}>{result.name}</h3>
          <p>Calorías: {Math.round(result.caloriesPer100g)} kcal</p>
          <p>Proteínas: {Math.round(result.proteinPer100g)} g</p>
          <p>Carbohidratos: {Math.round(result.carbsPer100g)} g</p>
          <p>Grasas: {Math.round(result.fatPer100g)} g</p>
          <p style={{ color: '#adb5bd', fontSize: '0.8rem', marginTop: '0.5rem' }}>* Valores por 100g</p>
          
          <form onSubmit={handleAddFoodToDay} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1.5rem' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              Cantidad (g)
              <input 
                type="number" 
                required 
                value={grams} 
                onChange={e => setGrams(e.target.value)}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
              />
            </label>
            <button type="submit" className="primary-btn">Añadir Hoy</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BarcodeFoodPage;
