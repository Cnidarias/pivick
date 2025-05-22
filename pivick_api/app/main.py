import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.routing import APIRouter
from starlette.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(
    root_path=os.getenv("API_ROOT_PATH", "/pivick-api"),
    title="PIVICK Rest API",
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

app.include_router(v1_api_router, prefix="/v1")
