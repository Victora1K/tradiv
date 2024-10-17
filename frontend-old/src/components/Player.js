import { useState, useRef } from 'react';

export default function Player() {
  const playerName = useRef();

  const [enteredPlayerName, setEnteredPlayerName] = useState(null);

  function handleClick() {
    setEnteredPlayerName(playerName.current.value);
    playerName.current.value = '';
  }

  return (
    <section id="player" className='content' >
      <h2>Welcome {enteredPlayerName ?? 'Trader!'}</h2>
      <p>
        <input ref={playerName} type="text" />
        <p> <button onClick={handleClick}>Set Name</button></p>
      </p>
    </section>
  );
}