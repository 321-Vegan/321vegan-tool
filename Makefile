.PHONY: install up stop down build

ifneq (,$(wildcard ./.env))
    include .env
    export
endif

cmd-exists-%:
	@hash $(*) > /dev/null 2>&1 || \
		(echo "ERROR: '$(*)' must be installed and available on your PATH."; exit 1)

install:  ## Build and run Docker Compose services
	docker compose -f docker-compose.dev.yml build --no-cache
	docker compose -f docker-compose.dev.yml up --force-recreate

up:  ## Run Docker Compose services
	docker compose -f docker-compose.dev.yml up

stop:  ## Run Docker Compose services
	docker compose -f docker-compose.dev.yml stop

down:  ## Shutdown Docker Compose services
	docker compose -f docker-compose.dev.yml down

build:  ## Build and run Docker Compose services for production
	docker compose -f docker-compose.yml up --build -d
