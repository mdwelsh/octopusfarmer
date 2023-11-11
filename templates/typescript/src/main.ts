import { Client, GameData, OctopusPosition, NewGameRequest, GameType } from '@mdwelsh/octofarm';

function dumbOctopus(game: GameData): OctopusPosition {
  const x = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
  const y = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
  return { x, y } as OctopusPosition;
}

const YOUR_EMAIL = "me@somewhere.com";
const SEED = undefined;
const GAME_TYPE: GameType = "normal";
const SERVER_URL = "https://octopusfarmer.com";
const GAME_STEPS = 100;

const newGameRequest: NewGameRequest = {
  owner: YOUR_EMAIL,
  seed: SEED,
  gameType: GAME_TYPE
};
( async() => {
  const client = await Client.Create(SERVER_URL, undefined, newGameRequest);
  client.run(dumbOctopus, GAME_STEPS);
})();

