#!/usr/bin/env node

/** This is the main entry point to the Octopus Farmer game. There are two commands:
 *  - run: Run the game with a live display.
 *  - farm: Run the game automatically.
 */

import { program } from "commander";
import React from "react";
import { render } from "ink";
import Game from "./game.js";
import Farm from "./farm.js";

program
    .name("octofarm")
    .version("0.0.1")
    .description("A game about farming octopuses.")
    .option('-s, --steps <int>', 'Total number of steps to run', '1000000')
    .option('-i, --interval <int>', 'Update display every this number of steps', '1000');

program
    .command("run")
    .action(() => {
        render(<Game steps={parseInt(program.opts().steps)} />);
    });

program
    .command("farm")
    .action(() => {
        render(<Farm width={100} height={100} steps={parseInt(program.opts().steps)} updateInterval={parseInt(program.opts().interval)} />);
    });

program.parse(process.argv);
