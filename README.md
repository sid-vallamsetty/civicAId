# civicAId

A gamified civic engagement platform that incentivizes and celebrates community participation through a pixel-art village builder game.

## 🎯 Project Goal

civicAId increases civic engagement by turning meaningful community contributions into a rewarding game experience. Users complete real-world civic challenges (voter registration, volunteering, community service, etc.) and earn points to build and customize their virtual community with pixel-art buildings, progression ranks, and achievement streaks.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd civicaid
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the URL shown in your terminal).

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## ✨ Features

### 🎮 Civic Challenges System
Complete a variety of civic challenges across three tiers:

**Lead Tier** (High Impact - 400-500 points):
- Voter Registration & Turnout Efforts
- Food Distribution / Pantry Support
- Poll Worker / Election Volunteering
- Homeless Outreach (Care Kits, Supplies)
- Contacting Representatives (Calls/Emails)

**Engage Tier** (Medium Impact - 200-360 points):
- Environmental Cleanup (Trash Removal)
- Attending Local Government Meetings
- Community Fridge / Free Pantry Stocking
- Grocery / Errand Help for Elderly or Disabled
- Community Organizing / Petitioning

**Spark Tier** (Starter Activities - 50-150 points):
- Civic Information Sharing
- Disaster Relief Supply Collection
- Jury Duty Participation
- Public Commenting on Policies
- Neighborhood Beautification

### 💰 Point & Streak System
- Earn points for completing verified civic challenges
- Build streaks by completing challenges in succession
- Spend points to build and customize your community
- Points determine your civic rank and community development

### 🏘️ Community Builder
Construct a pixel-art village with 7 unique building types:
- **Dirt Path** (100 pts) - Foundation for your community
- **Flowers** (100 pts) - Add beauty and charm
- **House** (250 pts) - Residential growth
- **Town Hall** (500 pts) - Government hub
- **School** (500 pts) - Education center
- **Park** (750 pts) - Community gathering space
- **City Center** (750 pts) - Urban development

**Building Interactions:**
- **Place** buildings on an 8×10 grid by selecting a building and clicking on an empty plot
- **Drag & Drop** from the building menu or move existing buildings around
- **Remove** buildings to get a 50% point refund
- Visualize your community growth as you progress

### 📈 Civic Ranking System
Progress through 5 civic ranks based on accumulated points:
- **Seed** (0 pts) - Just starting your civic journey
- **Voice** (100 pts) - Finding your community voice
- **Neighbor** (300 pts) - Active community member
- **Advocate** (750 pts) - Dedicated civic advocate
- **Civic Champion** (1500+ pts) - Community leader

### 📝 Evidence Submission & Verification
- Submit evidence of completed challenges through text descriptions or file uploads (images/PDFs)
- AI-powered verification using Google's Gemini API
- Real-time feedback on whether submissions are approved
- Evidence feed showing your contribution history and points earned

### 📊 Dashboard & Analytics
- **Top Bar** displays your current points, streak count, and civic rank
- **Challenge Timer** shows ongoing challenges and time-sensitive activities
- **Evidence Feed** logs all submissions with approval status and feedback
- Real-time visualization of your progress

### 🎨 Pixel Art Aesthetics
Beautiful retro pixel-art style with:
- Charming building sprites
- Colorful community grid
- Animated UI elements
- Nostalgic gaming experience

## 🏗️ Tech Stack

- **Frontend:** React 18.3.1
- **Build Tool:** Vite 5.4.10
- **PDF Processing:** PDFjs-dist 4.10.38
- **API Integration:** Google Gemini API (for evidence verification)

## 📁 Project Structure

```
civicaid/
├── src/
│   ├── components/          # React components
│   │   ├── BuildMenu.jsx
│   │   ├── ChallengeCard.jsx
│   │   ├── ChallengeTimer.jsx
│   │   ├── EvidenceFeed.jsx
│   │   ├── EvidenceInput.jsx
│   │   ├── PixelGrid.jsx
│   │   ├── PixelIcons.jsx
│   │   └── TopBar.jsx
│   ├── data/                # Static data
│   │   ├── buildings.js     # Building definitions
│   │   └── challenges.js    # Civic challenge data
│   ├── services/            # API integrations
│   │   └── gemini.js        # Evidence verification service
│   ├── utils/               # Utility functions
│   │   └── fileUtils.js
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── package.json
└── vite.config.js
```

## 🔧 Environment Variables

Create a `.env` file in the project root with:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 🎮 How to Play

1. **View Challenges:** Browse available civic challenges on the left panel
2. **Submit Evidence:** Select a challenge and submit evidence (text or file) of your participation
3. **Earn Points:** Get verified by Claude/Gemini and earn points for approved submissions
4. **Build Your Community:** Spend earned points to place buildings on your grid
5. **Climb the Ranks:** Progress through civic ranks as you accumulate points
6. **Compete with Streaks:** Maintain consecutive completions for bonus engagement

## 📝 Contributing

This is a hackathon project created to demonstrate innovative ways to gamify civic participation.

## 📄 License

MIT License

---

*Built with ❤️ to increase civic engagement through gamification*