import { useState } from "react";
import type { User } from "../api/userApi";

interface Props {
  onSubmit: (user: User) => void;
  initialData?: User;
}

export default function RegisterForm({ onSubmit, initialData }: Props) {
  const [form, setForm] = useState<User>({
    username: initialData?.username || "",
    email: initialData?.email || "",
    password: "",
    role: "USER",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <button type="submit">Save</button>
    </form>
  );
}
