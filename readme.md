# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###


docker installieren

dann in den pfad gehen, frontend und backend:
docker build -t repflow-backend . UND
docker build -t repflow-frontend .

dann:
docker run -p 3000:3000 repflow-backend UND
docker run -p 4200:4200 repflow-frontend

am schluss:
docker ps

und beide mit
docker stop name1 UND
docker stop name2 beenden

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact
