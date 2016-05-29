//////////////////////////////////////////////////////////////////////
//
// life.js
// Simple JavaScript implementation of Conway's game of Life
// Copyright (c) 2016 Bill St. Clair <bill@billstclair.com>
// MIT License
//
//////////////////////////////////////////////////////////////////////

var life = new Life();
function Life() {
  var self = this;

  // Exported functions
  self.init = init;
  self.getBoard = getBoard;
  self.copyBoard = copyBoard;
  self.getSize = getSize;
  self.areBoardsEqual = areBoardsEqual;
  self.liveCells = liveCells;
  self.addGlider = addGlider;
  self.eventCallback = eventCallback;
  self.draw = draw;
  self.generation = generation;
  self.clear = clear;
  self.installBoard = installBoard;
  self.saveBoard = saveBoard;
  self.restoreBoard = restoreBoard;

  var canvas;
  var ctx;
  var width;
  var height;
  var size;
  var board;

  var defaultSize = 50;

  function init(theCanvas, theSize) {
    if (theSize === undefined) theSize = defaultSize;
    canvas = theCanvas;
    ctx = canvas.getContext('2d');
    size = theSize;
    width = canvas.width;
    height = canvas.height;
    clear();
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
  }

  var eventCallback = null;

  function eventCallback(newCallback) {
    if (newCallback === undefined) {
      return eventCallback;
    } else {
      eventCallback = newCallback;
    }
  }

  function listener(e) {
    var pos = eventPos(e)
    if (!pos) return;

    var offset = $(canvas).offset();
    var x = pos.x - offset.left
    var y = pos.y - offset.top;

    var j = Math.floor(x * size / canvas.width);
    var i = Math.floor(y * size / canvas.height);

    var row = board[i];
    if (row) {
      var cell = row[j];
      row[j] = cell==0 ? 1 : 0;

      draw();
      if (eventCallback) eventCallback(i, j);
    }
  }

  function eventPos(event) {
    var posx = 0;
    var posy = 0;
    if (!event) event = window.event;
    self.lastEvent = event;

    var touches = event.targetTouches;
    if (touches) {
      // iphone startTouch event
      if (touches.length != 1) return null;
      posx = touches[0].pageX;
      posy = touches[0].pageY;
    } else if (event.pageX || event.pageY) 	{
      posx = event.pageX;
      posy = event.pageY;
    }
    else if (event.clientX || event.clientY) 	{
      posx = event.clientX + document.body.scrollLeft
	+ document.documentElement.scrollLeft;
      posy = event.clientY + document.body.scrollTop
	+ document.documentElement.scrollTop;
    }
    return {x:posx, y:posy};
  }

  function addGlider() {
    board[2][0] = 1;
    board[2][1] = 1;
    board[2][2] = 1;
    board[1][2] = 1;
    board[0][1] = 1;
  }

  function clear() {
    board = makeBoard();
    draw();
  }

  function err(text) {
    throw new Error(text);
  }

  function installBoard(b) {
    if (!Array.isArray(b)) err("installBoard: not an array");
    var len = b.length;

    for (var i=0; i<len; i++) {
      var row = b[i];
      if (!Array.isArray(row)) err("installBoard: row not an array");
      if (len != row.length) err("installBoard: bad row length");
    }

    if (len != size) {
      size = len;
      board = makeBoard();
    }

    for (var i=0; i<size; i++) {
      var row = board[i];
      var brow = b[i];
      for (var j=0; j<size; j++) {
        row[j] = brow[j];
      }
    }
    draw();
  }

  function makeBoard(sz) {
    if (sz === undefined) sz = size;
    var board = new Array(sz);
    for (var i=0; i<sz; i++) {
      var row = new Array(sz);
      for (var j=0; j<sz; j++) {
        row[j] = 0
      }
      board[i] = row;
    }
    return board;
  }    

  function getBoard() {
    return board;
  }

  function copyBoard(fromBoard) {
    if (fromBoard === undefined) fromBoard = board;
    var res = makeBoard();
    for (var i=0; i<size; i++) {
      var fromRow = fromBoard[i];
      var row = res[i];
      for (var j=0; j<size; j++) {
        row[j] = fromRow[j];
      }
    }
    return res;
  }

  function getSize() {
    return size;
  }

  function liveCells(b) {
    if (b == undefined) b = board;
    var res = 0;
    for (var i=0; i<size; i++) {
      var row = b[i];
      for (var j=0; j<size; j++) {
        if (row[j]) res++;
      }
    }
    return res;
  }

  function areBoardsEqual(b1, b2) {
    if (b2 === undefined) b2 = board;
    if (!(b1 && b2)) return false;
    for (i=0; i<size; i++) {
      var r1 = b1[i];
      var r2 = b2[i];
      for (j=0; j<size; j++) {
        if (r1[j] != r2[j]) return false;
      }
    }
    return true;
  }

  function saveBoard(b) {
    if (b === undefined) b = board;
    var res = "";
    var restail = "";
    for (var i=0; i<size; i++) {
      var row = b[i];
      var txt = "";
      var tail = "";
      for (var j=0; j<size; j++) {
        if (row[j]) {
          txt = txt + tail + "O";
          tail = "";
        } else {
          if (i == 0) {
            txt += ".";
          } else {
            tail += ".";
          }
        }
      }
      if (i != 0) restail += "\n";
      if (txt == "") {
        if (txt == "") txt = ".";
        restail += txt;
      } else {
        res += restail + txt;
        restail = "";
      }
    }
    return res;
  }

  function restoreBoard(str) {
    var sz = str.indexOf("\n");
    if (sz == -1) sz = str.length;
    if (sz <= 1) err('restoreBoard: size too small: ' + sz);
    if (sz > 200) err('restoreBoard: size too big: ' + sz);
    var b = makeBoard(sz);
    var strlen = str.length;
    var minlen = sz*(sz+1) - 1;
    var idx = 0;
    for (var i=0; i<sz; i++) {
      var row = b[i];
      for (var j=0; j<sz; j++) {
        if (idx >= strlen) break;
        var ch = str[idx++];
        if (ch == "\n") {
          idx--;
          break;
        }
        if ((ch != ".") && (ch != " ")) row[j] = 1;
      }
      if (idx >= strlen) break;
      if (idx < minlen) {
        var ch = str[idx++];
        if (ch != "\n") err("restoreBoard: missing newline at end of row");
      }
    }
    return b;
  }

  function draw() {
    var xinc = (width-1)/size;
    var yinc = (height-1)/size;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    for (var i=0; i<=size; i++) {
      var y = i*yinc
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    for (var j=0; j<=size; j++) {
      var x = j*xinc
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle='lightblue';
    ctx.stroke();

    ctx.fillStyle = 'black';
    for (var i=0; i<size; i++) {
      var y = i*yinc + 1;
      row = board[i];
      for (var j=0; j<size; j++) {
        x = j*xinc + 1;
        var cell = row[j]
        if (cell != 0) {
          ctx.fillRect(x, y, xinc-2, yinc-2);
        }
      }
    }
  }

  function countNeighbors(j, prow, row, nrow) {
    var pj = j==0 ? size-1 : j-1;
    var nj = (j+1)%size;
    return prow[pj]+prow[j]+prow[nj]+
      row[pj]+row[nj]+
      nrow[pj]+nrow[j]+nrow[nj];
  }

  function generation() {
    var b = makeBoard();
    var prow = board[size-1];
    var row = board[0];
    for (var i=0; i<size; i++) {
      var nrow = board[(i+1)%size];
      var out = b[i];
      for (var j=0; j<size; j++) {
        var cnt = countNeighbors(j, prow, row, nrow);
        if (cnt == 3) {
          out[j] = 1;
        } else if (cnt == 2) {
          out[j] = row[j];
        } else {
          out[j] = 0;
        }
      }
      prow = row;
      row = nrow;
    }
    board = b;
  }
}
