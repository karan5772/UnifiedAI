from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict

class VehicleAnalyzeFilters(BaseModel):
    makes: Optional[List[str]] = None
    model_years: Optional[Dict[str, int]] = None  # {"start": 2020, "end": 2024}
    min_electric_range: Optional[int] = None
    vehicle_type: Optional[str] = None  # BEV or PHEV

class VehicleAnalyzeRequest(BaseModel):
    filters: Optional[VehicleAnalyzeFilters] = None
    group_by: Literal["county", "make", "model_year"]

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, le=100)
