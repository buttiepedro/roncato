import os
from dotenv import load_dotenv

load_dotenv()

class Config:
  SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
  SQLALCHEMY_TRACK_MODIFICATIONS = False
  JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'esta-es-una-clave-super-secreta-y-muy-larga-para-mi-proyecto-123')
  CORS_ORIGINS = os.getenv('CORS_ORIGIN', '*').split(',')
  # Webhooks
  N8N_STATUS_WEBHOOK = os.getenv('N8N_STATUS_WEBHOOK')
  N8N_FINALIZE_WEBHOOK = os.getenv('N8N_FINALIZE_WEBHOOK')