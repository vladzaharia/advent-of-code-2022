import { Unown } from '../../util/unown';

export function main(input: string = `${__dirname}/input.txt`, verbose = false) {
    let max = 0;
    
    // Split on two empty lines
    Unown.parseInput<number[]>(input, 
        { 
            splitter: [/\r?\n\r?\n/, /\r?\n/], 
            output: "number" 
        }).forEach((numbers, idx) => {
        let total = numbers.reduce((a, b) => a + b);
    
        if (total > max) {
            max = total;
        }
    
        // console.log(`${idx}: ${total}`);
    });
    
    // console.log(`Day 1, Part 1: ${max}`);
    return max;
}

// main();
