const CONDITION_FOODS = {
  diabetes: ["spinach", "lentils", "bitter gourd"],
  hypertension: ["banana", "oats", "leafy greens"],
  high_cholesterol: ["oats", "walnuts", "fish"],
  thyroid: ["brazil nuts", "iodized salt", "eggs"]
};

const MEAL_COMBOS = [
  { breakfast: "oats with guava", lunch: "brown rice and lentils", dinner: "fish and greens" },
  { breakfast: "egg and toast", lunch: "chicken and vegetables", dinner: "lentil soup and rice" },
  { breakfast: "spinach paratha", lunch: "fish curry and rice", dinner: "mixed vegetable khichuri" }
];

const GOAL_CALORIE_ADJUSTMENT = { weight_loss: -400, muscle_gain: 300, maintenance: 0, general_health: -100 };

export function computeDailyCalories({ age, weight, goal }) {
  const baseMetabolicRate = 10 * weight + 6.25 * 170 - 5 * age + 5;
  const activityAdjusted = baseMetabolicRate * 1.4;
  return Math.round(activityAdjusted + (GOAL_CALORIE_ADJUSTMENT[goal] ?? 0));
}

export function recommendedFoodsFor(conditions = []) {
  const foods = [...new Set(conditions.flatMap((condition) => CONDITION_FOODS[condition] || []))];
  return foods.length ? foods : ["brown rice", "leafy greens", "lentils"];
}

export function buildWeeklyPlan() {
  return Array.from({ length: 7 }, (_, index) => ({ day: index + 1, ...MEAL_COMBOS[index % MEAL_COMBOS.length] }));
}
