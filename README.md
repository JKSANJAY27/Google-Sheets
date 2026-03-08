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

---

## What You Can Test (Demo Checklist)

I highly suggest opening the application in **two separate browser windows** simultaneously (like Chrome and Firefox, or one normal window and one Incognito window) so you can test the real-time collaboration features!

### 1. Authentication & Dashboard
- **Google Sign-in**: Click "Continue with Google" and ensure it logs you in.
- **Guest Login**: Click "Continue as guest", type a name like "Test Intern", and join.
- **Dashboard**: Create a new document by clicking "+ New spreadsheet", type a name, and hit Enter. You can also delete documents by clicking the trash icon on hover.

### 2. The Core Grid Editor
- **Typing & Navigation**: Type in a cell and hit `Enter` (moves down), `Tab` (moves right), or use your keyboard arrows to navigate.
- **Resizing**: Hover between the column headers (A, B) or row headers (1, 2), click, and drag to resize them.
- **Formatting**: Select a cell, type some text, and click **B** (Bold) or **I** (Italic) in the top toolbar. Use the color pickers to change Text Color and Cell Fill (background) color.

### 3. The Formula Engine
Test the custom formula parser by typing these directly into cells:
- **Basic Math**: Type `=10+20*2` and hit Enter. It should compute `50`.
- **References**: Type `100` into `A1`. Then click `B1` and type `=A1*5`. It should compute `500`.
- **Functions**: Type numbers into `A1`, `A2`, and `A3`. Click `B1` and type `=SUM(A1:A3)`. You can also try `=AVERAGE(A1:A3)`, `=MAX(A1:A3)`, `=MIN(A1:A3)`, and `=COUNT(A1:A3)`.
- **Conditionals**: Try an IF statement and inequalities: `=IF(A1>50, "Big", "Small")`. 
- **Error Handling**: Type `=A1/0` (shows `#DIV/0!`). Type `=B1` into cell `A1`, and `=A1` into cell `B1` to trigger `#CYCLE!`.

### 4. Real-time Collaboration & Presence
- **Live Sync**: Open the same document in both windows. Type something in Window 1. Within milliseconds, it should appear in Window 2.
- **Live Formulas**: Put a value in `A1` in Window 1, and a formula `=A1*10` in `B1`. In Window 2, change the value of `A1` and watch `B1` instantly recalculate for both users.
- **Write Indicator**: Keep your eye on the top toolbar when you type. It will rapidly flash `Saving...` and then say `Saved`.
- **Avatars & Cursors**: Look at the top toolbar to see colored circle avatars for both users. Click on cell `C5` in Window 1, and look at Window 2. You will see cell `C5` light up with a colored border matching Window 1's avatar!

### 5. Exporting
- Click the **CSV** and **XLSX** buttons in the toolbar to download your spreadsheet.

---

## What I Didn't Build
- Offline persistence (too complex for the timeframe)
- Inserting/deleting columns or rows dynamically (the grid is a fixed 100x26 size for now)
- No complex CRDTs, just last-write-wins based on timestamps since it fits a spreadsheet nicely.

Hope you like it! Let me know if you have any questions.
