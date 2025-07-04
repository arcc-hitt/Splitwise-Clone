from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database, models

# Import your API routers
from routers.groups import router as groups_router
from routers.expenses import router as expenses_router
from routers.balances import router as balances_router
from routers.settlements import router as settlements_router
from routers.chat import router as chat_router

# Initialize FastAPI app
app = FastAPI(
    title="Splitwise Clone API",
    description="A simple Splitwise-like expense tracking API built with FastAPI and PostgreSQL.",
    version="0.1.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all database tables
models.Base.metadata.create_all(bind=database.engine)

# Include routers
app.include_router(groups_router)
app.include_router(expenses_router)
app.include_router(balances_router)
app.include_router(settlements_router)
app.include_router(chat_router)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Splitwise Clone API"}

# To run:
#   uvicorn main:app --reload --host 0.0.0.0 --port 8000