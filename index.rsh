'reach 0.1';

const [isFingers, F0, F1, F2, F3, F4, F5] = makeEnum(6);
const [isGuess, G0, G1, G2, G3, G4, G5, G6, G7, G8, G9, G10] = makeEnum(11);
const [isOutcome, B_WINS, DRAW, A_WINS] = makeEnum(3);

const winner = (fingersAlice, fingersBob, guessAlice, guessBob) => {
    if (guessAlice == guessBob) return DRAW;
    else if ((fingersAlice + fingersBob) == guessAlice) return A_WINS;
    else if ((fingersAlice + fingersBob) == guessBob) return B_WINS;
    else return DRAW;
}


assert(winner(F0, F3, G1, G4) == DRAW);
assert(winner(F1, F2, G2, G3) == B_WINS);
assert(winner(F4, F5, G9, G6) == A_WINS);

forall(UInt, fingersAlice => 
    forall(UInt, fingersBob =>
        forall(UInt, guessAlice =>
            forall(UInt, guessBob => 
                assert(isOutcome(winner(fingersAlice, fingersBob, guessAlice, guessBob)))
                )
            )
    )
);

const Player = {
    ...hasRandom,
    getFingers: Fun([], UInt),
    getGuess: Fun([UInt], UInt),
    // seeWinning: Fun([UInt], Null),
    seeOutcome: Fun([UInt], Null),
    informTimeout: Fun([], Null),
};

export const main = Reach.App( () => {
    // App Init: Define participants
    const Alice = Participant('Alice', { 
        ...Player,
        wager: UInt,
        deadline: UInt,
    });
    const Bob = Participant('Bob', {
        ...Player,
        acceptWager: Fun([UInt], Null),
    });
    init();

    const informTimeout = () => {
        each([Alice, Bob], () => {
            interact.informTimeout();
        });
    }

    Alice.only(() => {
        const wager = declassify(interact.wager);
        const deadline = declassify(interact.deadline);
    })
    Alice.publish(wager, deadline)
        .pay(wager);
    commit();

    Bob.only(() => {
        interact.acceptWager(wager);
    });
    Bob.pay(wager)
        .timeout(relativeTime(deadline), () => closeTo(Alice, informTimeout));

    // start the loop ONLY in consensus step
    var outcome = DRAW;
    invariant(balance() == 2 * wager && isOutcome(outcome));
    while (outcome == DRAW) {
        commit();
        Alice.only(() => {
            const _fingersAlice = interact.getFingers();
            const [_commitAlice, _saltAlice] = makeCommitment(interact, _fingersAlice);
            const commitAlice = declassify(_commitAlice)
            const _guessAlice = interact.getGuess(_fingersAlice);
            const [_commitGuessAlice, _saltGuessAlice] = makeCommitment(interact, _guessAlice);
            const commitGuessAlice = declassify(_commitGuessAlice);
        });
        Alice.publish(commitAlice)
            .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout));
        commit();

        Alice.publish(commitGuessAlice)
            .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout));
        commit();

        unknowable(Bob, Alice(_fingersAlice, _saltAlice));
        unknowable(Bob, Alice(_guessAlice, _saltGuessAlice));
    
        Bob.only(() => {
            const fingersBob = declassify(interact.getFingers());
            const guessBob = declassify(interact.getGuess(fingersBob));
        });
        Bob.publish(fingersBob)
            .timeout(relativeTime(deadline), () => closeTo(Alice, informTimeout));
        commit();

        Bob.publish(guessBob)
            .timeout(relativeTime(deadline), () => closeTo(Alice, informTimeout));
        commit();
    
        Alice.only(() => {
            const saltAlice = declassify(_saltAlice);
            const fingersAlice = declassify(_fingersAlice);
            const saltGuessAlice = declassify(_saltGuessAlice);
            const guessAlice = declassify(_guessAlice);
        });
        Alice.publish(saltAlice, fingersAlice)
            .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout));
        checkCommitment(commitAlice, saltAlice, fingersAlice);
        commit();

        Alice.publish(saltGuessAlice, guessAlice)
            .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout));
        checkCommitment(commitGuessAlice, saltGuessAlice, guessAlice);
        // commit();

        // Alice.only(() => {        
        //     const WinningNumber = fingersAlice + fingersBob;
        //     interact.seeWinning(WinningNumber);
        // });
       
        // Alice.publish(WinningNumber)
        //   .timeout(relativeTime(deadline), () => closeTo(Alice, informTimeout));
  

        outcome = winner(fingersAlice, fingersBob, guessAlice, guessBob);

        continue;
    }

    assert(outcome == A_WINS || outcome == B_WINS)

    transfer(2 * wager).to(outcome == A_WINS ? Alice : Bob);
    commit();

    // consensus to local step
    each([Alice, Bob], () => {
        interact.seeOutcome(outcome);
    });

});