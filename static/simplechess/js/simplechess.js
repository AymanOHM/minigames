// Unicode chess pieces
const PIECES = {
  'r': '\u265C', 'n': '\u265E', 'b': '\u265D', 'q': '\u265B', 'k': '\u265A', 'p': '\u265F', // black
  'R': '\u2656', 'N': '\u2658', 'B': '\u2657', 'Q': '\u2655', 'K': '\u2654', 'P': '\u2659'  // white
};
// Initial board state (white at bottom)
let board = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];
let selected = null;
let turn = 'w'; // 'w' for white, 'b' for black
let legalMoves = [];
const chessboard = document.getElementById('chessboard');
const info = document.getElementById('info');

function renderBoard() {
  chessboard.innerHTML = '';
  // Render from top (row 0) to bottom (row 7)
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const square = document.createElement('div');
      square.className = 'square ' + ((i + j) % 2 === 0 ? 'dark' : 'light');
      square.dataset.row = i;
      square.dataset.col = j;
      if (selected && selected[0] === i && selected[1] === j) square.classList.add('selected');
      if (legalMoves.some(m => m[0] === i && m[1] === j)) square.classList.add('move');
      if (board[i][j]) {
        const piece = document.createElement('span');
        piece.className = 'piece';
        piece.textContent = PIECES[board[i][j]];
        square.appendChild(piece);
      }
      square.onclick = () => handleSquareClick(i, j);
      chessboard.appendChild(square);
    }
  }
}

function handleSquareClick(row, col) {
  const piece = board[row][col];
  if (selected) {
    if (legalMoves.some(m => m[0] === row && m[1] === col)) {
      board[row][col] = board[selected[0]][selected[1]];
      board[selected[0]][selected[1]] = '';
      selected = null;
      legalMoves = [];
      turn = turn === 'w' ? 'b' : 'w';
      info.textContent = (turn === 'w' ? "White's turn" : "Black's turn");
      renderBoard();
      return;
    }
    selected = null;
    legalMoves = [];
    renderBoard();
    return;
  }
  if (piece && ((turn === 'w' && piece === piece.toUpperCase()) || (turn === 'b' && piece === piece.toLowerCase()))) {
    selected = [row, col];
    legalMoves = getLegalMoves(row, col, piece);
    renderBoard();
  }
}

function getLegalMoves(row, col, piece) {
  let moves = [];
  const directions = {
    'N': [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
    'B': [[-1,-1],[-1,1],[1,-1],[1,1]],
    'R': [[-1,0],[1,0],[0,-1],[0,1]],
    'Q': [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]],
    'K': [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]
  };
  const isWhite = piece === piece.toUpperCase();
  if (piece.toUpperCase() === 'P') {
    let dir = isWhite ? -1 : 1;
    if (inBounds(row+dir, col) && board[row+dir][col] === '') {
      moves.push([row+dir, col]);
      if ((isWhite && row === 6) || (!isWhite && row === 1)) {
        if (board[row+2*dir][col] === '') moves.push([row+2*dir, col]);
      }
    }
    for (let dc of [-1,1]) {
      if (inBounds(row+dir, col+dc) && board[row+dir][col+dc] && isOpponent(row+dir, col+dc, isWhite)) {
        moves.push([row+dir, col+dc]);
      }
    }
  }
  else if (piece.toUpperCase() === 'N') {
    for (let [dr,dc] of directions['N']) {
      let r = row+dr, c = col+dc;
      if (inBounds(r,c) && (!board[r][c] || isOpponent(r,c,isWhite))) moves.push([r,c]);
    }
  }
  else if (['B','R','Q'].includes(piece.toUpperCase())) {
    let dirs = directions[piece.toUpperCase()];
    for (let [dr,dc] of dirs) {
      for (let dist=1; dist<8; dist++) {
        let r = row+dr*dist, c = col+dc*dist;
        if (!inBounds(r,c)) break;
        if (!board[r][c]) moves.push([r,c]);
        else {
          if (isOpponent(r,c,isWhite)) moves.push([r,c]);
          break;
        }
      }
    }
  }
  else if (piece.toUpperCase() === 'K') {
    for (let [dr,dc] of directions['K']) {
      let r = row+dr, c = col+dc;
      if (inBounds(r,c) && (!board[r][c] || isOpponent(r,c,isWhite))) moves.push([r,c]);
    }
  }
  return moves;
}
function inBounds(r,c) { return r>=0 && r<8 && c>=0 && c<8; }
function isOpponent(r,c,isWhite) { if (!board[r][c]) return false; return isWhite ? board[r][c] === board[r][c].toLowerCase() : board[r][c] === board[r][c].toUpperCase(); }

renderBoard();
