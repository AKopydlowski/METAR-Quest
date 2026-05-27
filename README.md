# METAR Quest

METAR Quest is an educational aviation weather app for learning how to decode METAR and TAF reports through interactive challenges, quizzes, time-based gameplay and real-world weather data.

## Features

- METAR decoding practice
- TAF basics
- Multiple-choice quiz mode
- Time Attack mode
- Real weather data by ICAO airport code
- Local progress tracking
- Learning statistics
- Responsive interface

## Game Modes

## Learn

A learning section explaining the main parts of METAR and TAF reports.

Topics:

- ICAO station code
- Observation time
- Wind
- Visibility
- Weather phenomena
- Clouds
- Temperature and dew point
- QNH
- TAF basics

## Decode

A mode where the user receives a METAR report and answers questions about its specific elements.

Main assumptions:

- Multiple-choice answers
- Instant feedback
- Short explanations after each answer
- Score tracking
- Progress saved locally

## Quiz

A classic quiz mode focused on aviation weather abbreviations and meanings.

Main assumptions:

- Randomized questions
- One correct answer per question
- Final result screen
- Saved quiz statistics

## Time Attack

A time-based mode where the user answers as many questions as possible within a fixed time limit.

Main assumptions:

- 60-second timer
- Score based on correct answers
- Wrong answers do not end the game
- Best score saved locally

## Real Weather

A mode for fetching real METAR or TAF reports using an ICAO airport code.

Main assumptions:

- ICAO input field
- METAR and TAF selection
- API route for external weather data
- Loading and error states
- Basic report parsing

## Progress

A section showing the user's learning progress.

Tracked data:

- Total answered questions
- Correct answers
- Accuracy percentage
- Completed quiz sessions
- Best Time Attack score
- Last activity

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- React Hook Form
- Zod
- Recharts
- LocalStorage
- Next.js API Routes

## Project Goals

The goal of this project is to create a clean and practical portfolio app focused on aviation weather learning.



## Disclaimer

METAR Quest is an educational project and should not be used for real-world flight planning or operational aviation decisions.

## Author

AKopydlowski

GitHub: https://github.com/AKopydlowski

## License

This project is licensed under the MIT License.
