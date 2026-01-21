import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, createUser, updateUser, type User } from "../api/userApi";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<User>({
    username: "",
    email: "",
    password: "",
    role: "USER",
  });

  // Cargar todos los usuarios
  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Manejar cambios en inputs y select
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Crear o actualizar usuario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!form.username || !form.email || (!editingUser && !form.password)) {
        alert("Username, email y password son obligatorios al crear usuario");
        return;
      }

      if (editingUser) {
        // No enviar password si está vacío
        const userToUpdate: User = { ...form };
        if (!userToUpdate.password) delete userToUpdate.password;

        await updateUser(editingUser.id!, userToUpdate);
        setEditingUser(null);
      } else {
        await createUser(form);
      }

      setForm({ username: "", email: "", password: "", role: "USER" });
      loadUsers();
    } catch (error) {
      console.error("Error creando/actualizando usuario:", error);
      alert("Error creando/actualizando usuario. Revisa la consola.");
    }
  };

  // Preparar formulario para editar
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      email: user.email,
      password: "", // password vacío al editar
      role: user.role || "USER",
    });
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditingUser(null);
    setForm({ username: "", email: "", password: "", role: "USER" });
  };

  // Borrar usuario
  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error("Error borrando usuario:", error);
      alert("Error borrando usuario. Revisa la consola.");
    }
  };

  return (
    <>
      <h1>Users CRUD</h1>

      {/* Formulario Crear / Editar */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder={editingUser ? "Dejar vacío para no cambiar" : "Password"}
          value={form.password || ""}
          onChange={handleChange}
          required={!editingUser} // obligatorio solo al crear
        />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button type="submit">{editingUser ? "Actualizar" : "Crear"}</button>
        {editingUser && <button type="button" onClick={handleCancel}>Cancelar</button>}
      </form>

      {/* Lista de usuarios */}
      <ul>
        {users.map(user => (
          <li key={user.id} style={{ marginBottom: "10px" }}>
            {user.username} - {user.email} - {user.role || "USER"}{" "}
            <button onClick={() => handleEdit(user)}>Editar</button>{" "}
            <button onClick={() => handleDelete(user.id)}>Borrar</button>
          </li>
        ))}
      </ul>
    </>
  );
}
