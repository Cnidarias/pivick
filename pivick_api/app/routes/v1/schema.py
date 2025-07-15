from fastapi.routing import APIRouter
import yaml
from typing import List
from models.pivick_schema import PivickSchema

router = APIRouter()


def load_models():
    import os

    print(os.getcwd())
    with open("models.yml", "r") as f:
        model_data = yaml.safe_load(f)
    return [PivickSchema(**model_data)]


models = load_models()


@router.get("/all", response_model=List[PivickSchema])
async def get_all_models():
    return models


@router.get("/{model_name}", response_model=PivickSchema)
async def get_model(model_name: str):
    for model in models:
        if model.name == model_name:
            return model
    return {"error": "Model not found"}
