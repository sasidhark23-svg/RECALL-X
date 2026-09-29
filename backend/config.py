import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    HINDSIGHT_API_URL: str = os.getenv("HINDSIGHT_API_URL", "http://localhost:8888")
    HINDSIGHT_API_KEY: str = os.getenv("HINDSIGHT_API_KEY", "")
    HINDSIGHT_BANK_ID: str = os.getenv("HINDSIGHT_BANK_ID", "recall-x-incidents")
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./recall_x.db")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()
