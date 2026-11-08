import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.database.connection import init_db, get_db_status
from app.api.endpoints import router as api_router

logger = logging.getLogger("aivoa.main")
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing AIVOA.AI RCA Module...")
    init_db()
    db_info = get_db_status()
    logger.info(f"Database operational status: {db_info}")
    yield
    logger.info("AIVOA.AI shutdown complete.")

app = FastAPI(
    title="AIVOA.AI – AI-Powered Root Cause Analysis (RCA) Module",
    description="Enterprise Pharmaceutical RCA and CAPA Intelligence Suite compliant with ICH Q7, Q9, and Q10.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Endpoints
app.include_router(api_router, prefix="/api")


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AIVOA.AI RCA Engine",
        "database": get_db_status()
    }


# Mount Frontend Static Assets if built
FRONTEND_DIST = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    logger.info(f"Mounting static frontend assets from {FRONTEND_DIST}")
    app.mount(
        "/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
