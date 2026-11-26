import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.affordability import router as affordability_router
from app.routes.tenancy import router as tenancy_router
from app.routes.support import router as support_router
from app.routes.properties import router as properties_router

load_dotenv()
app = FastAPI(title="RentReady API", description="UK housing information assistant", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"), "http://localhost:3000"],
    allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["Content-Type"]
)
app.include_router(affordability_router, prefix="/api/affordability", tags=["Affordability"])
app.include_router(tenancy_router, prefix="/api/tenancy", tags=["Tenancy"])
app.include_router(support_router, prefix="/api/support", tags=["Housing support"])
app.include_router(properties_router, prefix="/api/properties", tags=["Properties"])

@app.get("/")
def home():
    return {"message": "Welcome to RentReady API", "docs": "/docs"}

@app.get("/api/health")
def health():
    return {"status": "online", "service": "RentReady"}
