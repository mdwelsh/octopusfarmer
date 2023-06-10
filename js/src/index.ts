#!/usr/bin/env node

const blessed = require("blessed");

const { Command } = require("commander");

const program = new Command();

program
  .version("1.0.0")
  .description("Octopus Farmer")
  .command('run')
  .description('Run the game interactively')
  .action(() => { run() })
  .parse(process.argv);


function run() {
  console.log("Running simulation");
  var screen = blessed.screen({
    smartCSR: true
  });
  screen.title = "Octopus Farmer";
  var box = blessed.box({
    top: '0',
    left: '0',
    width: '30%',
    height: 3,
    content: 'Octopus Farmer',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'black',
      border: {
        fg: '#ff0000'
      },
      hover: {
        bg: 'gray'
      }
    }
  });
  screen.append(box);
  screen.key(['escape', 'q', 'C-c'], function (ch: any, key: any) {
    return process.exit(0);
  });
  box.focus();
  screen.render();
}