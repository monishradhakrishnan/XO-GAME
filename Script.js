// script.js — XO game logic (fixed)
'use strict';

const boardEl = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const messageEl = document.getElementById('message');
// allow rebinding later if we replace messageEl.innerHTML
let turnEl = document.getElementById('turn');

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

// load saved scores
try {
  const saved = JSON.parse(localStorage.getItem('xo_scores') || 'null');
  if (saved && typeof saved === 'object') scores = {...scores, ...saved};
} catch (e) { /* ignore */ }
renderScores();

// attach listeners
boardEl.addEventListener('click', onBoardClick);
restartBtn.addEventListener('click', resetRound);
resetAllBtn.addEventListener('click', resetAllScores);
document.addEventListener('keydown', onKeyDown);

render();

function onBoardClick(e){
  const cell = e.target.closest('.cell');
  if (!cell || !gameActive) return;
  const idx = Number(cell.dataset.index);
  if (board[idx]) return;
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
  for (const combo of WIN_COMBOS){
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { status: 'win', combo, winner: board[a] };
    }
  }
  if (board.every(cell => cell)) return { status: 'draw' };
  return { status: 'none' };
}

function endGameWin(combo){
  gameActive = false;
  const winner = board[combo[0]];
  combo.forEach(i => cells[i].classList.add('win'));
  messageEl.textContent = `Winner: ${winner}`;
  scores[winner] += 1;
  saveScores();
  renderScores();
  // keep turn display showing winner
  // ensure turnEl exists and update it
  if (!turnEl) turnEl = document.getElementById('turn');
  if (turnEl) turnEl.textContent = winner;
}

function endGameDraw(){
  gameActive = false;
  messageEl.textContent = 'Draw';
  scores.D += 1;
  saveScores();
  renderScores();
  if (!turnEl) turnEl = document.getElementById('turn');
  if (turnEl) turnEl.textContent = '-';
}

function updateTurnUI(){
  // ensure the message contains the <strong id="turn"> element
  if (!turnEl) {
    messageEl.innerHTML = `Turn: <strong id="turn">${currentPlayer}</strong>`;
    turnEl = document.getElementById('turn');
  } else {
    // preserve surrounding text
    // if messageEl doesn't have the label text, set it
    if (!messageEl.textContent.includes('Turn')) {
      messageEl.innerHTML = `Turn: <strong id="turn">${currentPlayer}</strong>`;
      turnEl = document.getElementById('turn');
    } else {
      turnEl.textContent = currentPlayer;
    }
  }
}

function resetRound(){
  board.fill('');
  gameActive = true;
  currentPlayer = 'X';
  // reset UI cells
  cells.forEach(c => { c.textContent = ''; c.className = 'cell'; });
  // reset message and turn element safely
  messageEl.innerHTML = `Turn: <strong id="turn">${currentPlayer}</strong>`;
  turnEl = document.getElementById('turn');
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
  catch(e) { /* ignore */ }
}

function renderScores(){
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawEl.textContent = scores.D;
}

function onKeyDown(e){
  if (!gameActive && e.key.toLowerCase() !== 'r') return;
  if (e.key === 'r' || e.key === 'R') {
    resetRound(); return;
  }
  const n = parseInt(e.key, 10);
  if (!Number.isNaN(n) && n >= 1 && n <= 9){
    const idx = n - 1;
    if (gameActive && !board[idx]) makeMove(idx);
  }
}

function render(){
  // ensure message element has the turn strong element
  if (!turnEl) {
    messageEl.innerHTML = `Turn: <strong id="turn">${currentPlayer}</strong>`;
    turnEl = document.getElementById('turn');
  } else {
    if (!messageEl.textContent.includes('Turn')) {
      messageEl.innerHTML = `Turn: <strong id="turn">${currentPlayer}</strong>`;
      turnEl = document.getElementById('turn');
    } else {
      turnEl.textContent = currentPlayer;
    }
  }

  cells.forEach((el, i) => {
    el.textContent = board[i];
    el.classList.remove('x','o','win');
    if (board[i]) el.classList.add(board[i].toLowerCase());
  });
}