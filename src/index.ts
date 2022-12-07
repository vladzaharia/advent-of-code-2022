#!/usr/bin/env node --loader ts-node/esm.mjs

import yargs, { Argv, Arguments, CamelCaseKey } from "yargs";

import { copySync } from 'fs-extra';

/** Script Discovery */
import { getAllScripts } from './util/lotad';

/** Script runner */
import { AdventFile, executeAdventFile, getAdventFileFromPath, populateAdventFile } from './util/exeggutor';

/** Test runner */
import { executeTestsForAdventFile } from './util/spectrier';

/**
 * Common arguments used across commands.
 */
interface RunnerArgs {
    path?: string;
    day?: number;
    part?: number;
    verbose?: boolean;
}

/**
 * Basic `yargs` options used across commands.
 */
const baseOptions = (yargs: Argv) => {
    return yargs.option('path', {
        describe: "Full path to run",
        type: 'string',
        alias: 'p',
        conflicts: ['day', 'part']
    }).option('day', {
        describe: "The day of AoC to run",
        type: 'number',
        alias: 'd',
        conflicts: ['path']
    }).option('part', {
        describe: "The part to run",
        type: 'number',
        alias: 'n',
        conflicts: ['path']
    }).option('verbose', {
        describe: "Verbose logging",
        type: 'boolean',
        alias: ['v', 'V']
    }).help()
};

// Create run and test commands
const argv = yargs
    .command('$0 [path]', "Run Advent of Code 2022 scripts. By default, will run all scripts in src.", baseOptions)
    .command('test [path]', "Run tests for AoC scripts.", baseOptions)
    .command('bootstrap', "Bootstraps the next day's scripts, input and spec files.")
    .argv as { [key in keyof Arguments<RunnerArgs> as key | CamelCaseKey<key>]: Arguments<RunnerArgs>[key] };

// Enable verbose logging
if (argv.verbose) {
    console.info("\x1b[1m\x1b[36m[!] Verbose mode on.\x1b[0m");
    console.log(JSON.stringify(argv));
}

// Determine advent files to run/test
let adventFiles: AdventFile[] = [];
if (argv.path) {
    adventFiles.push(populateAdventFile({ ... getAdventFileFromPath(argv.path, argv.verbose)!, base: __dirname }, argv.verbose));
} else if (argv.day && argv.part) {
    adventFiles.push(populateAdventFile({ 
        base: __dirname,
        day: argv.day,
        part: argv.part
    }, argv.verbose));
} else {
    adventFiles = getAllScripts(__dirname, argv.verbose);
}

// Run or test the files
if (argv['_'][0] === "bootstrap") {
    copySync(`${__dirname}/../_tmpl`, `${__dirname}/${(Math.max(... adventFiles.map((f) => f.day!)) + 1).toString().padStart(2, '0')}`);
} else if (argv['_'][0] === "test") {
    adventFiles.forEach(async (f) =>console.log(`Day ${f.day}, Part ${f.part}: ${await executeTestsForAdventFile(f, argv.verbose)}`));
} else {
    adventFiles.forEach(async (f) => console.log(`Day ${f.day}, Part ${f.part}: ${await executeAdventFile(f, undefined, argv.verbose)}`));
}
