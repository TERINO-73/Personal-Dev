import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Main.css";


interface User {
  name: string;
}

interface Rally {
  id: number;
  name: string;
  description: string;
  fondo: string;
  start_submission: string;
  end_submission: string;
  start_voting: string;
  end_voting: string;
  max_photos_per_user: number;
}

interface Props {
  auth: {
    isAuthenticated: () => boolean;
    isAdmin: () => boolean;
    logout: () => void;
  };
  user?: User | null;
  rallies: Rally[];
  getBackground: (fondo: string) => string;
}

export default function Home({
  auth,
  user,
  rallies,
  getBackground,
}: Props) {
  return (
    <div className="page-wrapper">
      <header className="header">
        <div className="logo">
          <Link to="/">PERSONAL DEV</Link>
        </div>

        <nav className="main-nav">
          <Link to="/personal"></Link>


          <>
            <Link to="/personal/register">Registro</Link>
            <Link to="/personal/login">Login</Link>
          </>


          {/* Dropdown Admin */}

          <div className="dropdown" tabIndex={0}>
            <button className="dropbtn">Admin</button>
            <ul className="dropdown-menu">
              <li>
                <Link to="/personal/admin/validate">Validar Fotos</Link>
              </li>
              <li>
                <Link to="/personal/admin/results">Ver Resultados</Link>
              </li>
              <li>
                <Link to="/personal/admin/rally">Gestionar Rallys</Link>
              </li>
              <li>
                <Link to="/personal/admin/users">Gestionar Usuarios</Link>
              </li>
              <li>
                <button onClick={auth.logout}>Cerrar Sesión</button>
              </li>
            </ul>
          </div>


          {/* Dropdown Usuario */}

          <div className="dropdown" tabIndex={0}>
            <button className="dropbtn">Perfil</button>
            <ul className="dropdown-menu">
              <li>
                <Link to="/personal/participant/upload">Mis Hábitos</Link>
              </li>
              <li>
                <Link to="/personal/participant/photos">Estadisticas Entrenamiento</Link>
              </li>
              <li>
                <Link to="/personal/participant/photos">Rutinas</Link>
              </li>
              <li>
                <Link to="/personal/participant/profile">Calendario</Link>
              </li>
              <li>
                <Link to="/personal/participant/results">GOALS</Link>
              </li>
              <li>
                <button onClick={auth.logout}>Cerrar Sesión</button>
              </li>
            </ul>
          </div>

        </nav>
      </header>





      <main className="home-container">
        <nav className="Ejercicio">Ejercicio</nav><br />
        <nav className="Recordatorios">Recordatorios</nav>
        <nav className="Habitos">Habitos y Journaling</nav>
        <nav className="Comidas">Comidas</nav>
        <nav className="Objetivos">Objetivos</nav>
      </main>
    </div>
  );
}
