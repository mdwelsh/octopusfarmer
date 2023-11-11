import { Client, GameData, OctopusPosition, NewGameRequest, GameType } from '@mdwelsh/octofarm';

// Your job is to replace the code below with
// a much better implementation.
function myOctopus(game: GameData): OctopusPosition {
	const x = game.world.octopus.x + (Math.random() < 0.5 ? 1 : -1);
	const y = game.world.octopus.y + (Math.random() < 0.5 ? 1 : -1);
	return { x, y } as OctopusPosition;
}

// Please edit the following with your email address.
const YOUR_EMAIL = 'me@somewhere.com';
// If you want a repeatable game state for debugging,
// you can change this to a number.
const SEED = undefined;
// You are welcome to change this to one of the
// game types: 'test', 'normal', 'hard', or 'insane'.
const GAME_TYPE: GameType = 'normal';
// Don't edit this unless you are debugging against
// a test server (not something we expect you to do).
const SERVER_URL = 'https://octopusfarmer.com';
// Feel free to reduce this for testing.
const GAME_STEPS = 1000;

// You shouldn't need to edit the code below.
const newGameRequest: NewGameRequest = {
	owner: YOUR_EMAIL,
	seed: SEED,
	gameType: GAME_TYPE,
};
(async () => {
	const client = await Client.Create(SERVER_URL, undefined, newGameRequest);
	client.run(myOctopus, GAME_STEPS);
})();
