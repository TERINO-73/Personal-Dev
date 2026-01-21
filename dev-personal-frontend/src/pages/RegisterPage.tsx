import RegisterForm from "../components/RegisterForm";
import { createUser } from "../api/userApi";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleCreate = async (user: any) => {
    await createUser(user);
    navigate("/");
  };

  return (
    <>
      <h1>Create User</h1>
      <RegisterForm onSubmit={handleCreate} />
    </>
  );
}
