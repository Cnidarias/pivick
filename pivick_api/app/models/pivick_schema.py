from pydantic import BaseModel
from typing import List, Literal


class Measure(BaseModel):
    name: str
    column: str
    agg: Literal["SUM", "COUNT", "AVG", "MIN", "MAX"]


class DimensionAttribute(BaseModel):
    name: str
    column: str


class Dimension(BaseModel):
    name: str
    table: str
    attributes: List[DimensionAttribute]


class Join(BaseModel):
    type: Literal["left", "inner", "right"]
    left_table: str
    right_table: str
    condition: str


class PivickSchema(BaseModel):
    name: str
    fact_source: str
    joins: List[Join]
    dimensions: List[Dimension]
    measures: List[Measure]
