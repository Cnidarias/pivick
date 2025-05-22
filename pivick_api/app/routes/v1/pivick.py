from fastapi import APIRouter

router = APIRouter()


@router.get("/fields")
async def get_fields():
    return ["yes", "this", "is", "a", "field"]
