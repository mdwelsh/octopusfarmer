# Octopus Farmer 🐙🌱

This is a web-based game in which you play as an octopus that attempts to catch fish
with its tentacles. Each fish consumed gives you a certain number of points, and your goal is
to maximize the number of points you get within a certain number of time steps, by writing the
best code you can to optimize the octopus's movement.

The game itself is hosted on https://octopusfarmer.com and is accessed through a simple REST
API, described below. Your job is to write a client program that interacts with this API to
create a game and control the octopus to maximize your score.

## Contents of this repository

If you are a job candidate at Fixie, you will have been sent a Coderpad link which contains
all of the code and details you need. You are welcome to check out and reference this repository,
if you like, but it's not necessary, and it probably won't help.

The server code can be found in the `packages/webapp` directory of this repo.
You are not to modify the server in any way, but you are welcome to look at the code to
inform your design. (Note, however, that games are randomly generated, so you won't be able
to cheat by looking at the server code!)

The `packages/client` directory contains code for a simple TypeScript client that talks
to the server, which is used by the TypeScript template mentioned below. You are not required
to use this code, and it may be a useful reference if you are implementing your solution in
a language other than TypeScript.

The `templates/` directory contains templates in several languages that you can use as a
base for your solution. These templates will be pre-loaded into your Coderpad session.

## Candidate instructions

If you are a candidate for a position at Fixie, please **do not make a public fork of this repo**
for your solution, and **do not send a pull request** to this repo. We want to avoid candidates
using each other's code as a reference. Please use the Coderpad link you have been sent to 
send us your submission instead.

## Running the server locally

You only need to worry about the following if you are planning to modify or deploy the
server code.

```bash
$ git clone https://github.com/mdwelsh/octopusfarmer
$ cd octopusfarmer
$ yarn
$ yarn build
$ yarn workspace webapp start  # starts the server locally on port 3000
```

The server is designed to be deployed on Vercel and uses Next.js and Vercel KV for backend
storage. Configure a Vercel account and project and you can deploy with:

```bash
$ yarn build
$ cd packages/webapp
$ vercel deploy
```
