from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.api.auth_controller import router as auth_router
from app.core.database import init_db


class GenerateRequest(BaseModel):
	prompt: str


class GenerateResponse(BaseModel):
	response: str


app = FastAPI(title="AI Code Assistant API")

app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:5173",
		"http://127.0.0.1:5173",
	],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
	init_db()


@app.get("/health")
def health_check() -> dict[str, str]:
	return {"status": "ok"}


@app.post("/api/generate", response_model=GenerateResponse)
def generate_code(payload: GenerateRequest) -> GenerateResponse:
	prompt = payload.prompt.strip()
	if not prompt:
		return GenerateResponse(response="Please enter a prompt.")

	generated = (
		"Backend connected successfully.\n\n"
		f"You asked: {prompt}\n\n"
		"Sample FastAPI template:\n"
		"from fastapi import APIRouter\n\n"
		"router = APIRouter()\n\n"
		"@router.get('/example')\n"
		"def example():\n"
		"    return {'message': 'Hello from API'}"
	)
	return GenerateResponse(response=generated)


app.include_router(auth_router)
