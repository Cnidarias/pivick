from fastapi import FastAPI
from fastapi.routing import APIRouter

from routes.v1 import schema

description = """
API for managing schemas and executing pivot type queries against a database

* * * * * * * * * *
### Copyright
Pascal Roessner
"""

app = FastAPI(
    root_path="/pivick-api",
    title="Pivick Rest API",
    description=description,
    contact={
        "name": "Pascal Roessner",
        "url": "https://cnidarias.net",
    },
    version="1",
)

v1_router = APIRouter()
v1_router.include_router(schema.router, prefix="/schema", tags=["schema"])

app.include_router(v1_router, prefix="/v1")
