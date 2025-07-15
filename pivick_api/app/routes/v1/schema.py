from fastapi.routing import APIRouter

router = APIRouter()


@router.get("/all")
async def get_all():
    return {}
