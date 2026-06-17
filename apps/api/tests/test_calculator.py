"""
Unit tests for the carbon calculator service.
Tests the core scoring logic that drives the product's GreenScore.
"""
import pytest
from app.services.carbon_calculator import (
    calc_energy,
    calc_food,
    calc_shopping,
    calc_transport,
    calc_waste,
    calculate_from_onboarding,
)


class TestTransportCalc:
    def test_car_petrol_emissions(self):
        kg = calc_transport("car_petrol", commute_km=15, days_per_week=5)
        # 0.21 * 15 * 2 * 5 * 48 ≈ 1512 kg
        assert 1400 < kg < 1700

    def test_cycling_zero_emissions(self):
        kg = calc_transport("cycling", commute_km=10, days_per_week=5)
        assert kg == 0.0

    def test_ev_lower_than_petrol(self):
        ev = calc_transport("car_ev", commute_km=15, days_per_week=5)
        petrol = calc_transport("car_petrol", commute_km=15, days_per_week=5)
        assert ev < petrol

    def test_flights_add_emissions(self):
        no_flights = calc_transport("public_train", commute_km=5, days_per_week=5)
        with_flights = calc_transport("public_train", commute_km=5, days_per_week=5, annual_flights_long=2)
        assert with_flights > no_flights


class TestEnergyCalc:
    def test_renewables_reduce_emissions(self):
        no_renewable = calc_energy(300, renewable_pct=0)
        full_renewable = calc_energy(300, renewable_pct=100)
        assert full_renewable < no_renewable

    def test_zero_kwh_minimal_emissions(self):
        kg = calc_energy(0)
        assert kg == 0.0

    def test_higher_kwh_higher_emissions(self):
        low = calc_energy(100)
        high = calc_energy(500)
        assert high > low


class TestFoodCalc:
    def test_vegan_lowest_footprint(self):
        vegan = calc_food("vegan")
        vegetarian = calc_food("vegetarian")
        omnivore = calc_food("omnivore")
        assert vegan < vegetarian < omnivore

    def test_meals_out_add_emissions(self):
        base = calc_food("omnivore", meals_out_per_week=0)
        with_meals = calc_food("omnivore", meals_out_per_week=7)
        assert with_meals > base


class TestShoppingCalc:
    def test_zero_spend_zero_emissions(self):
        assert calc_shopping(0) == 0.0

    def test_higher_spend_higher_emissions(self):
        assert calc_shopping(500) > calc_shopping(100)


class TestWasteCalc:
    def test_all_recycling_lowest(self):
        none = calc_waste("none")
        all_recyc = calc_waste("all")
        assert all_recyc < none


class TestFullCalculation:
    def test_complete_onboarding_returns_valid_score(self):
        answers = {
            "transport_mode": "car_petrol",
            "commute_km": 15,
            "commute_days": 5,
            "annual_flights_short": 1,
            "annual_flights_long": 0,
            "monthly_kwh": 300,
            "renewable_pct": 0,
            "region": "default",
            "diet": "omnivore",
            "meals_out_per_week": 3,
            "monthly_spend_usd": 200,
            "recycling_habit": "some",
            "waste_kg_per_week": 2,
        }
        result = calculate_from_onboarding(answers)
        assert 0 <= result["green_score"] <= 100
        assert result["grade"] in ["A+", "A", "B+", "B", "C+", "C", "D", "F"]
        assert result["total_annual_kg"] > 0
        assert set(result["category_breakdown"].keys()) == {"transport", "energy", "food", "shopping", "waste"}

    def test_eco_lifestyle_scores_higher(self):
        eco = calculate_from_onboarding({
            "transport_mode": "cycling",
            "commute_km": 5,
            "commute_days": 5,
            "monthly_kwh": 100,
            "renewable_pct": 100,
            "diet": "vegan",
            "meals_out_per_week": 0,
            "monthly_spend_usd": 50,
            "recycling_habit": "all",
            "waste_kg_per_week": 0.5,
        })
        average = calculate_from_onboarding({
            "transport_mode": "car_petrol",
            "commute_km": 20,
            "commute_days": 5,
            "monthly_kwh": 400,
            "renewable_pct": 0,
            "diet": "omnivore",
            "meals_out_per_week": 5,
            "monthly_spend_usd": 500,
            "recycling_habit": "none",
            "waste_kg_per_week": 3,
        })
        assert eco["green_score"] > average["green_score"]

    def test_total_equals_sum_of_categories(self):
        result = calculate_from_onboarding({
            "transport_mode": "car_petrol", "commute_km": 10, "commute_days": 5,
            "monthly_kwh": 200, "renewable_pct": 0,
            "diet": "vegetarian", "meals_out_per_week": 2,
            "monthly_spend_usd": 150, "recycling_habit": "some", "waste_kg_per_week": 1.5,
        })
        breakdown_sum = round(sum(result["category_breakdown"].values()), 2)
        assert abs(breakdown_sum - result["total_annual_kg"]) < 0.1
