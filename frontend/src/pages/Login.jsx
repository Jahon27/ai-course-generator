import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

 async function handleLogin(e) {
  e.preventDefault();

  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", response.data.access_token);

    const me = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    });

    localStorage.setItem("first_name", me.data.first_name || "");
    localStorage.setItem("last_name", me.data.last_name || "");

    setIsLoggedIn(true);

    toast.success("Logged in successfully!");

    navigate("/dashboard");
  } catch (error) {
    console.error(error);

    if (error.response?.status === 401) {
      toast.error("Invalid email or password");
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  }
}

  return (
    <div className="form-card">
        <h1>Login</h1>

      <form onSubmit={handleLogin}>
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

        <button type="submit">Login</button>
        <div className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}