#!/bin/sh
# wait-for.sh

set -e

host="$1"
shift
cmd="$@"

until nc -z "$host" 5432; do
  >&2 echo "⏳ Esperando a PostgreSQL en $host:5432..."
  sleep 1
done

>&2 echo "✅ PostgreSQL está listo, lanzando backend"
exec $cmd
