"use client";

import { useState } from "react";
import { getNutritionRecommendation, logMeal } from "../../lib/api.js";

export default function NutritionPage() {
  const [form, setForm] = useState({ age: 35, weight: 72, conditions: ["diabetes"], goal: "weight_loss" });
  const [status, setStatus] = useState("idle");
  const [plan, setPlan] = useState(null);
  const [openDay, setOpenDay] = useState(0);

  async function submit(event) {
    event.preventDefault();
    setStatus("loading");
    try {
      const data = await getNutritionRecommendation(form);
      setPlan(data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  async function savePlan() {
    await logMeal({ meal_type: "breakfast", food_items: ["spinach", "brown rice"], date: new Date().toISOString() }).catch(() => null);
  }

  return (
    <main className="appPage">
      <header className="pageHeader"><div><p className="eyebrow">AI nutrition</p><h1>Build a health-aware weekly food plan.</h1></div></header>
      <section className="formGrid">
        <form className="toolPanel" onSubmit={submit}>
          <label>Age<input type="number" value={form.age} onChange={(event) => setForm({ ...form, age: Number(event.target.value) })} /></label>
          <label>Weight kg<input type="number" value={form.weight} onChange={(event) => setForm({ ...form, weight: Number(event.target.value) })} /></label>
          <div className="fieldSet"><span>Conditions</span>{["diabetes", "hypertension", "high_cholesterol", "thyroid"].map((item) => <label key={item} className="checkLine"><input type="checkbox" checked={form.conditions.includes(item)} onChange={(event) => setForm({ ...form, conditions: event.target.checked ? [...form.conditions, item] : form.conditions.filter((value) => value !== item) })} />{item.replace("_", " ")}</label>)}</div>
          <div className="fieldSet"><span>Goal</span>{["weight_loss", "muscle_gain", "maintenance", "general_health"].map((item) => <label key={item} className="checkLine"><input type="radio" name="goal" checked={form.goal === item} onChange={() => setForm({ ...form, goal: item })} />{item.replace("_", " ")}</label>)}</div>
          <button className="commandButton" type="submit">Get my plan</button>
        </form>

        <div className="toolPanel">
          {status === "idle" ? <p className="muted">Your result appears here after analysis.</p> : null}
          {status === "loading" ? <div><div className="spinner" /><p className="muted">Our AI is analyzing your profile...</p><div className="progressFill" /></div> : null}
          {status === "error" ? <div><p className="strong">Could not generate plan.</p><button className="ghostButton" onClick={submit}>Retry</button></div> : null}
          {plan ? (
            <div className="resultStack">
              <article className="scoreLine"><span>Daily calories</span><strong>{plan.daily_calorie_target || plan.calorie_target}</strong></article>
              <div className="tagList">{(plan.personalized_food_list?.[0]?.foods || plan.recommended_foods || ["brown rice", "leafy greens"]).map((food) => <span key={food}>{food}</span>)}</div>
              {(plan.weekly_meal_plan || plan.meal_plan || []).map((day, index) => (
                <div className="accordion" key={index}>
                  <button onClick={() => setOpenDay(openDay === index ? -1 : index)}>Day {day.day || index + 1}</button>
                  {openDay === index ? <p>{day.breakfast} · {day.lunch} · {day.dinner}</p> : null}
                </div>
              ))}
              <div className="actionRow"><a href="/marketplace">Shop these foods</a>{typeof window !== "undefined" && window.localStorage.getItem("fairHarvestToken") ? <button onClick={savePlan}>Save this plan</button> : null}</div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
