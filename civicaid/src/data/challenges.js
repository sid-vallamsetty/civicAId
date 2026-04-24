export const challenges = [
  { id: 1, title: "Email your city council rep", tier: "engage", points: 75, description: "Write to your rep about any local issue you care about." },
  { id: 2, title: "Sign a local petition", tier: "spark", points: 25, description: "Find and sign a petition affecting your neighborhood." },
  { id: 3, title: "Attend a town hall", tier: "lead", points: 300, description: "Show up to a local government meeting." },
  { id: 4, title: "Register to vote", tier: "spark", points: 20, description: "Register or confirm your registration status." },
  { id: 5, title: "Speak at city council", tier: "lead", points: 500, description: "Use your public comment time at a council meeting." }
]

export const ranks = [
  { label: "Seed", min: 0 },
  { label: "Voice", min: 100 },
  { label: "Neighbor", min: 300 },
  { label: "Advocate", min: 750 },
  { label: "Civic Champion", min: 1500 }
]

export function rankFor(points) {
  let current = ranks[0]
  for (const r of ranks) {
    if (points >= r.min) current = r
  }
  return current
}
