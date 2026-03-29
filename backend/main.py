from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded

    HAS_SLOWAPI = True
except Exception:  # noqa: BLE001
    HAS_SLOWAPI = False

from rate_limiter import limiter
from routers.hackathon import router as hackathon_router

app = FastAPI(title="Hackathon API")
app.state.limiter = limiter
if HAS_SLOWAPI:
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(hackathon_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
