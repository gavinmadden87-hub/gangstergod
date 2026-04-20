import os
import tempfile
import pytest
from app.core import db

@pytest.fixture(autouse=True)
def isolate_db(monkeypatch):
    tmp = tempfile.NamedTemporaryFile(delete=False)
    monkeypatch.setattr(db, "DB_PATH", tmp.name)
    db.init_db()
    yield
    os.unlink(tmp.name)