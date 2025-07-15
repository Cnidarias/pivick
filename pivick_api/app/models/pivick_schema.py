from pydantic import BaseModel
from typing import List, Literal, Optional


# Model for internationalized strings
class I18NString(BaseModel):
    en: str
    de: str


class Measure(BaseModel):
    name: I18NString
    agg: Literal["SUM", "COUNT", "AVG", "MIN", "MAX"]
    column: Optional[str] = None
    description: Optional[I18NString] = None
    format: Optional[str] = None


class Dimension(BaseModel):
    name: I18NString
    table: str
    group: str
    column: Optional[str] = None
    sql: Optional[str] = None
    type: Optional[str] = None
    description: Optional[I18NString] = None


class DimensionGroup(BaseModel):
    id: str
    name: I18NString
    description: Optional[I18NString] = None


class Join(BaseModel):
    type: Literal["left", "inner", "right"]
    left_table: str
    right_table: str
    condition: str


class PivickSchema(BaseModel):
    name: str
    fact_source: str
    joins: List[Join]
    dimensionGroups: List[DimensionGroup]
    dimensions: List[Dimension]
    measures: List[Measure]

    def to_response_model(self, locale: str = "en"):
        # Helper to get localized string or fallback to 'en'
        def get_localized_string(i18n_obj: Optional[I18NString]):
            if i18n_obj is None:
                return None
            return getattr(i18n_obj, locale, i18n_obj.en)

        # Transform measures
        response_measures = []
        for measure in self.measures:
            response_measures.append(
                ResponseMeasure(
                    name=get_localized_string(measure.name),
                    agg=measure.agg,
                    column=measure.column,
                    description=get_localized_string(measure.description),
                    format=measure.format,
                )
            )

        # Transform dimensions
        response_dimensions = []
        for dimension in self.dimensions:
            response_dimensions.append(
                ResponseDimension(
                    name=get_localized_string(dimension.name),
                    table=dimension.table,
                    group=dimension.group,
                    column=dimension.column,
                    sql=dimension.sql,
                    type=dimension.type,
                    description=get_localized_string(dimension.description),
                )
            )

        # Transform dimension groups
        response_dimension_groups = []
        for dg in self.dimensionGroups:
            response_dimension_groups.append(
                ResponseDimensionGroup(
                    id=dg.id, name=get_localized_string(dg.name), description=get_localized_string(dg.description)
                )
            )

        return ResponsePivickSchema(
            name=self.name,
            fact_source=self.fact_source,
            joins=self.joins,
            dimensionGroups=response_dimension_groups,
            dimensions=response_dimensions,
            measures=response_measures,
        )


# --- Response Models (for API output) ---


class ResponseMeasure(BaseModel):
    name: str
    agg: Literal["SUM", "COUNT", "AVG", "MIN", "MAX"]
    column: Optional[str] = None
    description: Optional[str] = None
    format: Optional[str] = None


class ResponseDimension(BaseModel):
    name: str
    table: str
    group: str
    column: Optional[str] = None
    sql: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None


class ResponseDimensionGroup(BaseModel):
    id: str
    name: str
    description: Optional[str] = None


class ResponsePivickSchema(BaseModel):
    name: str
    fact_source: str
    joins: List[Join]
    dimensionGroups: List[ResponseDimensionGroup]
    dimensions: List[ResponseDimension]
    measures: List[ResponseMeasure]
