import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

    async function handleRegister(e) {
      e.preventDefault();

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      try {
        await api.post("/auth/register", {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        });

        toast.success("Account created successfully!");

        navigate("/login");
      } catch (error) {
        console.error(error);

        if (error.response?.status === 400) {
          toast.error("Email already registered");
        } else {
          toast.error("Registration failed");
        }
      }
    }

  return (
    <div className="form-card">
    <h1>Create account</h1>

      <form onSubmit={handleRegister}>
       <input
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <br /><br />
        <input
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <br /><br />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br /><br />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br /><br />

        <input
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}