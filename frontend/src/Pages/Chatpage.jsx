import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Chatpage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const QUICK_PROMPTS = [
	"Build a FastAPI CRUD API for tasks",
	"Write a React component with form validation",
	"Explain JWT auth in simple steps",
	"Help me debug a Python traceback",
];

function createMessage(role, content) {
	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		role,
		content,
	};
}

export default function Chatpage() {
	const navigate = useNavigate();
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [messages, setMessages] = useState([
		createMessage(
			"assistant",
			"Hey, I am your AI coding assistant. Ask me to generate code, explain bugs, or design your next feature."
		),
	]);

	const listRef = useRef(null);
	const token = localStorage.getItem("access_token") || "";
	const tokenType = localStorage.getItem("token_type") || "bearer";

	useEffect(() => {
		if (!token) {
			navigate("/");
		}
	}, [navigate, token]);

	useEffect(() => {
		if (!listRef.current) return;
		listRef.current.scrollTop = listRef.current.scrollHeight;
	}, [messages, isLoading]);

	const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

	const handleLogout = () => {
		localStorage.removeItem("access_token");
		localStorage.removeItem("token_type");
		navigate("/");
	};

	const sendMessage = async (rawText) => {
		const text = rawText.trim();
		if (!text || isLoading) return;

		setError("");
		setInput("");
		setIsLoading(true);
		setMessages((prev) => [...prev, createMessage("user", text)]);

		try {
			const response = await axios.post(
				`${API_BASE_URL}/api/generate`,
				{ prompt: text },
				token
					? {
							headers: {
								Authorization: `${tokenType} ${token}`,
							},
						}
					: undefined
			);

			const answer = response?.data?.response || "I could not generate a response.";
			setMessages((prev) => [...prev, createMessage("assistant", answer)]);
		} catch (requestError) {
			const fallback = "Request failed. Please check backend status and try again.";
			const detail =
				axios.isAxiosError(requestError) && requestError.response?.data?.detail
					? requestError.response.data.detail
					: fallback;

			setError(detail);
			setMessages((prev) => [
				...prev,
				createMessage(
					"assistant",
					"I could not reach the API right now. Start your backend and retry your question."
				),
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		await sendMessage(input);
	};

	return (
		<section className="chat-page">
			<div className="chat-page__grain" aria-hidden="true" />

			<header className="chat-header">
				<div>
					<p className="chat-header__eyebrow">AI Workspace</p>
					<h1 className="chat-header__title">Code Assistant Chat</h1>
					<p className="chat-header__subtitle">
						Ask for code, architecture, bug fixes, or API design.
					</p>
				</div>

				<button type="button" className="chat-header__logout" onClick={handleLogout}>
					Logout
				</button>
			</header>

			<main className="chat-shell" aria-label="Assistant conversation area">
				<aside className="chat-prompts" aria-label="Quick prompts">
					<h2 className="chat-prompts__title">Try one prompt</h2>
					<div className="chat-prompts__list">
						{QUICK_PROMPTS.map((prompt) => (
							<button
								key={prompt}
								type="button"
								className="chat-prompts__chip"
								onClick={() => sendMessage(prompt)}
								disabled={isLoading}
							>
								{prompt}
							</button>
						))}
					</div>
				</aside>

				<section className="chat-panel">
					<div ref={listRef} className="chat-panel__messages" role="log" aria-live="polite">
						{messages.map((message) => (
							<article
								key={message.id}
								className={`chat-message chat-message--${message.role}`}
								aria-label={`${message.role} message`}
							>
								<p>{message.content}</p>
							</article>
						))}

						{isLoading && (
							<article className="chat-message chat-message--assistant chat-message--typing">
								<p>Thinking...</p>
							</article>
						)}
					</div>

					{error && <p className="chat-panel__error">{error}</p>}

					<form className="chat-input" onSubmit={handleSubmit}>
						<textarea
							className="chat-input__field"
							placeholder="Ask anything about your project..."
							value={input}
							onChange={(event) => setInput(event.target.value)}
							rows={3}
						/>
						<button type="submit" className="chat-input__send" disabled={!canSend}>
							{isLoading ? "Sending..." : "Send"}
						</button>
					</form>
				</section>
			</main>
		</section>
	);
}
