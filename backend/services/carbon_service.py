"""
Carbon emission calculation service for Verdant AI.
All emission factors are in kg CO2e per unit.
"""

from typing import Dict, Any


# --- Emission Factor Constants ---

TRANSPORT_FACTORS: Dict[str, float] = {
    "car_petrol": 0.192,       # per km
    "car_diesel": 0.171,       # per km
    "car_electric": 0.053,     # per km
    "motorcycle": 0.114,       # per km
    "bus": 0.089,              # per km
    "train": 0.041,            # per km
    "bike": 0.0,               # per km
    "walking": 0.0,            # per km
    "flight_short": 0.255,     # per km
    "flight_long": 0.195,      # per km
    "rideshare": 0.160,        # per km
}

FOOD_FACTORS: Dict[str, float] = {
    "vegan": 1.5,              # kg CO2e per day
    "vegetarian": 2.5,         # kg CO2e per day
    "pescatarian": 3.0,        # kg CO2e per day
    "omnivore_low_meat": 4.5,  # kg CO2e per day
    "omnivore_high_meat": 7.2, # kg CO2e per day
}

ENERGY_FACTORS: Dict[str, float] = {
    "kwh_coal": 0.82,          # per kWh
    "kwh_mixed": 0.45,         # per kWh (avg grid)
    "kwh_renewable": 0.05,     # per kWh
}

SHOPPING_FACTORS: Dict[str, float] = {
    "fashion_item": 15.0,      # per item
    "electronics_small": 20.0, # per item
    "electronics_large": 80.0, # per item
    "online_delivery": 0.5,    # per parcel
}

WASTE_FACTORS: Dict[str, float] = {
    "landfill_kg": 0.45,       # per kg waste
    "recycled_kg": 0.02,       # per kg recycled
}

LEVEL_THRESHOLDS: list[int] = [0, 500, 1500, 3500, 7000, 12000]
LEVEL_NAMES: list[str] = [
    "Seed", "Sapling", "Forest Guardian", "Earth Protector", "Climate Champion"
]
SUSTAINABILITY_GRADE_THRESHOLDS: list[tuple[float, str]] = [
    (3.0, "A+"), (5.0, "A"), (8.0, "B"), (12.0, "C"), (18.0, "D"), (float("inf"), "F")
]


def calculate_transport_emissions(details: Dict[str, Any]) -> float:
    """
    Calculate monthly transport emissions in kg CO2e.

    Args:
        details: Dict with keys like 'mode', 'km_per_day'.

    Returns:
        Monthly emissions in kg CO2e.
    """
    mode = details.get("mode", "car_petrol")
    km_per_day = float(details.get("km_per_day", 0))
    factor = TRANSPORT_FACTORS.get(mode, TRANSPORT_FACTORS["car_petrol"])
    return round(km_per_day * factor * 30, 2)


def calculate_food_emissions(details: Dict[str, Any]) -> float:
    """
    Calculate monthly food emissions in kg CO2e.

    Args:
        details: Dict with key 'diet_type'.

    Returns:
        Monthly emissions in kg CO2e.
    """
    diet = details.get("diet_type", "omnivore_low_meat")
    factor = FOOD_FACTORS.get(diet, FOOD_FACTORS["omnivore_low_meat"])
    return round(factor * 30, 2)


def calculate_energy_emissions(details: Dict[str, Any]) -> float:
    """
    Calculate monthly home energy emissions in kg CO2e.

    Args:
        details: Dict with keys 'kwh_per_month', 'energy_source'.

    Returns:
        Monthly emissions in kg CO2e.
    """
    kwh = float(details.get("kwh_per_month", 0))
    source = details.get("energy_source", "kwh_mixed")
    factor = ENERGY_FACTORS.get(source, ENERGY_FACTORS["kwh_mixed"])
    return round(kwh * factor, 2)


def calculate_shopping_emissions(details: Dict[str, Any]) -> float:
    """
    Calculate monthly shopping emissions in kg CO2e.

    Args:
        details: Dict with keys 'fashion_items', 'electronics_small',
                 'electronics_large', 'online_parcels'.

    Returns:
        Monthly emissions in kg CO2e.
    """
    total = 0.0
    total += float(details.get("fashion_items", 0)) * SHOPPING_FACTORS["fashion_item"]
    total += float(details.get("electronics_small", 0)) * SHOPPING_FACTORS["electronics_small"]
    total += float(details.get("electronics_large", 0)) * SHOPPING_FACTORS["electronics_large"]
    total += float(details.get("online_parcels", 0)) * SHOPPING_FACTORS["online_delivery"]
    return round(total, 2)


def calculate_waste_emissions(details: Dict[str, Any]) -> float:
    """
    Calculate monthly waste emissions in kg CO2e.

    Args:
        details: Dict with keys 'waste_kg', 'recycled_kg'.

    Returns:
        Monthly emissions in kg CO2e.
    """
    waste_kg = float(details.get("waste_kg", 0))
    recycled_kg = float(details.get("recycled_kg", 0))
    return round(
        (waste_kg * WASTE_FACTORS["landfill_kg"]) + (recycled_kg * WASTE_FACTORS["recycled_kg"]),
        2,
    )


def dispatch_emission_calculator(category: str, details: Dict[str, Any]) -> float:
    """
    Dispatch emission calculation to the correct function based on category.

    Args:
        category: One of 'transport', 'food', 'energy', 'shopping', 'waste'.
        details: Category-specific detail dict.

    Returns:
        Monthly emissions in kg CO2e.

    Raises:
        ValueError: If the category is unknown.
    """
    dispatch: Dict[str, Any] = {
        "transport": calculate_transport_emissions,
        "food": calculate_food_emissions,
        "energy": calculate_energy_emissions,
        "shopping": calculate_shopping_emissions,
        "waste": calculate_waste_emissions,
    }
    calculator = dispatch.get(category)
    if not calculator:
        raise ValueError(f"Unknown emission category: {category}")
    return calculator(details)


def get_sustainability_grade(daily_kg: float) -> str:
    """
    Get a letter grade based on daily kg CO2e.

    Args:
        daily_kg: Daily emissions in kg CO2e.

    Returns:
        Letter grade string.
    """
    for threshold, grade in SUSTAINABILITY_GRADE_THRESHOLDS:
        if daily_kg <= threshold:
            return grade
    return "F"


def get_level_name(xp: int) -> str:
    """
    Determine the user's level name from total XP.

    Args:
        xp: Total XP points.

    Returns:
        Level name string.
    """
    for i, threshold in enumerate(reversed(LEVEL_THRESHOLDS)):
        if xp >= threshold:
            level_index = len(LEVEL_THRESHOLDS) - 1 - i
            return LEVEL_NAMES[min(level_index, len(LEVEL_NAMES) - 1)]
    return LEVEL_NAMES[0]
