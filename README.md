# METAR Quest

METAR Quest is an early-stage Next.js project intended to become an educational app for learning how to decode METAR/TAF reports.

## Current Status (What is actually implemented)

The repository currently contains the default Next.js starter UI and foundational app shell only.

### Delivered features

- Next.js App Router project scaffold
- Single landing page at `/`
- Global layout, global styles, and font setup
- Basic responsive starter interface

### Implemented routes

- `/` – starter home page

There are no METAR game modes, parser UI, API routes, or progress features implemented yet in this branch.

## Tech Stack (currently in use)

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint

## Setup

```bash
git clone https://github.com/AKopydlowski/METAR-Quest.git
cd METAR-Quest
npm install
npm run dev
```

Open: `http://localhost:3000`

## Scripts

```bash
npm run dev
```
Start development server.

```bash
npm run build
```
Create production build.

```bash
npm run start
```
Run production server.

```bash
npm run lint
```
Run ESLint checks.

## Testing

There is no full automated test suite configured yet.

General quality check:

```bash
npm run lint
```

Parser test command (reserved for when parser tests are added):

```bash
npm run test:parser
```

> Note: `test:parser` is documented as the intended parser test command name, but this script is not implemented yet in `package.json`.

## Disclaimer

METAR Quest is an educational project and should not be used for real-world flight planning or operational aviation decisions.

## License

This project is licensed under the MIT License.
