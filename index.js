// decalaring variables as var to avoid a problem in webkit where variable name and id can not have identical names
var playersElements = document.getElementsByClassName('player');
var fader = document.getElementById('fader');
var lis = document.querySelectorAll('#grid > li');
var overlay = document.getElementById('overlay');
var contentWrapper = document.getElementById('content-wrapper');
var content1 = document.getElementById('content1'); 
var content2 = document.getElementById('content2');
var content3 = document.getElementById('content3');

for (var i = 0; i < lis.length; i++) {
  lis[i].addEventListener('click', handleClick);
  lis[i].addEventListener('mouseover', handleHover);
  lis[i].addEventListener('mouseout', handleMouseOut);
}

let playerProp = {
  p1: { name: '', color: 'rgba(229, 218, 201, 1)', sign: 'o', wins: 0 },
  p2: { name: '', color: 'rgba(22, 21, 17, 1)', sign: 'x', wins: 0 },
  addPoint: function(p) {
    this[p].wins++;
    if (this[p].wins > 10) {
      this[p].wins -= 10;
    }
  }
};

let ai = false;
let humanPlayers = ['p1'];
const players = ['p1', 'p2'];

let startPlayer = 'p1';
let activePlayer = startPlayer;
let checked = {
  p1: [],
  p2: []
};

resetGame();

//------------ main game events -------------

function readyBoard() {
  resetTiles();
  addHoverToAll();
  hideOverlay();
  resetHistory();
  resetContentBox();
}
function nextRound() {
  readyBoard();
  displayPlayers();
  updateScore();
  togglePlayer('start');
  activePlayer = startPlayer;
  if (ai && activePlayer === 'p2') {
    blockGrid();
    setTimeout(aiTurn, 300);
  }
} 
function resetGame() {
  readyBoard();
  resetPlayerData();
  updateScoreBoard();
  startPlayer = 'p1';
  activePlayer = startPlayer;
  menuPlayers();
}
function startNewGame() {
  displayPlayers();
  highlightActiveSign();
  hideOverlay();
}

//--------- component functions ------------

function updateScoreBoard() {
  displayPlayers();
  updateScore();
}
function resetPlayerData() {
  playerProp.p1.name = 'Player 1';
  playerProp.p1.wins = 0;
  playerProp.p2.name = 'Player 2';
  playerProp.p2.wins = 0;
}
function resetContentBox() {
  content1.innerHTML = '';
  content2.innerHTML = '';
  content3.innerHTML = '';
}
function resetTiles() {
  for (var i = 0; i < lis.length; i++) {
    lis[i].innerHTML = '';
    lis [i].dataset.empty = 'true';
  }
  addHoverToAll();
}
function resetHistory() {
  checked.p1 = [];
  checked.p2 = [];
}
function addHoverToAll() {
  for (var i = 0; i < lis.length; i++) {
    lis[i].classList.add('hover');
  }
}
function hideOverlay() {
  overlay.style.visibility  = 'hidden';
  contentWrapper.style.visibility = 'hidden';
  fader.style.visibility = 'hidden';
}
function showOverlay() {
  overlay.style.visibility  = 'visible';
  contentWrapper.style.visibility  = 'visible';
  fader.style.visibility = 'visible';
}
function blockGrid() {
  overlay.style.visibility  = 'visible';
  contentWrapper.style.visibility  = 'hidden';
  fader.style.visibility = 'hidden';
}

function displayPlayers() {
  players.map(function(player, i) {
    let signSpan = playersElements[i].firstElementChild;
    signSpan.style.setProperty('color', playerProp[player].color);
    signSpan.innerHTML = playerProp[player].sign;
    signSpan.nextSibling.innerHTML = playerProp[player].name;
  });
}
function updateScore(result) {
  if (result === 'winner') {
    playerProp.addPoint(activePlayer);
  } else if (result === 'tie') {
    playerProp.addPoint('p1');
    playerProp.addPoint('p2');
  } 
  displayScore();
}
function displayScore() {
  players.map(function(player, i) {
    let scoreSpan = playersElements[i].lastElementChild;
    let wins = playerProp[player].wins;
    scoreSpan.innerHTML = toTally(wins);
  });
  function toTally(num) {
    const groups = Math.floor(num / 5);
    let result = '';
    for (let i = 0; i < groups; i++) {
      result += '<span class="strike">||||</span>&nbsp;';
    } 
    for (let j = 0; j < num - (groups * 5); j++) {
      result += '|';
      if (j === num - 1) {
        result += '&nbsp;';
      }
    }
    return result;
  } 
}

