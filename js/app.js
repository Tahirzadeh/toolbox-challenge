"use strict";

var tiles = [];
var matches;
var wrong;
var timer;
var previousImg;
var remaining;
var processing;

function setUpGame() {
    matches = 0;
    wrong = 0;
    clearInterval(timer);
    previousImg = null;
    remaining = 8;
    processing = false;
    displayStats();

    for (var i = 1; i <= 32; i++) {
        tiles.push({
            tileNum: i,
            src: 'img/tile' + i + '.jpg',
            flipped: false,
            matched: false
        });
    } //for each tile
    tiles = _.shuffle(tiles);
    var selectedTiles = tiles.slice(0,8);
    var tilePairs = [];
    _.forEach(selectedTiles, function(tile) {
        tilePairs.push(tile);
        tilePairs.push(_.clone(tile));
    });
    tilePairs = _.shuffle(tilePairs);

    var gameBoard = $('#game-board');
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

function startTimer() {
    //get starting milliseconds
    var startTime = Date.now();
    timer = window.setInterval(function() {
        var elapsedSeconds = (Date.now() - startTime) / 1000;
        elapsedSeconds = Math.floor(elapsedSeconds);
        $('#elapsed-seconds').text(elapsedSeconds + ' seconds');
    }, 1000);
}

$(document).ready(function() {

    $('#start-game').click(function() {
        setUpGame();
        startTimer();

        $('#game-board img').click(function() {
            var clickedImg = $(this);
            var tile = clickedImg.data('tile');
            if (tile.flipped || processing) {
                return;
            } else if (!previousImg) {
                flipTile(tile, clickedImg);
                previousImg = clickedImg;
            } else {
                flipTile(tile, clickedImg);
                compareTiles(clickedImg);
            }
        });
    }); //start game button click
}); //document ready function

function compareTiles(clickedImg) {
    var prevTile = previousImg.data('tile');
    var curTile = clickedImg.data('tile');
    processing = true;
    if (prevTile.tileNum != curTile.tileNum) {
        window.setTimeout(function() {
            flipTile(prevTile, previousImg);
            flipTile(curTile, clickedImg);
            previousImg = null;
            processing = false;
        }, 1000);
        wrong++;
    } else {
        curTile.matched = true;
        prevTile.matched = true;
        matches++;
        remaining--;
        window.setTimeout(function() {
            if (matches == 8) {
                //prompt user for restart
                clearInterval(timer);
                if (restartGame()) {
                    setUpGame();
                    startTimer();
                }
            }
        }, 250);

        previousImg = null;
        processing = false;
    }
    displayStats();
}

function restartGame() {
    return confirm('Would you like to restart the game?');
}

function displayStats() {
    $('#matches').text(matches);
    $('#remaining').text(remaining);
    $('#wrong').text(wrong);
}

function flipTile(tile, img) {
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
