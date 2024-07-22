docker-infra-up:
	docker-compose --file docker/infra/docker-compose.yml --env-file .env up -d

docker-infra-down:
	docker-compose --file docker/infra/docker-compose.yml --env-file .env down

docker-prod-build:
	docker-compose --file docker/docker-compose.yml --env-file .env build

docker-prod-run:
	docker run -d --name imperia_bot --network docker_imperia-network imperia_bot_prod

docker-prod-up:
	docker-compose --file docker/docker-compose.yml --env-file .env up -d

docker-prod-down:
	docker-compose --file docker/docker-compose.yml --env-file .env down