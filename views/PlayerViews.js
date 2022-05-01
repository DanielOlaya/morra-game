import React from 'react';

const exports = {};

// Player views must be extended.
// It does not have its own Wrapper view.

exports.GetFingers = class extends React.Component {
  render() {
    const {parent, playable, fingers} = this.props;
    return (
      <div>
        Please choose th number of fingers:
        {fingers ? 'It was a draw! Pick again.' : ''}
        <br />
        {!playable ? 'Please wait...' : ''}
        <br />
        <button
          disabled={!playable}
          onClick={() => parent.playFingers('F0')}
        >0</button>
        <button
          disabled={!playable}
          onClick={() => parent.playFingers('F1')}
        >1</button>
        <button
          disabled={!playable}
          onClick={() => parent.playFingers('F2')}
        >2</button>
        <button
          disabled={!playable}
          onClick={() => parent.playFingers('F3')}
        >3</button>
        <button
          disabled={!playable}
          onClick={() => parent.playFingers('F4')}
        >4</button>
        <button
          disabled={!playable}
          onClick={() => parent.playFingers('F5')}
        >5</button>
      </div>
    );
  }
}

exports.GetGuess = class extends React.Component {
  render() {
    const {parent, playable, guess} = this.props;
    return (
      <div>
        Now guess the total of fingers:
        {guess ? 'It was a draw! Pick again.' : ''}
        <br />
        {!playable ? 'Please wait...' : ''}
        <br />
        <button
          disabled={!playable}
          onClick={() => parent.guessFingers('G0')}
        >0</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessFingers('G1')}
        >1</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessFingers('G2')}
        >2</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessFingers('G3')}
        >3</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessFingers('G4')}
        >4</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessFingers('G5')}
        >5</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessFingers('G6')}
        >6</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessFingers('G7')}
        >7</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessFingers('G8')}
        >8</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessFingers('G9')}
        >9</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessFingers('G10')}
        >10</button>
      </div>
    );
  }
}

exports.WaitingForResults = class extends React.Component {
  render() {
    return (
      <div>
        Waiting for results...
      </div>
    );
  }
}

exports.Done = class extends React.Component {
  render() {
    const {outcome} = this.props;
    return (
      <div>
        Thank you for playing. The outcome of this game was:
        <br />{outcome || 'Unknown'}
      </div>
    );
  }
}

exports.Result = class extends React.Component {
  render() {
    const {fingers} = this.props;
    return (
      <div>
        Fingers thrown:
        <br />{fingers || 'Unknown'}
      </div>
    );
  }
}

exports.Timeout = class extends React.Component {
  render() {
    return (
      <div>
        There's been a timeout. (Someone took too long.)
      </div>
    );
  }
}

export default exports;

