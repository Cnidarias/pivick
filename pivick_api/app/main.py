import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.routing import APIRouter
from starlette.middleware.cors import CORSMiddleware

from .routes.v1 import pivick


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(
    root_path=os.getenv("PIVICK_API_ROOT_PATH", "/pivick-api"),
    title="Pivick Rest API",
    contact={
        "name": "Pascal Roessner",
        "url": "https://cnidarias.net",
    },
    version="1",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

v1_api_router = APIRouter()
v1_api_router.include_router(pivick.router, prefix="/pivick", tags=["pivick"])

app.include_router(v1_api_router, prefix="/v1")
