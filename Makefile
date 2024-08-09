# Load the environment variables from .env file
ifneq (,$(wildcard ./.env))
	include .env
	export
endif

# Define variables for Docker Compose
DOCKER_COMPOSE_FILE=docker/infrastructure/compose.yaml

# Targets
.PHONY: up down

up:
	docker compose --file $(DOCKER_COMPOSE_FILE) --env-file .env up -d

down:
	docker compose --file $(DOCKER_COMPOSE_FILE) --env-file .env down