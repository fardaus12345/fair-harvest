"use client";

import { useEffect, useState } from "react";
import { Coins, Flame } from "lucide-react";
import { getRewards } from "../../lib/api.js";

const badges = [
  { points: 100, name: "First Harvest" },
  { points: 500, name: "Organic Warrior" },
  { points: 1000, name: "7-Day Streak" },
  { points: 2500, name: "Zero Pesticide Week" },
  { points: 5000, name: "Health Champion" }
];

export default function RewardsPage() {
  const [rewards, setRewards] = useState({ points: 1240, streak_days: 9, badges: ["Organic Warrior", "7-Day Streak"] });

  useEffect(() => {
    getRewards("u001").then(setRewards).catch(() => null);
  }, []);

  const next = badges.find((badge) => badge.points > (rewards.points || rewards.reward_points)) || badges[badges.length - 1];
  const points = rewards.points || rewards.reward_points || 0;

  return (
    <main className="appPage">
      <header className="pageHeader"><div><p className="eyebrow">Rewards</p><h1>Healthy habits earn marketplace benefits.</h1></div></header>
      <section className="metricGrid compact">
        <article className="metric"><Coins /><span>Total points</span><strong>{points}</strong></article>
        <article className="metric"><Flame /><span>Streak</span><strong>{rewards.streak_days || rewards.healthy_order_streak_days} days</strong></article>
        <article className="metric"><span>Next badge</span><strong>{next.name}</strong></article>
      </section>
      <section className="toolPanel">
        <h2>Progress</h2>
        <div className="bar"><span style={{ width: `${Math.min(100, (points / next.points) * 100)}%` }} /></div>
        <div className="badgeGrid">{badges.map((badge) => <article className={points >= badge.points ? "rewardBadge earned" : "rewardBadge"} key={badge.name}><strong>{badge.name}</strong><span>{badge.points} pts</span></article>)}</div>
      </section>
      <section className="toolPanel">
        <h2>Recent activity</h2>
        <div className="resultStack"><div className="splitLine"><span>Healthy purchase</span><strong>+20</strong></div><div className="splitLine"><span>Product scan</span><strong>+5</strong></div><div className="splitLine"><span>Meal log</span><strong>+8</strong></div></div>
      </section>
    </main>
  );
}
