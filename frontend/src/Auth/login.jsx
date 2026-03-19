import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./Auth.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = {
        email: email.trim(),
        password,
      };

      const response = await axios.post(`${API_BASE_URL}/login`, payload);
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("token_type", response.data.token_type || "bearer");

      setStatus({
        type: "success",
        message: response.data.message || "Login successful",
      });
      setPassword("");
      setTimeout(() => {
        navigate("/chat");
      }, 250);
    } catch (error) {
      const fallbackMessage = "Unable to login. Please check your credentials.";
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : fallbackMessage;

      setStatus({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-page__bg" aria-hidden="true" />

      <article className="auth-card" aria-label="Login form">
        <p className="auth-card__eyebrow">Welcome back</p>
        <h1 className="auth-card__title">Sign in to continue building</h1>
        <p className="auth-card__subtitle">
          Access your dashboard, review projects, and keep shipping faster.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-form__label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
            className="auth-form__input"
          />

          <label className="auth-form__label" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            className="auth-form__input"
          />

          <button type="submit" className="auth-form__button" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>

          {status.message && (
            <p
              className={`auth-form__message auth-form__message--${status.type}`}
              role="status"
            >
              {status.message}
            </p>
          )}
        </form>

        <p className="auth-card__switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </article>
    </section>
  );
}
