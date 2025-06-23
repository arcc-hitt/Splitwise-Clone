from fastapi import FastAPI

app = FastAPI(
    title="Splitwise Clone API",
    description="A simplified Splitwise-like service for managing groups, expenses, and balances.",
    version="0.1.0"
)

@app.get("/")
async def root():
    return {"message": "🍻 Welcome to your Splitwise Clone API!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
