# Local PostgreSQL Database Setup

This directory contains Docker configuration for running PostgreSQL locally for development and testing.

## Quick Start

1. **Start the database:**

    ```bash
    docker-compose up -d
    ```

2. **Stop the database:**

    ```bash
    docker-compose down
    ```

3. **View logs:**
    ```bash
    docker-compose logs postgres
    ```

## Database Connection Details

- **Host:** localhost
- **Port:** 5432
- **Database:** casino_tracker
- **Username:** casino_user
- **Password:** casino_password

## pgAdmin (Optional)

If you want to use pgAdmin for database management:

1. Start the services: `docker-compose up -d`
2. Open http://localhost:8080 in your browser
3. Login with:
    - Email: admin@casino-tracker.com
    - Password: admin123
4. Add a new server connection:
    - Host: postgres (container name)
    - Port: 5432
    - Database: casino_tracker
    - Username: casino_user
    - Password: casino_password

## Environment Variables

You can customize the database configuration by setting these environment variables:

- `POSTGRES_DB`: Database name (default: casino_tracker)
- `POSTGRES_USER`: Username (default: casino_user)
- `POSTGRES_PASSWORD`: Password (default: casino_password)

## Data Persistence

The database data is persisted in a Docker volume named `postgres_data`. This means your data will survive container restarts.

To completely reset the database:

```bash
docker-compose down -v
docker-compose up -d
```

## Prisma Integration

If you're using Prisma, update your `DATABASE_URL` in your `.env` file:

```
DATABASE_URL="postgresql://casino_user:casino_password@localhost:5432/casino_tracker"
```

## Troubleshooting

1. **Port already in use:** Make sure port 5432 is not being used by another PostgreSQL instance
2. **Permission denied:** Make sure Docker has the necessary permissions
3. **Container won't start:** Check the logs with `docker-compose logs postgres`
