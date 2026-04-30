export const challenges = [
  { id: 1, title: "Voter Registration & Turnout Efforts", tier: "lead", points: 500, description: "Help others register, check status, or get out the vote." },
  { id: 2, title: "Food Distribution / Pantry Support", tier: "lead", points: 480, description: "Volunteer at or support a food pantry or distribution site." },
  { id: 3, title: "Poll Worker / Election Volunteering", tier: "lead", points: 460, description: "Staff the polls or support election operations." },
  { id: 4, title: "Homeless Outreach (Care Kits, Supplies)", tier: "lead", points: 440, description: "Distribute care kits, supplies, or direct outreach to unhoused neighbors." },
  { id: 5, title: "Contacting Representatives (Calls/Emails)", tier: "lead", points: 400, description: "Reach elected officials about issues that matter to you." },
  { id: 6, title: "Environmental Cleanup (Trash Removal)", tier: "engage", points: 360, description: "Pick up litter or join a cleanup in public spaces." },
  { id: 7, title: "Attending Local Government Meetings", tier: "engage", points: 300, description: "Show up to council, board, or commission meetings." },
  { id: 8, title: "Community Fridge / Free Pantry Stocking", tier: "engage", points: 260, description: "Stock or maintain a community fridge or mutual-aid pantry." },
  { id: 9, title: "Grocery / Errand Help for Elderly or Disabled", tier: "engage", points: 240, description: "Run errands or shop for neighbors who need assistance." },
  { id: 10, title: "Community Organizing / Petitioning", tier: "engage", points: 200, description: "Organize neighbors or collect signatures for a local cause." },
  { id: 11, title: "Civic Information Sharing", tier: "engage", points: 150, description: "Share accurate, helpful info about ballots, meetings, or civic deadlines." },
  { id: 12, title: "Disaster Relief Supply Collection", tier: "spark", points: 120, description: "Collect or donate supplies for disaster or emergency relief." },
  { id: 13, title: "Jury Duty Participation", tier: "spark", points: 100, description: "Serve when summoned — a core civic responsibility." },
  { id: 14, title: "Public Commenting on Policies", tier: "spark", points: 75, description: "Submit written or spoken comment on proposed rules or plans." },
  { id: 15, title: "Neighborhood Beautification (Gardens, Fixes)", tier: "spark", points: 50, description: "Improve shared spaces — gardens, small repairs, visible care." }
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
