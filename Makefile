

all:
	  docker-compose up --build
up:
	 docker-compose up

up-d:
	 docker-compose up -d

down:
	 docker-compose down

build:
	 docker-compose build

rebuild:
	 docker-compose build --no-cache

clean:
	 docker-compose down --rmi all --volumes

ps:
	 docker-compose ps

logs:
	 docker-compose logs

logs-f:
	 docker-compose logs -f


# restart:
#      docker-compose restart

prune:
	 docker system prune

prune-a:
	 docker system prune -af --volumes
