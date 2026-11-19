#!/bin/bash
# Resilience Test: Stop Postgres, observe app logs, restart Postgres

echo "Starting Resilience Test: PostgreSQL Failure Simulation"
docker-compose -f SourceCode/backend/docker-compose.yml stop postgres
echo "Postgres stopped. Observing system..."
sleep 10
docker-compose -f SourceCode/backend/docker-compose.yml start postgres
echo "Postgres restarted. Checking system health..."
sleep 20
curl -f http://localhost:5080/api/v1/public/demands || echo "Resilience test failed"
