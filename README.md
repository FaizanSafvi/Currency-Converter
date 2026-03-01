# Currency Converter (React + Vite)

A beginner-friendly currency converter built with React. It uses the Frankfurter API to convert between USD, INR, EUR, and GBP.

## Features
- React state with simple `useState` hooks
- Input validation
- Loading state while fetching data
- Basic error handling
- Clean responsive UI
- TypeScript backend API (`/api/health`, `/api/convert`)

## Project Structure
- `index.html` - App entry HTML
- `src/main.jsx` - React root render
- `src/App.jsx` - Converter UI and logic
- `src/index.css` - Styling
- `backend/src/server.ts` - TypeScript API server
- `backend/tsconfig.json` - TypeScript config for backend build

## Run Locally
1. Open terminal in project folder:
   - `cd "Currency Dxd"`
2. Install packages:
   - `npm install`
3. Start development server:
   - `npm run dev`
4. Open the local URL shown in terminal (usually `http://localhost:5173`).

## Run Backend API (TypeScript)
1. Start API in dev mode:
   - `npm run api:dev`
2. Health endpoint:
   - `GET http://localhost:4000/api/health`
3. Convert endpoint:
   - `GET http://localhost:4000/api/convert?amount=10&from=USD&to=INR`

## Build and Run Backend
- Build: `npm run api:build`
- Start compiled server: `npm run api:start`

## Build for Production
- `npm run build`
- `npm run preview`
