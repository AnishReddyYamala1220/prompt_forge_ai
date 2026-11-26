
import json
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from .db import init_db, save_run, get_runs
from .agents import run_workflow


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="PromptForge AI — Advanced Agent Orchestrator",
    description="Bounded multi-agent prompt engineering, tool selection, evaluation and refinement.",
    version="2.0.0",
    lifespan=lifespan,
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://prompt-forge-ai.netlify.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class RunRequest(BaseModel):
    task: str = Field(min_length=5, max_length=5000)


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "PromptForge AI",
        "version": "2.0.0"
    }


@app.post("/api/run")
async def run(request: RunRequest):
    try:
        result = await run_workflow(request.task.strip())

        save_run(
            result["task"],
            result["final_answer"],
            result["winner"],
            float(result.get("final_score", 0)),
            json.dumps({
                "plan": result["plan"],
                "evaluation": result["evaluation"],
                "verification": result["verification"],
                "trace": result["trace"],
                "refinement_history": result["refinement_history"],
                "duration_ms": result["duration_ms"],
                "model": result["model"],
            }),
        )

        return result

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/history")
async def history():
    return {"runs": get_runs()}

@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "PromptForge AI Backend is running"}
