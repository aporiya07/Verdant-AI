"""
Carbon footprint calculator using simplified DEFRA/EPA emission factors.

Inputs come from the 5-step onboarding questionnaire. All outputs are in
kg CO₂e (carbon dioxide equivalent) per year unless noted.
"""
import json
from pathlib import Path
from typing import TypedDict

_FACTORS_PATH = Path(__file__).parent.parent / "data" / "emission_factors.json"
_factors: dict | None = None


def _get_factors() -> dict:
    global _factors
    if _factors is None:
        with open(_FACTORS_PATH) as f:
            _factors = json.load(f)
    return _factors


# ---------------------------------------------------------------------------
# Per-category calculators
# ---------------------------------------------------------------------------

def calc_transport(
    mode: str,            # car_petrol | car_diesel | car_ev | public_bus | public_train | cycling | walking | motorcycle
    commute_km: float,    # one-way km
    days_per_week: int,
    annual_flights_short: int = 0,
    annual_flights_long: int = 0,
) -> float:
    """Annual transport emissions in kg CO₂e."""
    f = _get_factors()["transport"]
    factor = f.get(f"{mode}_per_km", f["car_petrol_per_km"])
    # commute is round-trip, 48 working weeks/year
    commute_annual = factor * commute_km * 2 * days_per_week * 48
    flights = (
        annual_flights_short * 500 * f["short_haul_flight_per_km"]
        + annual_flights_long * 5000 * f["long_haul_flight_per_km"]
    )
    return round(commute_annual + flights, 2)


def calc_energy(
    monthly_kwh: float,
    renewable_pct: int = 0,      # 0-100
    region: str = "default",
) -> float:
    """Annual home energy emissions in kg CO₂e."""
    f = _get_factors()["energy"]
    grid_key = f"grid_kwh_{region}" if f"grid_kwh_{region}" in f else "grid_kwh_default"
    base_factor = f[grid_key]
    # Renewable energy reduces but doesn't eliminate grid factor
    renewable_adj = 1 - (renewable_pct / 100) * (1 - f["renewable_reduction_factor"])
    annual_kwh = monthly_kwh * 12
    return round(annual_kwh * base_factor * renewable_adj, 2)


def calc_food(
    diet: str,                  # omnivore | flexitarian | vegetarian | vegan
    meals_out_per_week: int = 0,
) -> float:
    """Annual food emissions in kg CO₂e."""
    f = _get_factors()["food"]
    base = f.get(f"{diet}_annual_kg", f["omnivore_annual_kg"])
    meals_out_extra = meals_out_per_week * f["meals_out_per_week_factor"]
    return round(base + meals_out_extra, 2)


def calc_shopping(monthly_spend_usd: float) -> float:
    """Annual shopping emissions in kg CO₂e."""
    f = _get_factors()["shopping"]
    return round(monthly_spend_usd * 12 * f["general_per_usd"], 2)


def calc_waste(
    recycling_habit: str,        # none | some | most | all
    waste_kg_per_week: float = 2.0,
) -> float:
    """Annual waste emissions in kg CO₂e."""
    f = _get_factors()["waste"]
    factor_key = f"{recycling_habit}_factor"
    factor = f.get(factor_key, f["none_factor"])
    landfill_annual = waste_kg_per_week * 52 * f["landfill_per_kg"]
    return round(landfill_annual * factor, 2)


# ---------------------------------------------------------------------------
# GreenScore calculation
# ---------------------------------------------------------------------------

_WEIGHTS = {
    "transport": 0.25,
    "energy": 0.25,
    "food": 0.25,
    "shopping": 0.15,
    "waste": 0.10,
}

_GRADE_MAP = [
    (90, "A+"), (80, "A"), (70, "B+"), (60, "B"),
    (50, "C+"), (40, "C"), (30, "D"), (0, "F"),
]


class CategoryBreakdown(TypedDict):
    transport: float
    energy: float
    food: float
    shopping: float
    waste: float


class FootprintResult(TypedDict):
    total_annual_kg: float
    category_breakdown: CategoryBreakdown
    green_score: int
    grade: str
    category_scores: CategoryBreakdown


def calculate_from_onboarding(answers: dict) -> FootprintResult:
    """
    Given raw onboarding answers, return full footprint result.

    Expected answers keys:
      transport_mode, commute_km, commute_days, annual_flights_short, annual_flights_long,
      monthly_kwh, renewable_pct, region,
      diet, meals_out_per_week,
      monthly_spend_usd,
      recycling_habit, waste_kg_per_week
    """
    transport_kg = calc_transport(
        mode=answers.get("transport_mode", "car_petrol"),
        commute_km=float(answers.get("commute_km", 15)),
        days_per_week=int(answers.get("commute_days", 5)),
        annual_flights_short=int(answers.get("annual_flights_short", 0)),
        annual_flights_long=int(answers.get("annual_flights_long", 0)),
    )
    energy_kg = calc_energy(
        monthly_kwh=float(answers.get("monthly_kwh", 300)),
        renewable_pct=int(answers.get("renewable_pct", 0)),
        region=answers.get("region", "default"),
    )
    food_kg = calc_food(
        diet=answers.get("diet", "omnivore"),
        meals_out_per_week=int(answers.get("meals_out_per_week", 3)),
    )
    shopping_kg = calc_shopping(
        monthly_spend_usd=float(answers.get("monthly_spend_usd", 200)),
    )
    waste_kg = calc_waste(
        recycling_habit=answers.get("recycling_habit", "some"),
        waste_kg_per_week=float(answers.get("waste_kg_per_week", 2)),
    )

    breakdown: CategoryBreakdown = {
        "transport": transport_kg,
        "energy": energy_kg,
        "food": food_kg,
        "shopping": shopping_kg,
        "waste": waste_kg,
    }
    total = sum(breakdown.values())

    benchmarks = _get_factors()["benchmarks"]
    category_scores: dict[str, float] = {}
    for cat, kg in breakdown.items():
        bench_key = f"{cat}_annual_kg"
        bench = benchmarks.get(bench_key, benchmarks["global_average_annual_kg"])
        raw_score = max(0.0, 100.0 - (kg / bench) * 100.0)
        # Cap at 100 to handle very low emitters
        category_scores[cat] = round(min(100.0, raw_score), 1)

    green_score = round(
        sum(_WEIGHTS[cat] * category_scores[cat] for cat in _WEIGHTS)
    )

    grade = "F"
    for threshold, letter in _GRADE_MAP:
        if green_score >= threshold:
            grade = letter
            break

    return FootprintResult(
        total_annual_kg=round(total, 2),
        category_breakdown=breakdown,
        green_score=green_score,
        grade=grade,
        category_scores=category_scores,  # type: ignore
    )
