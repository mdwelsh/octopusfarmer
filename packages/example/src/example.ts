#!/usr/bin/env node

import { program } from "commander";

program
    .name("example")
    .version("0.0.1")
    .description("A game about farming octopuses.")
    .option('-s, --steps <int>', 'Total number of steps to run', '1000000')
    .option('-i, --interval <int>', 'Update display every this number of steps', '1000');

program
    .command("run")
    .action(() => {
        console.log("You did the run command");
    });

program
    .command("farm")
    .action(() => {
        console.log("You did the farm command");
    });

program.parse(process.argv);
