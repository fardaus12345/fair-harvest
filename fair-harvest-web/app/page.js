import {
  Activity,
  BadgeCheck,
  Camera,
  CalendarClock,
  Coins,
  CreditCard,
  Dna,
  HeartPulse,
  MapPinned,
  Mic,
  PackageCheck,
  QrCode,
  Recycle,
  ShieldCheck,
  Sparkles,
  Sprout,
  Utensils
} from "lucide-react";

import { fairHarvestApi, safeApi } from "../lib/fairHarvestApi.js";

export default async function Home() {
  const [
    farmer,
    trace,
    nutrition,
    product,
    scanner,
    farms,
    rewards,
    health,
    dna,
    soil,
    waste,
    scores,
    consultation,
    delivery,
    cart,
    order
  ] = await Promise.all([
    safeApi(() => fairHarvestApi.farmerScore("seed-farmer-rahim"), fallbackFarmer),
    safeApi(() => fairHarvestApi.trace("seed-product-spinach"), fallbackTrace),
    safeApi(
      () => fairHarvestApi.recommendNutrition({ age: 35, weight: 72, conditions: ["diabetes", "hypertension"], goal: "weight_loss" }),
      fallbackNutrition
    ),
    safeApi(
      () =>
        fairHarvestApi.verifyProduct({
        product_id: "abc123",
        claimed_category: "vegetable",
        seller_history: { completed_orders: 48, late_deliveries: 3, previous_flags: 0 },
        certification_documents: [
          {
            id: "cert-bd-001",
            issuer: "Bangladesh Organic Standard",
            valid_until: "2030-01-01",
            product_category: "vegetable"
          }
        ],
        user_reports: []
      }),
      fallbackProduct
    ),
    safeApi(
      () => fairHarvestApi.analyzeScanner({ image_base64: "cHJvZHVjZS1pbWFnZQ==", produce_type: "spinach" }),
      fallbackScanner
    ),
    safeApi(() => fairHarvestApi.nearbyFarms({ lat: 23.8, lng: 90.4, category: "vegetable", radius_km: 50 }), fallbackFarms),
    safeApi(() => fairHarvestApi.rewards("u001"), fallbackRewards),
    safeApi(
      () =>
        fairHarvestApi.predictHealth({
        food_logs: [
          { date: "2026-06-25", food: "lentils", sugar_g: 8, sodium_mg: 260, calories: 420 },
          { date: "2026-06-26", food: "spinach rice", sugar_g: 5, sodium_mg: 320, calories: 510 }
        ],
        lab_reports: { fasting_glucose: 112, systolic_bp: 128 }
      }),
      fallbackHealth
    ),
    safeApi(
      () => fairHarvestApi.dnaDiet({ user_id: "u001", markers: { lactose_intolerance: true, vitamin_d_risk: true } }),
      fallbackDna
    ),
    safeApi(
      () =>
        fairHarvestApi.soilNutrients({
        farmer_id: "f001",
        crop: "spinach",
        soil_report: { ph: 6.7, nitrogen_ppm: 42, phosphorus_ppm: 18, potassium_ppm: 210, iron_ppm: 7.4 }
      }),
      fallbackSoil
    ),
    safeApi(
      () =>
        fairHarvestApi.donateWaste({
        donor_id: "f001",
        produce_name: "tomato",
        quantity_kg: 12,
        location: { lat: 23.8, lng: 90.4 },
        expires_at: "2026-06-29T10:00:00.000Z"
      }),
      fallbackWaste
    ),
    safeApi(() => fairHarvestApi.productScores("seed-product-spinach"), fallbackScores),
    safeApi(
      () =>
        fairHarvestApi.bookConsultation({
        user_id: "u001",
        specialist_type: "nutritionist",
        preferred_date: "2026-07-01T10:00:00.000Z",
        reason: "Preventive food planning",
        grocery_cart_allowed: true
      }),
      fallbackConsultation
    ),
    safeApi(
      () => fairHarvestApi.scheduleAutoDelivery({ user_id: "u001", approved_meal_plan_id: "plan-001", delivery_days: ["sun", "wed"], budget_bdt: 2200 }),
      fallbackDelivery
    ),
    safeApi(
      async () => {
        await fairHarvestApi.addCartItem("u001-dashboard", { product_id: "abc123", quantity_kg: 1, source: "meal_plan" });
        return fairHarvestApi.pushPrescriptionCart("u001-dashboard", {
          consultation_id: "consult-dashboard",
          doctor_id: "doc-dashboard",
          items: [{ product_id: "spinach-001", quantity_kg: 1 }]
        });
      },
      fallbackCart
    ),
    safeApi(
      async () => {
        await fairHarvestApi.addCartItem("u001-dashboard-checkout", { product_id: "abc123", quantity_kg: 1 });
        return fairHarvestApi.checkout("u001-dashboard-checkout", {
          delivery_address: { line1: "House 12, Green Road", city: "Dhaka" },
          delivery_fee_bdt: 60
        });
      },
      fallbackOrder
    )
  ]);

  const dailyCalories = nutrition.data.daily_calorie_target;
  const firstMeal = nutrition.data.weekly_meal_plan[0];
  const allResults = [farmer, trace, nutrition, product, scanner, farms, rewards, health, dna, soil, waste, scores, consultation, delivery, cart, order];
  const usingDemoData = allResults.some((result) => result.success === false);

  return (
    <main>
      <section className="hero">
        <div className="heroImage" />
        <div className="heroOverlay">
          <div className="heroContent">
            <div className="heroCopy">
              <p className="eyebrow">Trusted organic food ecosystem</p>
              <h1>AI health guidance, verified farmers, and soil-to-plate traceability.</h1>
              <div className="heroActions">
                <a href="#control-room">Open dashboard</a>
                <a className="secondary" href="#trace">Scan trace</a>
              </div>
            </div>
            <TrustCard product={product.data} scanner={scanner.data} />
          </div>
        </div>
      </section>

      <section id="control-room" className="workspace">
        <div className="sectionTitle">
          <p>Operations cockpit</p>
          <h2>Live platform modules</h2>
        </div>

        {usingDemoData && (
          <p className="demoBanner">
            Showing preview/demo values for modules that need a signed-in session or seeded data (nutrition AI, DNA diet, scanner, soil, waste, consultations, and similar future/optional integrations). Sign in and use the marketplace, cart, and orders for real, database-backed data.
          </p>
        )}

        <div className="metricGrid">
          <Metric icon={<Utensils />} label="Daily target" value={`${dailyCalories} kcal`} detail="Personalized for diabetes and hypertension" />
          <Metric icon={<ShieldCheck />} label="Product trust" value={`${product.data.trust_score}%`} detail={product.data.reason} />
          <Metric icon={<BadgeCheck />} label="Farmer score" value={`${farmer.data.reputation_score}%`} detail={farmer.data.badge} />
          <Metric icon={<Camera />} label="Freshness" value={`${scanner.data.freshness_score}%`} detail={scanner.data.recommendation} />
          <Metric icon={<MapPinned />} label="Nearby farms" value={String(farms.data.count)} detail="Ranked by ETA, reputation, and harvest window" />
          <Metric icon={<Coins />} label="Rewards" value={String(rewards.data.reward_points)} detail={`${rewards.data.healthy_order_streak_days}-day healthy streak`} />
          <Metric icon={<HeartPulse />} label="Health risk" value={`${health.data.risk_indicators[0].risk_percent}%`} detail="Preventive foods and consultation signal" />
          <Metric icon={<Recycle />} label="Waste impact" value={`${waste.data.impact_metrics.meals_equivalent} meals`} detail={`${waste.data.impact_metrics.co2_saved_kg} kg CO2 saved`} />
          <Metric icon={<CreditCard />} label="Cart value" value={`${cart.data.subtotal_bdt} BDT`} detail={`${cart.data.items.length} grocery items staged`} />
        </div>

        <div className="dashboardGrid">
          <Panel title="Nutrition Plan" icon={<Sparkles />}>
            <div className="mealPlan">
              <div>
                <span>Breakfast</span>
                <strong>{firstMeal.breakfast}</strong>
              </div>
              <div>
                <span>Lunch</span>
                <strong>{firstMeal.lunch}</strong>
              </div>
              <div>
                <span>Dinner</span>
                <strong>{firstMeal.dinner}</strong>
              </div>
            </div>
          </Panel>

          <Panel title="Farmer Reputation" icon={<Activity />}>
            <div className="scoreDial" style={{ "--score": `${farmer.data.reputation_score}%` }}>
              <span>{farmer.data.reputation_score}</span>
            </div>
            <div>
              <p className="muted">{farmer.data.name}</p>
              <p className="strong">{farmer.data.badge}</p>
            </div>
          </Panel>

          <Panel title="QR Traceability" icon={<QrCode />} id="trace">
            <ol className="timeline">
              <li>
                <span>Harvest</span>
                <strong>{trace.data.harvest_date || "Pending"}</strong>
              </li>
              <li>
                <span>Processing</span>
                <strong>{formatDate(trace.data.processing_timestamp)}</strong>
              </li>
              <li>
                <span>Shipping</span>
                <strong>{formatDate(trace.data.shipping_timestamp)}</strong>
              </li>
            </ol>
          </Panel>

          <Panel title="Bangla Voice Workflow" icon={<Mic />}>
            <div className="voiceBox">
              <Mic />
              <div>
                <p className="strong">Voice actions ready</p>
                <p className="muted">Farmers can upload audio for product, price, and delivery updates.</p>
              </div>
            </div>
          </Panel>

          <Panel title="Farm Origin" icon={<MapPinned />}>
            <div className="mapMock">
              <div className="pin" />
            </div>
            <p className="muted">GPS: {trace.data.farm_gps_location?.lat}, {trace.data.farm_gps_location?.lng}</p>
          </Panel>

          <Panel title="Advanced Health Personalization" icon={<Dna />}>
            <div className="tagList">
              {dna.data.compatible_foods.slice(0, 4).map((food) => (
                <span key={food}>{food}</span>
              ))}
            </div>
            <p className="muted">Avoid: {dna.data.avoid_foods.join(", ") || "None flagged"}</p>
          </Panel>

          <Panel title="Soil-to-Plate Nutrients" icon={<Sprout />}>
            <div className="scoreLine">
              <span>Soil health</span>
              <strong>{soil.data.soil_health_score}%</strong>
            </div>
            <p className="muted">{soil.data.consumer_message}</p>
          </Panel>

          <Panel title="Eco, Health & Pesticide Scores" icon={<PackageCheck />}>
            <div className="scoreStack">
              <ScoreRow label="Eco" value={scores.data.eco_score} />
              <ScoreRow label="Health" value={scores.data.health_score} />
              <ScoreRow label="Pesticide risk" value={scores.data.pesticide_score} invert />
            </div>
          </Panel>

          <Panel title="Care & Auto Delivery" icon={<CalendarClock />}>
            <div className="mealPlan">
              <div>
                <span>Consultation</span>
                <strong>{consultation.data.status}</strong>
              </div>
              <div>
                <span>Meal subscription</span>
                <strong>{delivery.data.status}</strong>
              </div>
            </div>
          </Panel>

          <Panel title="Cart & Checkout" icon={<CreditCard />}>
            <div className="cartList">
              {cart.data.items.map((item) => (
                <div key={`${item.product_id}-${item.source}`}>
                  <span>{item.name}</span>
                  <strong>{item.quantity_kg} kg</strong>
                  <small>{item.source}</small>
                </div>
              ))}
            </div>
            <div className="checkoutLine">
              <span>{order.data.status}</span>
              <strong>{order.data.total_bdt} BDT</strong>
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

function TrustCard({ product, scanner }) {
  return (
    <article className="trustCard" aria-label="Product trust summary">
      <div className="splitLine">
        <div>
          <span>Organic Spinach</span>
          <strong>Rahim Uddin Farm</strong>
        </div>
        <span className="chainChip">On-chain</span>
      </div>
      <ScoreRow label="Freshness" value={scanner.freshness_score ?? 94} />
      <ScoreRow label="Trust" value={product.trust_score ?? 98} />
      <ScoreRow label="Pesticide risk" value={8} invert />
      <div className="qrStrip">QR FH-ABC123 · Eco A+</div>
    </article>
  );
}

function Metric({ icon, label, value, detail }) {
  return (
    <article className="metric">
      <div className="icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function Panel({ title, icon, children, id }) {
  return (
    <article className="panel" id={id}>
      <header>
        <div className="icon">{icon}</div>
        <h3>{title}</h3>
      </header>
      {children}
    </article>
  );
}

function ScoreRow({ label, value, invert = false }) {
  const percent = Math.max(0, Math.min(100, value));
  return (
    <div className="scoreRow">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="bar">
        <span style={{ width: `${invert ? 100 - percent : percent}%` }} />
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(
    new Date(value)
  );
}

const fallbackFarmer = {
  success: false,
  data: { farmer_id: "f001", name: "Rahim Uddin", reputation_score: 88, badge: "Trusted Seller" },
  message: "Offline fallback"
};

const fallbackTrace = {
  success: false,
  data: {
    product_id: "abc123",
    farm_gps_location: { lat: 23.8103, lng: 90.4125 },
    harvest_date: "2026-06-24",
    processing_timestamp: "2026-06-24T09:40:00.000Z",
    shipping_timestamp: "2026-06-24T15:20:00.000Z"
  },
  message: "Offline fallback"
};

const fallbackNutrition = {
  success: false,
  data: {
    daily_calorie_target: 1200,
    weekly_meal_plan: [{ breakfast: "oats with guava", lunch: "brown rice and lentils", dinner: "fish and greens" }]
  },
  message: "Offline fallback"
};

const fallbackProduct = {
  success: false,
  data: { product_id: "abc123", trust_score: 91, status: "verified", reason: "seller and certification checks passed" },
  message: "Offline fallback"
};

const fallbackScanner = {
  success: false,
  data: { freshness_score: 84, chemical_risk_score: 22, recommendation: "Safe to consume within 2 days" },
  message: "Offline fallback"
};

const fallbackFarms = {
  success: false,
  data: { farms: [], count: 2 },
  message: "Offline fallback"
};

const fallbackRewards = {
  success: false,
  data: { reward_points: 1240, healthy_order_streak_days: 9, badges: ["Organic Warrior", "7-Day Streak"] },
  message: "Offline fallback"
};

const fallbackHealth = {
  success: false,
  data: {
    risk_indicators: [{ condition: "pre_diabetic_risk", risk_percent: 62 }],
    preventive_food_recommendations: ["spinach", "lentils"],
    doctor_consultation_recommended: false
  },
  message: "Offline fallback"
};

const fallbackDna = {
  success: false,
  data: { compatible_foods: ["leafy greens", "lentils", "organic eggs"], avoid_foods: ["milk"] },
  message: "Offline fallback"
};

const fallbackSoil = {
  success: false,
  data: { soil_health_score: 91, consumer_message: "This spinach is iron-rich based on uploaded soil data" },
  message: "Offline fallback"
};

const fallbackWaste = {
  success: false,
  data: { impact_metrics: { meals_equivalent: 29, co2_saved_kg: 22.8 } },
  message: "Offline fallback"
};

const fallbackScores = {
  success: false,
  data: { eco_score: 78, health_score: 90, pesticide_score: 16 },
  message: "Offline fallback"
};

const fallbackConsultation = {
  success: false,
  data: { status: "requested" },
  message: "Offline fallback"
};

const fallbackDelivery = {
  success: false,
  data: { status: "scheduled" },
  message: "Offline fallback"
};

const fallbackCart = {
  success: false,
  data: {
    user_id: "u001-dashboard",
    items: [
      { product_id: "abc123", name: "Organic Spinach", quantity_kg: 1, price_bdt: 120, source: "meal_plan" },
      { product_id: "spinach-001", name: "Iron Rich Spinach", quantity_kg: 1, price_bdt: 135, source: "prescription" }
    ],
    subtotal_bdt: 255
  },
  message: "Offline fallback"
};

const fallbackOrder = {
  success: false,
  data: { status: "preview", total_bdt: 315 },
  message: "Offline fallback"
};