//---------- mouse event functions -----------
  
function handleHover(e) {
  const xy = Number(e.target.id);
  const tile = document.getElementById(xy);
  
  if (tileIsEmpty(xy)) {
    usePlayerColor(tile);
    e.target.innerHTML = playerProp[activePlayer].sign;
  }
}
function handleMouseOut(e) {
  const xy = Number(e.target.id);
  if (tileIsEmpty(xy)) { 
    e.target.innerHTML = '';
  }
}
function handleClick(e) {
  const xy = Number(e.target.id);
  const tile = document.getElementById(xy);
  if (tileIsEmpty(xy)) {
    tile.dataset.empty = 'false';
    evaluateMove(xy, tile);
  }
}
function fadeMenu() {
  contentWrapper.classList.add('fade-menu');
}
function unfadeMenu() {
  contentWrapper.classList.remove('fade-menu');
}

//--------- evaluate Move -------------

function evaluateMove(xy, tile) {
  hideOverlay();
  writeHistory(xy);
  updateField(tile);
  if (checked[activePlayer].length > 2 && threeInARow(xy)) {
    blockGrid();
    return setTimeout(gameOver, 300, 'winner');
  } else if (boardIsFull()) {
    blockGrid();
    return setTimeout(gameOver, 300, 'tie');
  }
  togglePlayer('active');
  highlightActiveSign();
  if (ai && activePlayer === 'p2') {
    blockGrid();
    setTimeout(function(){ aiTurn(xy); }, 300);
  }
}

// ----------- component functions -----------

function highlightActiveSign() {
  unHighlightSign();
  const find = '#' + activePlayer + ' .sign';
  const activeSign = document.querySelector(find);
  activeSign.classList.add('sign-highlight');
}
function unHighlightSign() {
  const allSigns = document.querySelectorAll('.player .sign');
  for (let i = 0; i < allSigns.length; i++) {
    allSigns[i].classList.remove('sign-highlight');
  }
}

function writeHistory(xy) {
  checked[activePlayer].push(xy);
}
function updateField(tile) {
  usePlayerColor(tile);
  tile.innerHTML = playerProp[activePlayer].sign;
  tile.classList.remove('hover');
}
function threeInARow(xy) {
  if (checked[activePlayer].length > 2) {
    return (ortho3(xy) || diago3());
  } else {
    return false;
  }
}
function ortho3(xy) {
  const actArr = checked[activePlayer];
  let countX = 0;
  let countY = 0;
  
  const tileXY = separate2Digits(xy);
  let listXY = [];
    
  for (var i = 0; i < actArr.length; i++) {
    listXY = separate2Digits(actArr[i]);
    if (tileXY[0] === listXY[0]) {
      countX++;
    }
    if (tileXY[1] === listXY[1]) {
      countY++;
    }
  }
  if (countX === 3 || countY === 3) {
    return true;
  } else {
    return false;
  }
}
function separate2Digits(xy) {
  const x = ('' + xy)[0];
  const y = ('' + xy)[1];
  return [x,y];
}
function diago3() {
  const actArr = checked[activePlayer];
  const check = {
    left: [11, 22, 33],
    right: [13, 22, 31]
  };
  let leftDown = false;
  let rightDown = false;
 
  leftDown = check.left.every(function(ele) {
    return (JSON.stringify(actArr).includes(ele));
  });
  rightDown = check.right.every(function(ele) {
    return (JSON.stringify(actArr).includes(ele));
  });
  
  if (leftDown || rightDown) {
    return true;
  } else {
    return false;
  }
}
function boardIsFull() {
  return (checked.p1.length + checked.p2.length >= 9);
}
function tileIsEmpty(xy) {
  const tile = document.getElementById(xy);
  return (tile.dataset.empty === 'true');
}
function togglePlayer(mode) {
  if (mode === 'active') {
    if (activePlayer === 'p1') {
      activePlayer = 'p2';
    } else {
      activePlayer = 'p1';
    } 
  } else if (mode === 'start') {
    if (startPlayer === 'p1') {
      startPlayer = 'p2';
    } else {
      startPlayer = 'p1';
    } 
  }
}

function usePlayerColor(tile) {
  tile.style.setProperty('color', playerProp[activePlayer].color);
}

// ------------ Game Over -----------------

function gameOver(result) {
  unHighlightSign();
  updateScore(result);
  content1.innerHTML = gameResult(result);
  content2.innerHTML = '... continue?';
  let btns = yesNoButtons();
  content3.appendChild(btns.yes);
  content3.appendChild(createSeparator());
  content3.appendChild(btns.no);
  showOverlay();
}

