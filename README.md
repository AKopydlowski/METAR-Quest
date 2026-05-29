# METAR Quest

METAR Quest is an educational aviation weather app for learning how to decode METAR and TAF reports through interactive challenges, quizzes, time-based gameplay, and real-world weather data.

## Features

- Cinematic METAR token-by-token decoding
- Pilot briefing cards with profile-aware GO / CAUTION / NO-GO guidance
- Profile-based decision engine for student VFR, PPL VFR, IFR briefing, and night cross-country missions
- 3-minute onboarding to generate a recommended training path
- Cockpit-style weather visualization for wind, visibility, clouds, and flight category
- Live Mission Mode for scenario-based decisions
- METAR decoding practice
- TAF basics
- Multiple-choice quiz mode
- Time Attack mode
- Real weather data by ICAO airport code
- Local progress tracking
- Learning statistics
- Pilot ranks, achievements, weak-area analysis, and personalized training plans
- Adaptive Training 2.0 mastery model with spaced-review priorities
- TAF risk timeline with mission-window GO / CAUTION / NO-GO assessment
- Alternate-airport comparison for live missions
- Dedicated exam mode with 80% pass mark
- Local leaderboard by quiz, Time Attack, missions, and exam
- PWA service worker with offline shell and cached weather fallback
- Share-card summaries for progress and Time Attack
- Language switch (PL/EN)
- Theme switch (light/dark)
- Responsive interface

## Game Modes

### Learn
A modular syllabus explaining METAR/TAF skills, each linked to focused drills and missions.

### Onboarding
A short placement flow that recommends the best first drill or mission based on pilot profile, goal, and confidence.

### Decode
A mode where the user receives a METAR report and answers questions about specific elements.

### Quiz
Classic mode with multiple variants:
- **Classic**
- **Daily**
- **Endless**

Includes streak scoring, hints, local leaderboard save, weak-area drills, and a separate no-hints Exam mode.

### Time Attack
Time-based mode (60s) with combo and score multiplier.

### Real Weather
Fetches live METAR/TAF data by ICAO code using the AviationWeather API, turns it into a pilot-friendly briefing, and visualizes forecast risk on a TAF timeline.

### Missions
Scenario mode where the user loads live weather, chooses a pilot profile, sets a mission window and alternate airport, and makes a GO / CAUTION / NO-GO decision with a profile-aware decision engine, risk tokens, improvement hints, and shareable mission results.

### Progress
Shows local learning stats, historical performance, adaptive mastery, spaced-review priorities, achievements, and leaderboard results.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- LocalStorage
- Next.js API Routes

## Development

```bash
npm install
npm run dev
```

Build and checks:

```bash
npm run lint
npm run test
npm run build
```

## Disclaimer

METAR Quest is an educational project and should not be used for real-world flight planning or operational aviation decisions.

## License

This project is licensed under the MIT License.
