# Google Sheets Clone

Hey there! This is my submission for the real-time collaborative spreadsheet project.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Auth, Firestore, Realtime Database)

## Setup Instructions

1. Clone this repo
2. Run `npm install`
3. Check the `.env.example` file and create a `.env.local` with your Firebase credentials. You'll need Auth, Firestore, and Realtime Database enabled in your Firebase project.
4. Run `npm run dev` and open `http://localhost:3000`

## Features Built
- **Document Dashboard**: A list of all your spreadsheets, you can create or delete them here.
- **Grid Editor**: The main spreadsheet view. I added resizable columns and rows.
- **Formula Engine**: I wrote a custom recursive descent parser! It handles `=SUM`, basic math `(+, -, *, /)`, and cell references. It can even detect circular dependencies (`#CYCLE!`) and division by zero.
- **Real-time Sync**: Edits save to Firestore instantly. There is a "Saving..." indicator to show write state.
- **Presence**: Uses Realtime Database to keep track of who is in the document and where their cursor is. Everyone gets a unique colour!
- **Bonus**: Added cell formatting (bold, italic, colors), keyboard navigation, and CSV/XLSX export.

## What I Didn't Build
- Offline persistence (too complex for the timeframe)
- Inserting/deleting columns or rows dynamically (the grid is a fixed 100x26 size for now)
- No complex CRDTs, just last-write-wins based on timestamps since it fits a spreadsheet nicely.

Hope you like it! Let me know if you have any questions.
