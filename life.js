//////////////////////////////////////////////////////////////////////
//
// life.js
// Simple JavaScript implementation of Conway's game of Life
// Copyright (c) 2016 Bill St. Clair
// MIT License
//
//////////////////////////////////////////////////////////////////////

var life = new Life();
function Life() {
  var self = this;

  // Exported functions
  self.init = init;
  self.getBoard = getBoard;
  self.addGlider = addGlider;
  self.draw = draw;
  self.generation = generation;
  self.clear = clear;

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

  function makeBoard() {
    var board = new Array(size);
    for (var i=0; i<size; i++) {
      var row = new Array(size);
      for (var j=0; j<size; j++) {
        row[j] = 0
      }
      board[i] = row;
    }
    return board;
  }    

  function getBoard() {
    return board;
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
