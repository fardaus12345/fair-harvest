"use client";

import { useEffect, useState } from "react";
import { Coins, Flame } from "lucide-react";
import { getRewards } from "../../lib/api.js";
import { useSession } from "../../components/auth/useSession.js";

const badges = [
  { points: 100, name: "First Harvest" },
  { points: 500, name: "Organic Warrior" },
  { points: 1000, name: "7-Day Streak" },
  { points: 2500, name: "Zero Pesticide Week" },
  { points: 5000, name: "Health Champion" }
];

export default function RewardsPage() {
  const { user, loading: sessionLoading } = useSession();
  const [rewards, setRewards] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionLoading || !user) return;
    getRewards(user.id).then(setRewards).catch((err) => setError(err.message || "Could not load rewards"));
  }, [sessionLoading, user]);

  if (!sessionLoading && !user) {
    return (
      <main className="appPage">
        <div className="toolPanel">
          <p className="muted">Log in to see your rewards.</p>
          <a className="commandButton" href="/auth/customer">Go to login</a>
        </div>
      </main>
    );
  }

  if (!rewards) {
    return (
      <main className="appPage">
        <div className="toolPanel">
          <p className="muted">{error || "Loading your rewards..."}</p>
        </div>
      </main>
    );
  }

  const points = rewards.points || 0;
  const next = badges.find((badge) => badge.points > points) || badges[badges.length - 1];

  return (
    <main className="appPage">
      <header className="pageHeader"><div><p className="eyebrow">Rewards</p><h1>Healthy habits earn marketplace benefits.</h1></div></header>
      <section className="metricGrid compact">
        <article className="metric"><Coins /><span>Total points</span><strong>{points}</strong></article>
        <article className="metric"><Flame /><span>Distinct active days</span><strong>{rewards.streak_days} days</strong></article>
        <article className="metric"><span>Next badge</span><strong>{next.name}</strong></article>
      </section>
      <section className="toolPanel">
        <h2>Progress</h2>
        <div className="bar"><span style={{ width: `${Math.min(100, (points / next.points) * 100)}%` }} /></div>
        <div className="badgeGrid">{badges.map((badge) => <article className={points >= badge.points ? "rewardBadge earned" : "rewardBadge"} key={badge.name}><strong>{badge.name}</strong><span>{badge.points} pts</span></article>)}</div>
      </section>
      <section className="toolPanel">
        <h2>Recent activity</h2>
        {rewards.recent_activity && rewards.recent_activity.length > 0 ? (
          <div className="resultStack">
            {rewards.recent_activity.map((entry, index) => (
              <div className="splitLine" key={`${entry.created_at}-${index}`}>
                <span>{entry.reason}</span>
                <strong>+{entry.points}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No rewards activity yet — points are earned from real completed purchases.</p>
        )}
      </section>
    </main>
  );
}
