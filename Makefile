docker-infra-up:
	docker-compose --file docker/infra/docker-compose.yml --env-file .env up -d

docker-infra-down:
	docker-compose --file docker/infra/docker-compose.yml --env-file .env down

docker-prod-build:
	docker-compose --file docker/docker-compose.yml --env-file .env build

docker-prod-up:
	docker-compose --file docker/docker-compose.yml --env-file .env up -d

docker-prod-down:
	docker-compose --file docker/docker-compose.yml --env-file .env down