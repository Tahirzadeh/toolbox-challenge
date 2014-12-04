"use strict";

var tiles = []; //declares and set initial variables
var wrong;
var matches;
var remaining; 
var timer;
var prevImg;
var processing;

function setUpGame() {
    clearInterval(timer);
    tiles = [];
    wrong = 0; //resets or sets variables to their inital value (used in game restart)
    matches = 0;
    remaining = 8;
    prevImg = null;
    processing = false;
    displayStats();

    for (var i = 1; i <= 32; i++) {
        tiles.push({ //initializes and set tiles via num.
            tileNum: i,
            src: 'img/tile' + i + '.jpg',
            flipped: false,
            matched: false
        });
    }
    tiles = _.shuffle(tiles);
    var selectedTiles = tiles.slice(0,8);
    var tilePairs = []; //tile array
    _.forEach(selectedTiles, function(tile) {
        tilePairs.push(tile); //add tiles to array
        tilePairs.push(_.clone(tile));
    });

    tilePairs = _.shuffle(tilePairs);
    var gameBoard = $('#game-board'); //+ sets up gameboard, rows, to each other/image
    gameBoard.empty();
    var row = $(document.createElement('div'));
    var img;
    _.forEach(tilePairs, function(tile, elemIndex) {
        if (elemIndex > 0 && 0 === (elemIndex % 4)) {
            gameBoard.append(row);
            row = $(document.createElement('div'));
        }
        img = $(document.createElement('img'));
        img.attr({
            src: 'img/tile-back.png',
            alt: 'tile ' + tile.tileNum
        });
        img.data('tile', tile);
        row.append(img);
    });
    gameBoard.append(row);
}

function startTimer() { //function to start timer, convert to seconds, and incrementally increase
    var startTime = Date.now();
    timer = window.setInterval(function() {
        var elapsedSeconds = (Date.now() - startTime) / 1000;
        elapsedSeconds = Math.floor(elapsedSeconds);
        $('#elapsed-seconds').text(elapsedSeconds + ' seconds');
    }, 1000);
}

$(document).ready(function() {

    $('#start-game').click(function() { //function to start game and timer
        setUpGame();
        startTimer();

        $('#game-board img').click(function() { //used for and not for changing/flipping img
            var clickedImg = $(this);
            var tile = clickedImg.data('tile');
            if (tile.flipped || processing) {
                return;
            } else if (!prevImg) {
                flipTile(tile, clickedImg);
                prevImg = clickedImg;
            } else {
                flipTile(tile, clickedImg);
                compareTiles(clickedImg);
            }
        });
    });
}); 

function compareTiles(clickedImg) { //compares clicked tiles to previous image if previously clicked
    var prevTile = prevImg.data('tile'); //loads tile into prev. var.
    var currentTile = clickedImg.data('tile'); //loads 2nd tile into current tile.
    processing = true;
    if (prevTile.tileNum != currentTile.tileNum) { //if both tiles are different, flip again and reset
        window.setTimeout(function() {
            flipTile(prevTile, prevImg);
            flipTile(currentTile, clickedImg);
            prevImg = null;
            processing = false;
        }, 1000);
        wrong++; //increase total wrong guesses by 1
    } else {
        currentTile.matched = true; //if both tiles are same, +1 matches, -1 remaining.
        prevTile.matched = true;
        matches++;
        remaining--;
        window.setTimeout(function() {
            if (matches == 8) { //once all 8 pairs are found, ask to restart game
                clearInterval(timer);
                if (restartGame()) {
                    setUpGame();
                    startTimer();
                }
            }
        }, 250);
        prevImg = null;
        processing = false;
    }
    displayStats();
}

function displayStats() { //shows pairs found, incorrect guesses, and remaining pairs
    $('#matches').text(matches);
    $('#remaining').text(remaining);
    $('#wrong').text(wrong);
}

function flipTile(tile, img) { //flips tile
    img.fadeOut(100, function() {
        if (tile.flipped) {
            img.attr('src', 'img/tile-back.png');
        }
        else {
            img.attr('src', tile.src);
        }
        tile.flipped = !tile.flipped;
        img.fadeIn(100);
    });
}

function restartGame() { //Congrats user, resets tile status, asks for restart
    return confirm('Congratulations! Do you want to restart the game?');
}