// ------------ component functions ---------------

function gameResult(result) {
  let html = '';
  if (result === 'winner') {
    html = '<b>' + playerProp[activePlayer].name + '</b> &nbsp;won the round!';
  } else if (result === 'tie') {
    html = 'It was a &nbsp;<b>draw</b>&nbsp;.';
  }
  return html;
}

function yesNoButtons() {
  let yesNo = {
    yes: buildDiv('yes.', 'yes'),
    no: buildDiv('no.', 'no')
  }; 
  
  return yesNo;
} 
function buildDiv(text, id) {
  let btn = document.createElement('DIV');
  btn.addEventListener('click', handleDialogue);
  btn.className = 'button';
  btn.textContent = text;
  btn.id = id;
  return btn;
}

// ------------- create menu elements ---------------

function menuPlayers() {
  let btns = oneTwoPlayerButtons();
  content1.innerHTML = 'number &nbsp;of &nbsp;Players';
  content3.appendChild(btns.one);
  content3.appendChild(createSeparator());
  content3.appendChild(btns.two);
  showOverlay();
}

function oneTwoPlayerButtons() {
  let oneTwo = {
    one: buildDiv('one.', 'onePlayer'),
    two: buildDiv('two.', 'twoPlayers')
  }; 
  return oneTwo;
}

function createSeparator() {
  let el = document.createElement('DIV');
  el.textContent = 'O';
  el.classList.add('bonbon-large');
  el.classList.add('rotate');
  el.id = 'separator';
  return el;
}

function buildInput() {
  resetContentBox();
  let sign = playerProp[humanPlayers[0]].sign;
  content1.innerHTML += '<span class="bonbon-large">' + sign + '</span>';
  content1.innerHTML += 'enter &nbsp;name:';
  content2.innerHTML += '<input type="text" maxLength="8">';
  let input = document.querySelector('input');
  input.focus();
  input.addEventListener('keypress', submitName);
}

function setName(name) {
  playerProp[humanPlayers[0]].name = name;
  humanPlayers.shift();
  if (humanPlayers.length > 0) {
    displayPlayers();
    return buildInput();
  } else {
    return startNewGame();
  }
}

// ------------- menu event functions --------------

function handleDialogue(e) {
  const selection = e.target.id;
  switch(selection) {
  case 'yes':
    nextRound();
    break;
  case 'no':
    resetGame();
    break;
  case 'onePlayer':
    humanPlayers = ['p1'];
    ai = true;
    playerProp.p2.name = 'Gnome';
    buildInput();
    break;
  case 'twoPlayers':
    ai = false;
    humanPlayers = ['p1', 'p2'];
    buildInput();
    break;
  } 
}

function submitName(e) {
  const name = e.target.value;
  const key = e.which || e.keyCode;
  if (key === 13 && name.length > 0) {
    e.preventDefault();
    return setName(name);
  }
}

// ---------------- AI --------------------
// ------------ declarations --------------

const lines = {
  h1: [11, 12, 13],
  h2: [21, 22, 23],
  h3: [31, 32, 33],
  v1: [11, 21, 31],
  v2: [12, 22, 32],
  v3: [13, 23, 33],
  d1: [11, 22, 33],
  d2: [13, 22, 31]
};
const allCorners = [11, 13, 31, 33];
const allLines = ['h1', 'h2', 'h3', 'v1', 'v2', 'v3', 'd1', 'd2'];
const allTiles = [11, 12, 13, 21, 22, 23, 31, 32, 33];

// --------------- AI main function ---------------------

function aiTurn(xy) {
  const prefAI = getPrefTiles('p2');
  const prefP1 = getPrefTiles('p1');
  const emptyTiles = getEmptyTiles();
  const bestTiles = matchTileArr(prefP1, prefAI);  // first argument is preferred in case there is no match // AI plays it safe - *hindering before going for the win*
  if (blockOrWin('p2')) {   // win if possible
    return;
  }
  if (blockOrWin('p1')) {  // block if necessary
    return;
  }
  
  if (xy === 22) {    // make it less likely for the AI to be trapped (player: middle -> ai: corner)
    if (placeOnCornerOf(bestTiles)) {     // prioritized if-conditions: find the best corner
      return;
    }
    if (placeOnCornerOf(prefP1)) {
      return;
    }
    if (placeOnCornerOf(prefAI)) {
      return;
    }
    if (placeOnCornerOf(emptyTiles)) {
      return;
    } 
  }  
  
  if (bestTiles) {
    return placeRandom(bestTiles);
  }
  placeRandom(emptyTiles);    // if none of the above
}

