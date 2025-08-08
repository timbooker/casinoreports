# Casino Tracker API

A comprehensive API for tracking casino games, player data, and game results with built-in caching and Swagger documentation.

## Features

- **Game Results Tracking**: Real-time tracking of various casino games including Crazy Time, Treasure Island, Monopoly, and more
- **Player Count Monitoring**: Live player count across all casino games
- **Geolocation Services**: IP-based location identification
- **Caching System**: Configurable caching with Redis or in-memory storage
- **Swagger Documentation**: Complete API documentation with interactive testing
- **Database Integration**: Prisma ORM with PostgreSQL support
- **CMS Integration**: Menu and document management

## Tech Stack

- **Backend**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis (optional) or in-memory
- **Documentation**: Swagger/OpenAPI 3.0
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (for database features)
- Redis (optional, for caching)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd casino-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Server Configuration
PORT=3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/casino_tracker"

# Cache Configuration
CACHE_PROVIDER=memory  # or 'redis'
REDIS_URL=redis://localhost:6379

# Cache TTL (in seconds)
PLAYERCOUNT_CACHE_SECONDS=10
CRAZYTIME_CACHE_SECONDS=30
GAME_RESULTS_CACHE_SECONDS=30
```

5. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

6. Start the development server:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, you can access the interactive Swagger documentation at:

**http://localhost:3000/api-docs**

### Available Endpoints

#### Geolocation
- `GET /api/geo/identify` - Identify user location based on IP

#### Player Data
- `GET /api/playercount/latest` - Get current player count

#### Game Results
- `GET /api/halloffame/latest` - Get latest hall of fame entries
- `GET /api/crazytime/results` - Get Crazy Time game results
- `GET /api/treasureisland/results` - Get Treasure Island game results
- `GET /api/monopoly/results` - Get Monopoly game results
- `GET /api/lightningstorm/results` - Get Lightning Storm game results
- `GET /api/abwonderland/results` - Get Adventure Beyond Wonderland results
- `GET /api/bigballer/results` - Get Big Baller game results
- `GET /api/sweetbonanza/results` - Get Sweet Bonanza game results

#### CMS
- `GET /api/menu` - Get navigation menu
- `GET /api/cms/documents` - Get CMS documents

#### Casino Games Database
- `GET /api/games` - Get all casino games
- `GET /api/games/:id` - Get a specific casino game

#### System
- `GET /api/cache/status` - Get cache configuration and status

## Project Structure

```
casino-tracker/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── routes.ts             # API routes with Swagger documentation
│   ├── cache.ts              # Cache provider implementation
│   ├── sync.ts               # Data synchronization utilities
│   └── payload/
│       └── cms/              # Static CMS data
├── prisma/
│   └── schema.prisma         # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Database Migrations

```bash
# Generate a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

## Configuration

### Cache Configuration

The application supports two cache providers:

1. **Memory Cache** (default): Fast in-memory caching
2. **Redis Cache**: Distributed caching with Redis

To use Redis, set the following environment variables:
```env
CACHE_PROVIDER=redis
REDIS_URL=redis://localhost:6379
```

### Cache TTL Configuration

Configure cache time-to-live for different endpoints:

```env
PLAYERCOUNT_CACHE_SECONDS=10
CRAZYTIME_CACHE_SECONDS=30
GAME_RESULTS_CACHE_SECONDS=30
```

## API Examples

### Get Player Count
```bash
curl http://localhost:3000/api/playercount/latest
```

### Get Crazy Time Results
```bash
curl http://localhost:3000/api/crazytime/results
```

### Identify Location
```bash
# Automatically detects client IP address
curl "http://localhost:3000/api/geo/identify"
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository. # Force deployment update - Fri Jul 25 17:12:02 CEST 2025

