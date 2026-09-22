import sys
import os

# Vercel Serverless 실행 환경에서 프로젝트 루트 경로를 sys.path에 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app
