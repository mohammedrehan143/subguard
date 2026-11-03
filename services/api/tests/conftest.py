import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

api_root = Path(__file__).resolve().parent.parent
if str(api_root) not in sys.path:
    sys.path.insert(0, str(api_root))

from app.main import app

@pytest.fixture
def client():
    return TestClient(app)
