# Wumpus World

A modern implementation of the classic Wumpus World game—an interactive puzzle where you navigate a dangerous cave to defeat the Wumpus and collect treasure. Built with Next.js and React, featuring a procedurally generated game world and a leaderboard to compete with other players.

## About Wumpus World

Wumpus World is a classic problem in artificial intelligence and game design. You are an agent in a cave containing:
- **The Wumpus**: A dangerous creature that kills you on contact
- **Pits**: Bottomless holes that trap you
- **Gold**: Treasure to collect for victory
- **Your Agent**: Navigate the grid, gather information through percepts, and escape alive with the treasure

Your goal is to navigate the cave, find the gold, and escape without being caught by the Wumpus or falling into a pit.

## Features

- 🎮 **Interactive Gameplay**: Navigate a procedurally generated cave world
- 🧭 **Sensory Feedback**: Receive percepts indicating nearby dangers and treasure
- 📊 **Leaderboard**: Submit your fastest times and compete with other players
- ⚡ **Real-time Timer**: Track your completion time in MM:SS.CC format
- 🎯 **Victory Conditions**: Escape with treasure intact or eliminate the Wumpus
- 🎨 **Responsive UI**: Clean, intuitive interface built with Tailwind CSS

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16.2
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **UI Library**: [React](https://react.dev) 19
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Database**: [Supabase](https://supabase.com) (leaderboard)
- **Random Generation**: [seedrandom](https://www.npmjs.com/package/seedrandom)
- **Utilities**: [clsx](https://github.com/lukeed/clsx), [zod](https://zod.dev)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm installed

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wumpus-world
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional, required for leaderboard):
```bash
cp .env.example .env.local
```
Then add your Supabase credentials. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to play the game.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main game page
│   └── globals.css              # Global styles
├── features/
│   ├── leaderboard/             # Leaderboard feature
│   │   ├── components/          # Leaderboard UI components
│   │   ├── service.ts           # Leaderboard API service
│   │   ├── supabase.ts          # Supabase client setup
│   │   ├── localStorage.ts      # Local score caching
│   │   └── types.ts             # TypeScript types
│   └── wumpus/                  # Game logic and UI
│       ├── components/          # Game UI components
│       │   ├── GameBoard.tsx    # Game grid visualization
│       │   └── GameSidebar.tsx  # Game status and controls
│       ├── logic/               # Core game logic
│       │   ├── game.ts          # Game state management
│       │   ├── world.ts         # World generation
│       │   └── render.ts        # Rendering utilities
│       ├── constants.ts         # Game configuration
│       ├── types.ts             # Game TypeScript types
│       └── WumpusGame.tsx       # Main game component
└── lib/
    └── cn.ts                    # Utility functions
```

## Gameplay Controls

- **Arrow Keys** or **WASD**: Move the agent
- **Turn**: Rotate to face a direction
- **Action**: Interact with objects in your current cell
- **Escape Button**: End the game early

## Game Mechanics

- **Percepts**: You receive sensory information about adjacent cells:
  - 💨 **Breeze**: A pit is nearby
  - 🦑 **Stench**: The Wumpus is nearby
  - ✨ **Glitter**: Gold is nearby
  
- **Scoring**: Fastest completion time wins on the leaderboard
- **Victory**: Escape the cave with the gold
- **Defeat**: Encounter the Wumpus or fall into a pit

## Leaderboard

Submit your best times to the global leaderboard powered by Supabase. The leaderboard tracks:
- Player name
- Completion time
- Whether you defeated the Wumpus
- Whether you collected the treasure

For setup instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

## Development

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Code Quality

The project uses:
- ESLint for code linting
- TypeScript for type safety
- Tailwind CSS for styling consistency

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

These values are public (NEXT_PUBLIC prefix) and safe to expose. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete setup instructions.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest improvements
- Submit pull requests
- Improve documentation

## License

This project is open source. Check the LICENSE file for details.

## Resources

- [Wumpus World Problem](https://en.wikipedia.org/wiki/Wumpus_world)
- [Artificial Intelligence: A Modern Approach](http://aima.cs.berkeley.edu/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)

## Troubleshooting

**Leaderboard not working?**
- Ensure Supabase environment variables are set correctly
- Check that Row Level Security (RLS) policies are enabled in Supabase
- See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup

**Game not responding?**
- Clear browser cache and reload
- Check browser console for errors
- Ensure you're using a modern browser

**Build errors?**
- Delete `node_modules` and `.next` folders
- Run `npm install` and `npm run build` again
