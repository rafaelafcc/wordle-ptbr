import { v4 as uuidv4 } from 'uuid';

const PLAYER_ID_KEY = 'wordle-pt-br-player-id';

export function getPlayerId() {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}
