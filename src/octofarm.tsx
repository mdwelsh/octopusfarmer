#!/usr/bin/env node

/** This is the main entry point to the Octopus Farmer game. There are two commands:
 *  - run: Run the game with a live display.
 *  - farm: Run the game automatically.
 */

import { program } from "commander";
import { render } from "ink";
import React from "react";
import Farm from "./farm.js";
import Game from "./game.js";
import { Predator, PredatorFactory } from "./predator.js";
import { Shark } from "./shark.js";
import { World } from "./world.js";

program
    .name("octofarm")
    .version("0.0.1")
    .description("A game about farming octopuses.")
    .option('-s, --steps <int>', 'Total number of steps to run', '1000000')
    .option('-i, --interval <int>', 'Update display every this number of steps', '1000')
    .option('--shark', 'Enable shark mode');

program
    .command("run")
    .action(() => {
        if (program.opts().shark) {
            // Override the implementation used for Predator. Note that none
            // of the "library" code is aware of the difference.
            PredatorFactory.create = (world: World, x: number, y: number): Predator => {
                return new Shark(world, x, y);
            }
        }
        render(<Game steps={parseInt(program.opts().steps)} />);
    });

program
    .command("farm")
    .action(() => {
        render(<Farm width={100} height={100} steps={parseInt(program.opts().steps)} updateInterval={parseInt(program.opts().interval)} />);
    });

program.parse(process.argv);
