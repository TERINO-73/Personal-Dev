import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodService from '../services/food.service';
import './NutritionDashboard.css';

const CreateFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    caloriesPer100g: '',
    proteinPer100g: '',
    carbsPer100g: '',
    fatPer100g: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await FoodService.createFood({
        name: formData.name,
        caloriesPer100g: Number(formData.caloriesPer100g),
        proteinPer100g: Number(formData.proteinPer100g),
        carbsPer100g: Number(formData.carbsPer100g),
        fatPer100g: Number(formData.fatPer100g)
      });
      navigate('/personal/nutrition/add-food');
    } catch (err) {
      console.error(err);
      alert('Error creating food');
    }
  };

  return (
    <div className="nutrition-container setup-container glass-effect">
      <header className="nutrition-header" style={{ width: '100%', marginBottom: '2rem' }}>
        <button className="back-btn" onClick={() => navigate('/personal/nutrition/add-food')}>← Volver</button>
      </header>

      <h1 className="main-title" style={{ fontSize: '2rem' }}>Crear Alimento</h1>
      <p className="subtitle">Introduce los valores por cada 100g</p>

      <form onSubmit={handleSubmit} className="setup-form">
        <label>
          Nombre
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </label>
        <label>
          Calorías (kcal)
          <input required type="number" step="0.1" value={formData.caloriesPer100g} onChange={e => setFormData({...formData, caloriesPer100g: e.target.value})} />
        </label>
        <label>
          Proteínas (g)
          <input required type="number" step="0.1" value={formData.proteinPer100g} onChange={e => setFormData({...formData, proteinPer100g: e.target.value})} />
        </label>
        <label>
          Carbohidratos (g)
          <input required type="number" step="0.1" value={formData.carbsPer100g} onChange={e => setFormData({...formData, carbsPer100g: e.target.value})} />
        </label>
        <label>
          Grasas (g)
          <input required type="number" step="0.1" value={formData.fatPer100g} onChange={e => setFormData({...formData, fatPer100g: e.target.value})} />
        </label>
        <button type="submit" className="primary-btn mt-4">Guardar Alimento</button>
      </form>
    </div>
  );
};

export default CreateFoodPage;
