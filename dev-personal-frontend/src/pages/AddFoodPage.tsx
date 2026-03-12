import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodService from '../services/food.service';
import type { Food } from '../services/food.service';
import NutritionService from '../services/nutrition.service';
import AuthService from '../services/auth.service';
import './NutritionDashboard.css';

const AddFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useState(AuthService.getCurrentUser());
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState<string>('100');

  useEffect(() => {
    if (!user) {
      navigate('/personal/login');
      return;
    }
    loadFoods();
  }, [user]);

  const loadFoods = async () => {
    try {
      const allFoods = await FoodService.getAllFoods();
      setFoods(allFoods);
      setFilteredFoods(allFoods);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setSearchTerm(val);
    setFilteredFoods(foods.filter(f => f.name.toLowerCase().includes(val)));
  };

  const handleAddFoodToDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood || !user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      await NutritionService.addFoodToDay(user.username, {
        foodId: selectedFood.id,
        grams: Number(grams),
        date: today
      });
      navigate('/personal/nutrition');
    } catch (err) {
      console.error(err);
      alert('Error adding food');
    }
  };

  return (
    <div className="nutrition-container">
      <header className="nutrition-header">
        <h1>Añadir Alimento</h1>
        <button className="back-btn" onClick={() => navigate('/personal/nutrition')}>← Volver</button>
      </header>

      <div className="glass-effect mb-4" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button className="secondary-btn" onClick={() => navigate('/personal/nutrition/barcode')}>
            🔍 Escanear Código
          </button>
          <button className="secondary-btn" onClick={() => navigate('/personal/nutrition/create-food')}>
            ✍️ Crear Manualmente
          </button>
        </div>
        
        <input 
          type="text" 
          placeholder="Buscar alimento existente..." 
          value={searchTerm}
          onChange={handleSearch}
          className="setup-form"
          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
        />
      </div>

      <div className="glass-effect" style={{ marginBottom: '2rem' }}>
        <ul className="food-list">
          {filteredFoods.map(food => (
            <li key={food.id} className="food-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedFood(food)}>
              <div className="food-item-info">
                <h4>{food.name}</h4>
                <p>{Math.round(food.caloriesPer100g)} kcal/100g · P: {Math.round(food.proteinPer100g)}g · C: {Math.round(food.carbsPer100g)}g · G: {Math.round(food.fatPer100g)}g</p>
              </div>
            </li>
          ))}
          {filteredFoods.length === 0 && <p className="text-muted">No hay alimentos guardados.</p>}
        </ul>
      </div>

      {selectedFood && (
        <div className="glass-effect setup-container" style={{ minHeight: 'auto', padding: '1.5rem', position: 'sticky', bottom: '2rem', background: 'rgba(20,20,20,0.9)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#00c6ff' }}>Añadir: {selectedFood.name}</h3>
          <form onSubmit={handleAddFoodToDay} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', width: '100%' }}>
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

export default AddFoodPage;
