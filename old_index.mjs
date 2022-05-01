import { loadStdlib, ask } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib();

const isAlice = await ask.ask(`are you Alice?`, ask.yesno);
const who = isAlice ? `Alice` : `Bob`;
console.log(`starting Morra as ${who}`);
let acc = null;
const createAcc = await ask.ask(`would you like to create an account?`, ask.yesno);
if(createAcc) {
    acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
} else {
    const secret = await ask.ask(`acc secret?`, (x => x));
    acc = await stdlib.newAccountFromSecret(secret);
}

let ctc = null;
if(isAlice) {
    ctc = acc.contract(backend);
    ctc.getInfo().then((info) => {
        console.log(`contract deployed as ${JSON.stringify(info)}`);
    })
} else {
    const info = await ask.ask(`paste the contract hex`, JSON.parse);
    ctc = acc.contract(backend, info);
}

// formats currency to 4 decimals places
const fmt = (x) => stdlib.formatCurrency(x, 4);

// gets balance of who
const getBalance = async () => fmt(await stdlib.balanceOf(acc));
const before= await getBalance();
console.log(`yor balance is ${before}`);

const interact = {...stdlib.hasRandom};

interact.informTimeout = () => {
    console.log(`there was a timeout`);
    process.exit(1);
}

if (isAlice) {
    const amt = await ask.ask(`how much you want wager?`, stdlib.parseCurrency);
    interact.wager = amt;
    interact.deadline = {ETH: 100, ALGO: 100, CFX: 1000}[stdlib.connector]
} else {
    interact.acceptWager = async (amt) => {
        const accepted = await ask.ask(`do you accept the wager of ${fmt(amt)}?`, ask.yesno);
        if(!accepted) process.exit(0);
    }
}

const FINGERS = [0,1,2,3,4,5];
const GUESS = [0,1,2,3,4,5,6,7,8,9,10];
const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];

interact.getFingers = async () => {
    const fingers = await ask.ask(`how many fingers?`, (x) => {
        const fingers = FINGERS[x];
        if (fingers === undefined) {
            throw Error(`invalid fingers`);
        }
        return fingers;
    })
    console.log(`you played ${FINGERS[fingers]} fingers`);
    return fingers;
}

interact.getGuess = async (fingers) => {
    const guess = await ask.ask(`what guess?`, (x) => {
        const guess = GUESS[x];
        if (fingers === undefined) {
            throw Error(`invalid fingers`);
        }
        return guess// + fingers;
    })
    console.log(`your guess is ${guess} fingers`);
    return fingers;
}

interact.seeWinning = (winningNumber) => {    
    console.log(`fingers thrown: ${winningNumber}`);
}

interact.seeOutcome = (outcomme) => {
    console.log(`outcome ${OUTCOME[outcomme]}`);
}

const part = isAlice ? ctc.p.Alice : ctc.p.Bob;
await part(interact);

const after = await getBalance();
console.log(`balance now ${after}`);

ask.done();