// -------------------- AI algorithms ------------------

function blockOrWin(player) {
  for (let i = 0; i < allLines.length; i++) {
    let blockPos = getBlockPos(allLines[i], player);
    if (blockPos) {
      click(blockPos);
      return true;
    }
  }
}

function getBlockPos(line, player) {    // find line with 2 tiles of one color
  if (occupiedTilesIn(line) === 2) {    // and a 3rd one empty
    let blockPos = 0;                   // is used to win and to block the opponent
    let ofColor = 0;
    
    for (let i = 0; i < lines[line].length; i++) {
      if (checked[player].includes(lines[line][i])) {
        ofColor++;
      } else if (tileIsEmpty(lines[line][i])) {
        blockPos = lines[line][i];
      }
    }
    if (ofColor === 2) {
      return blockPos;
    }
  }
  return false;
}

function getLinesOf(xy) {
  let result = [];
  for (let key in lines) {
    if (lines.hasOwnProperty(key)) {
      if (xy === 'all' || lines[key].includes(xy)) {
        result.push(key);
      }
    }
  }
  return result;
}

function getPrefTiles(player) {    // find all directions ('lines') that hold the potential to 
  const emptyTiles = getEmptyTiles();  // get 3 in a row
  let directions = [];
  
  if (checked[player].length === 0 || emptyTiles.length < 3) {
    return false;
  }
  checked[player].map(tile => {          // iterate through all of the color's tiles
    let tileDirs = getLinesOf(tile);     // and get the names of the lines they are part of
    tileDirs.map(dir => {
      if (occupiedTilesIn(dir) === 1) {   // check if there's only one tile occupied
        directions.push(dir);             // two-of-one-color situations are covered by the getBlockPos function
      }
    });
  });
  
  if (directions) {
    return getEmptyTilesFrom(directions);
  }
}    
function getEmptyTilesFrom(directions) {   // gather all the empty tiles per line (with duplicates!)
  let prefTiles = directions.reduce((tiles, dir) => {
    let tilesOfDir = lines[dir].filter(tile => {
      if (tileIsEmpty(tile)) {
        return true;
      }
    });
    return tiles.concat(tilesOfDir);
  }, []);
  return bestTilesOf(prefTiles);
}

function bestTilesOf(tiles) {   // takes an array of tile names and finds the one(s) most frequent
  let pos = 0;                  // makes use of duplicates
  let maxCount = 0;
  let result = tiles.reduce(function(bestTiles, tile, j) {
    pos = j;
    let count = 0;
    for (let i = 0; pos > -1; i++) {
      let newPos = tiles.indexOf(tile, pos) + 1;
      pos = tiles.indexOf(tile, newPos);
      count++;
    }
    if (count > maxCount) {
      maxCount = count;
      return [tile];
    } else if (count === maxCount) {
      bestTiles.push(tile);
      return bestTiles;
    } else {
      return bestTiles;
    }
  }, []);

  if (result.length > 0) {
    return result;
  } else {
    return false;
  }
}

function matchTileArr(arr1, arr2) {    // intersect two arrays: *find the very best tile*
  if (!arr1 && !arr2) {                // try to find overlap of p1 and p2 win fields
    return false;
  } else if (!arr1) {
    return arr2;
  } else if (!arr2) {
    return arr1;
  }
  const matched = [];
  for (let i = 0; i < arr1.length; i++) {
    if (arr2.includes(arr1[i])) {
      matched.push(arr1[i]);
    }
  }
  if (matched.length > 0) {  ////
    return matched;
  } else {
    return arr1;
  }
}

function placeOnCornerOf(arr) {
  if (!arr) {
    return false;
  }
  let result = arr.filter(function(tile) {
    return allCorners.includes(tile);
  });
  
  if (result.length > 0) {
    return placeRandom(result);
  } else {
    return false;
  }
}

// ------------------- AI helper functions -------------

function click(xy) {
  document.getElementById(xy).click();
}

function placeRandom(pool) {
  let rand = pool[Math.floor(Math.random() * pool.length)];
  click(rand);
  return true;
}

function getEmptyTiles() {
  return allTiles.filter(function(xy) {
    if (tileIsEmpty(xy)) {
      return true;
    }
  });
}

function occupiedTilesIn(line) {
  let count = 0;
  for (let i = 0; i < lines[line].length; i++) {
    if (!tileIsEmpty(lines[line][i])) {
      count++;
    }
  }
  return count;
}
