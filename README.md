# METAR Quest

METAR Quest is an educational aviation weather app for learning how to decode METAR and TAF reports through interactive challenges, quizzes, time-based gameplay, and real-world weather data.

## Features

- METAR decoding practice
- TAF basics
- Multiple-choice quiz mode
- Time Attack mode
- Real weather data by ICAO airport code
- Local progress tracking
- Learning statistics
- Language switch (PL/EN)
- Theme switch (light/dark)
- Responsive interface

## Game Modes

### Learn
A learning section explaining the main parts of METAR and TAF reports.

### Decode
A mode where the user receives a METAR report and answers questions about specific elements.

### Quiz
Classic mode with multiple variants:
- **Classic**
- **Daily**
- **Endless**

Includes streak scoring, hints, and local leaderboard save.

### Time Attack
Time-based mode (60s) with combo and score multiplier.

### Real Weather
Fetches live METAR data by ICAO code using the AviationWeather API.

### Progress
Shows local learning stats and historical performance.

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
