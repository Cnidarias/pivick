from fastapi.routing import APIRouter
from fastapi import Query
import yaml
from typing import List, Optional
from models.pivick_schema import PivickSchema, ResponsePivickSchema

router = APIRouter()


def load_models():
    import os

    print(os.getcwd())
    with open("models.yml", "r") as f:
        model_data = yaml.safe_load(f)
    return [PivickSchema(**model_data)]


models = load_models()


@router.get("/all", response_model=List[ResponsePivickSchema])
async def get_all_models(locale: Optional[str] = Query("en", description="Locale for i18n fields (e.g., 'en', 'de')")):
    return [model.to_response_model(locale) for model in models]


@router.get("/{model_name}", response_model=ResponsePivickSchema)
async def get_model(
    model_name: str, locale: Optional[str] = Query("en", description="Locale for i18n fields (e.g., 'en', 'de')")
):
    for model in models:
        if model.name == model_name:
            return model.to_response_model(locale)
    return {"error": "Model not found"}
