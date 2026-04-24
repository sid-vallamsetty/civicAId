export const buildings = [
  { id: "path",        label: "Dirt Path",   cost: 100,  sprite: "/sprites/path.png",        color: "#b08968" },
  { id: "flowers",     label: "Flowers",     cost: 100,  sprite: "/sprites/flowers.png",     color: "#7cb48a" },
  { id: "house",       label: "House",       cost: 250,  sprite: "/sprites/house.png",       color: "#e7a76c" },
  { id: "townhall",    label: "Town Hall",   cost: 500,  sprite: "/sprites/townhall.png",    color: "#9c6644" },
  { id: "school",      label: "School",      cost: 500,  sprite: "/sprites/school.png",      color: "#d4a373" },
  { id: "park",        label: "Park",        cost: 750,  sprite: "/sprites/park.png",        color: "#52b788" },
  { id: "city-center", label: "City Center", cost: 750,  sprite: "/sprites/city-center.png", color: "#f4a261" }
]

export function buildingById(id) {
  return buildings.find(b => b.id === id) || null
}
