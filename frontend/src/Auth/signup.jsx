import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./Auth.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
        name: name.trim(),
        email: email.trim(),
        password,
      };

      const response = await axios.post(`${API_BASE_URL}/signup`, payload);
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("token_type", response.data.token_type || "bearer");
      }
      setStatus({
        type: "success",
        message: response.data.message || "Signup successful",
      });
      setName("");
      setEmail("");
      setPassword("");
      setTimeout(() => {
        navigate("/chat");
      }, 250);
    } catch (error) {
      const fallbackMessage = "Unable to create account. Please try again.";
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
    <section className="auth-page auth-page--signup">
      <div className="auth-page__bg" aria-hidden="true" />

      <article className="auth-card" aria-label="Signup form">
        <p className="auth-card__eyebrow">Start free</p>
        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__subtitle">
          Join your team workspace, track progress, and collaborate in one place.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-form__label" htmlFor="signup-name">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Taylor Morgan"
            required
            className="auth-form__input"
          />

          <label className="auth-form__label" htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
            className="auth-form__input"
          />

          <label className="auth-form__label" htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a secure password"
            required
            minLength={8}
            className="auth-form__input"
          />

          <button type="submit" className="auth-form__button" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create account"}
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
          Already have an account? <Link to="/">Login</Link>
        </p>
      </article>
    </section>
  );
}
