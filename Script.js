// script.js — XO game logic
'use strict';

const boardEl = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const messageEl = document.getElementById('message');
const turnEl = document.getElementById('turn');
const restartBtn = document.getElementById('restart');
const resetAllBtn = document.getElementById('resetAll');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');

const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diagonals
];

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let scores = { X: 0, O: 0, D: 0 };

// load saved scores (optional persistence)
try {
  const saved = JSON.parse(localStorage.getItem('xo_scores') || 'null');
  if (saved && typeof saved === 'object') scores = {...scores, ...saved};
} catch (e) { /* ignore parse errors */ }
renderScores();

// attach listeners
boardEl.addEventListener('click', onBoardClick);
restartBtn.addEventListener('click', resetRound);
resetAllBtn.addEventListener('click', resetAllScores);
document.addEventListener('keydown', onKeyDown); // keyboard support

render();

function onBoardClick(e){
  const cell = e.target.closest('.cell');
  if (!cell || !gameActive) return;
  const idx = Number(cell.dataset.index);
  if (board[idx]) return; // occupied

  makeMove(idx);
}

function makeMove(index){
  board[index] = currentPlayer;
  updateCellUI(index);
  const result = checkResult();
  if (result.status === 'win'){
    endGameWin(result.combo);
  } else if (result.status === 'draw'){
    endGameDraw();
  } else {
    // continue
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnUI();
  }
}

function updateCellUI(index){
  const el = cells[index];
  el.textContent = board[index];
  el.classList.remove('x','o');
  el.classList.add(board[index].toLowerCase());
}

function checkResult(){
  // check for win
  for (const combo of WIN_COMBOS){
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { status: 'win', combo, winner: board[a] };
    }
  }
  // draw
  if (board.every(cell => cell)) return { status: 'draw' };
  // none
  return { status: 'none' };
}

function endGameWin(combo){
  gameActive = false;
  const winner = board[combo[0]];
  // highlight winning cells
  combo.forEach(i => cells[i].classList.add('win'));
  // update message & scores
  messageEl.textContent = `Winner: ${winner}`;
  scores[winner] += 1;
  saveScores();
  renderScores();
  // set turn display to winner
  turnEl.textContent = winner;
}

function endGameDraw(){
  gameActive = false;
  messageEl.textContent = 'Draw';
  scores.D += 1;
  saveScores();
  renderScores();
  turnEl.textContent = '-';
}

function updateTurnUI(){
  messageEl.textContent = `Turn: `;
  turnEl.textContent = currentPlayer;
}

function resetRound(){
  board.fill('');
  gameActive = true;
  currentPlayer = 'X';
  cells.forEach(c => { c.textContent = ''; c.className = 'cell'; });
  updateTurnUI();
  // clear message node formatting
  messageEl.innerHTML = `Turn: <strong id="turn">${currentPlayer}</strong>`;
  // re-bind turnEl reference because we replaced innerHTML
  const newTurn = document.getElementById('turn');
  if (newTurn) turnEl = newTurn; // (note: redeclaring const would be illegal — but in this file we declared let earlier)
  // quick fix: update reference via global
  // To keep it robust, we'll update the variable via lookup each time:
  window.requestAnimationFrame(() => {
    // keep turn element in sync
    const t = document.getElementById('turn');
    if (t) t.textContent = currentPlayer;
  });
}

function resetAllScores(){
  if (!confirm('Reset all scores?')) return;
  scores = { X:0, O:0, D:0 };
  saveScores();
  renderScores();
  resetRound();
}

function saveScores(){
  try { localStorage.setItem('xo_scores', JSON.stringify(scores)); }
  catch(e) { /* ignore storage errors */ }
}

function renderScores(){
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawEl.textContent = scores.D;
}

// keyboard: 1-9 to place, r to restart
function onKeyDown(e){
  if (!gameActive && e.key.toLowerCase() !== 'r') return;
  if (e.key === 'r' || e.key === 'R') {
    resetRound(); return;
  }
  // numeric keypad and top-row numbers 1..9 map to cells (1 -> bottom-left in numpad normally)
  const n = parseInt(e.key, 10);
  if (!Number.isNaN(n) && n >= 1 && n <= 9){
    // map 1..9 to indices (we'll use left-to-right top-to-bottom: 1->index0)
    const idx = n - 1;
    if (gameActive && !board[idx]) makeMove(idx);
  }
}

// initial render
function render(){
  // ensure message element shows the current turn element
  messageEl.innerHTML = `Turn: <strong id="turn">${currentPlayer}</strong>`;
  // re-set cells to board state (useful if loading after refresh)
  cells.forEach((el, i) => {
    el.textContent = board[i];
    el.classList.remove('x','o','win');
    if (board[i]) el.classList.add(board[i].toLowerCase());
  });
}