import React from 'react';
import AppViews from './views/AppViews';
import DeployerViews from './views/DeployerViews';
import AttacherViews from './views/AttacherViews';
import { renderDOM, renderView } from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
import { loadStdlib } from '@reach-sh/stdlib';
const reach = loadStdlib(process.env);

import { ALGO_MyAlgoConnect as MyAlgoConnect } from '@reach-sh/stdlib';
reach.setWalletFallback(reach.walletFallback({
  providerEnv: 'TestNet', MyAlgoConnect }));

const fingersToInt = { 'F0': 0, 'F1': 1, 'F2': 2, 'F3': 3, 'F4': 4, 'F5': 5 };
const guessToInt = { 'G0': 0, 'G1': 1, 'G2': 2, 'G3': 3, 'G4': 4, 'G5': 5, 'G6': 6, 'G7': 7, 'G8': 8, 'G9': 9, 'G10': 10 };
const intToOutcome = ['Bob wins!', 'Draw!', 'Alice wins!'];
const { standardUnit } = reach;
const defaults = { defaultFundAmt: '10', defaultWager: '3', standardUnit };

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { view: 'ConnectAccount', ...defaults };
    }
    async componentDidMount() {
        const acc = await reach.getDefaultAccount();
        const balAtomic = await reach.balanceOf(acc);
        const bal = reach.formatCurrency(balAtomic, 4);
        this.setState({ acc, bal });
        if (await reach.canFundFromFaucet()) {
            this.setState({ view: 'FundAccount' });
        } else {
            this.setState({ view: 'DeployerOrAttacher' });
        }
    }
    async fundAccount(fundAmount) {
        await reach.fundFromFaucet(this.state.acc, reach.parseCurrency(fundAmount));
        this.setState({ view: 'DeployerOrAttacher' });
    }
    async skipFundAccount() { this.setState({ view: 'DeployerOrAttacher' }); }
    selectAttacher() { this.setState({ view: 'Wrapper', ContentView: Attacher }); }
    selectDeployer() { this.setState({ view: 'Wrapper', ContentView: Deployer }); }

    render() { return renderView(this, AppViews); }
}

class Player extends React.Component {
    random() { return reach.hasRandom.random(); }
    async getFingers() {
        const fingers = await new Promise(resolveFingersP => {
            this.setState({ view: 'GetFingers', playable: true, resolveFingersP });
        });
        this.setState({ view: 'GetGuess', fingers });
        return fingersToInt[fingers];
    }
    async getGuess(fingers) {
        const guessP = await new Promise(resolveGuessP => {
            this.setState({ view: 'GetGuess', playable: true, resolveGuessP });
        });
        console.log('guess');
        console.log(guessP);
        console.log(fingers);
        this.setState({ view: 'WaitingForResults', guessP });
        return guessToInt[guessP];
    }
    seeOutcome(i) { this.setState({ view: 'Done', outcome: intToOutcome[i] }); }
    // seeWinning(i) { this.setState({ view: 'Result', fingers: i }); }
    informTimeout() { this.setState({ view: 'Timeout' }); }
    playFingers(fingers) { this.state.resolveFingersP(fingers); }
    guessFingers(guess) { this.state.resolveGuessP(guess); }
}

class Deployer extends Player {
    constructor(props) {
        super(props);
        this.state = { view: 'SetWager' };
    }
    setWager(wager) { this.setState({ view: 'Deploy', wager }); }
    async deploy() {
        const ctc = this.props.acc.contract(backend);
        this.setState({ view: 'Deploying', ctc });
        this.wager = reach.parseCurrency(this.state.wager); // UInt
        this.deadline = { ETH: 10, ALGO: 100, CFX: 1000 }[reach.connector]; // UInt
        backend.Alice(ctc, this);
        const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
        this.setState({ view: 'WaitingForAttacher', ctcInfoStr });
    }
    render() { return renderView(this, DeployerViews); }
}

class Attacher extends Player {
    constructor(props) {
        super(props);
        this.state = { view: 'Attach' };
    }
    attach(ctcInfoStr) {
        const ctc = this.props.acc.contract(backend, JSON.parse(ctcInfoStr));
        this.setState({ view: 'Attaching' });
        backend.Bob(ctc, this);
    }
    async acceptWager(wagerAtomic) { // Fun([UInt], Null)
        const wager = reach.formatCurrency(wagerAtomic, 4);
        return await new Promise(resolveAcceptedP => {
            this.setState({ view: 'AcceptTerms', wager, resolveAcceptedP });
        });
    }
    termsAccepted() {
        this.state.resolveAcceptedP();
        this.setState({ view: 'WaitingForTurn' });
    }
    render() { return renderView(this, AttacherViews); }
}

renderDOM(<App />);