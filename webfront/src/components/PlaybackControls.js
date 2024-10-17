// File: /webfront/src/components/PlaybackControls.js

import React from 'react';

const PlaybackControls = ({ startPlayback, stopPlayback, resetPlayback, speedUpPlayback, slowDownPlayback }) => {
  return (
    <div>
      <button onClick={startPlayback}>Start</button>
      <button onClick={stopPlayback}>Pause</button>
      <button onClick={resetPlayback}>Reset</button>
      <button onClick={speedUpPlayback}>Speed Up</button>
      <button onClick={slowDownPlayback}>Slow Down</button>
    </div>
  );
};

export default PlaybackControls;
