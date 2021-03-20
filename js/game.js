const stones = [
  {
    name: "I",
    color: "cyan",
    odds: 3,
    form: [
      [ 0, 0, 0, 0 ],
      [ 1, 1, 1, 1 ],
      [ 0, 0, 0, 0 ],
      [ 0, 0, 0, 0 ]
    ]
  },
  {
    name: "J",
    color: "blue",
    odds: 3,
    form: [
      [ 1, 0, 0 ],
      [ 1, 1, 1 ],
      [ 0, 0, 0 ]
    ]
  },
  {
    name: "L",
    color: "orange",
    odds: 3,
    form: [
      [ 0, 0, 1 ],
      [ 1, 1, 1 ],
      [ 0, 0, 0 ]
    ]
  },
  {
    name: "O",
    color: "yellow",
    odds: 3,
    form: [
      [ 0, 1, 1, 0 ],
      [ 0, 1, 1, 0 ],
      [ 0, 0, 0, 0 ]
    ]
  },
  {
    name: "S",
    color: "green",
    odds: 3,
    form: [
      [ 0, 1, 1 ],
      [ 1, 1, 0 ],
      [ 0, 0, 0 ]
    ]
  },
  {
    name: "T",
    color: "purple",
    odds: 3,
    form: [
      [ 0, 1, 0 ],
      [ 1, 1, 1 ],
      [ 0, 0, 0 ]
    ]
  },
  {
    name: "Z",
    color: "red",
    odds: 3,
    form: [
      [ 1, 1, 0 ],
      [ 0, 1, 1 ],
      [ 0, 0, 0 ]
    ]
  }
];

$( "Document" ).ready( function() {
  startGame();
});

const random = new Random.Random();
let gamePause = false;
let stateGameOver = false;
let lastStone = "";
let curStone = "";
let nextStones = [];
let board = [];
let c = 0;

let pauseToNextRound = false;

let curStoneHorPosi = 0;
let curStoneVerPosi = 0;
let nextStoneTimeOut = null;
let stoneGravity = null;

let points = 0;
let lines = 0;
let level = 0;
let speed = 750;

let levelSpeed = {
  '0': 750, '1': 716, '2': 633, '3': 550, '4': 466, '5': 383,
  '6': 300, '7': 216, '8': 133, '9': 100, '10': 83, '11': 83,
  '12': 83, '13': 66, '14': 66, '15': 66, '16': 50, '17': 50,
  '18': 50, '19': 33, '20': 33, '21': 33, '22': 33, '23': 33,
  '24': 33, '25': 33, '26': 33, '27': 33, '28': 33, '29': 33,
  '30': 16
};

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random.integer(0, i));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getStoneType()
{
  shuffle(stones);

  let maxOdd = 0;
  let testOdd = 0;
  stones.forEach( s => {
    maxOdd += s.odds;
  });

  if( maxOdd < 5 ){
    stones.forEach( s => {
      s.odds = 3;
    });
  }

  let posi = Math.floor( random.integer(0, maxOdd) );
  let stoneType;
  let stop = false;

  stones.forEach( ( s, i ) => {
    testOdd += s.odds;
    if( posi <= testOdd && !stop ){
      stoneType = stones[i];
      stop = true;

      if( stoneType.name == lastStone.name ){
        if( s.odds - 3 > 0 ){
          s.odds = s.odds - 1;
        }else{
          s.odds = 0;
        }
      }else{
        s.odds = s.odds - 1;
      }
    }
  });

  lastStone = stoneType;
  return stoneType;
  c++;
}

function startGame() {

  for(var i = 0; i < 22; i++) {
    $("board").append("<line class='line_"+i+"'></line>");
    board.push( [] );

    for (var j = 0; j < 10; j++) {
      $(".line_" + i).append("<cube value='0' stoneType='' class='cube_"+j+"'></cube>");
      board[i].push( [0] );
    }
  }

  $("board").append("<overlay></overlay");

  for(var i = 0; i < 6; i++) {
    nextStones.push( getStoneType() );
  }

  nextRound();
}

function nextRound() {
  pauseToNextRound = true;

  if( stoneGravity !== null ){
    clearInterval(stoneGravity);
    stoneGravity = null;
  }

  // place Stone
  $('.temp').removeClass('temp');
  $('ghostStone').remove();

  // Check for lines to clear
  cleanLines( function() {
    if( setStoneToStart() ) {
      if( stoneGravity === null ) {
        stoneGravity = setInterval( function() {
          move('down');
        }, speed );
      }
    }

    updateNextPrev();
    pauseToNextRound = false;
  });
}

function updateNextPrev() {
  // Set next stone

  nextStones.shift();
  nextStones.push( getStoneType() );

  $("next prev").each( function( i ) {
    $(this).html( "<stone type='"+nextStones[i].name+"' class='"+nextStones[i].name+"'></stone>" );
  });
}

function testSetStone(startPosiHor, startPosiVer) {
  let cantSet = 0;

  nextStones[ 0 ].form.forEach( (form, i) => {
    form.forEach( (cube, j) => {
      if( cube === 1 ) {
        let pVer = startPosiVer + i;
        let pHor = startPosiHor + j;
        let testVal = parseInt( $('.line_'+pVer+' .cube_'+pHor).attr('value') );

        if( testVal === 1 ) {
          cantSet++;
        }
      }
    });
  });

  if( cantSet === 0 ){
    return true;
  }else{
    return false;
  }
}

function setStoneToStart() {
  curStone = nextStones[0];
  let stoneType = curStone.name;

  var startPosiHor = 3;

  var cantSet = 0;
  var startPosiVer = 2;

  if( !testSetStone(startPosiHor, startPosiVer) ) {
    var startPosiVer = 1;
    if( !testSetStone(startPosiHor, startPosiVer) ) {
      cantSet = 1;
      startPosiVer = 0;

      if( !testSetStone(startPosiHor, startPosiVer) ) {
        startPosiVer = -1;
        gameOver();
      }
    }
  }

  nextStones[ 0 ].form.forEach( (form, i) => {
    form.forEach( (cube, j) => {
      if( cube === 1 ) {
        let pVer = startPosiVer + i;
        let pHor = startPosiHor + j;
        $('.line_'+pVer+' .cube_'+pHor).addClass('temp').attr('value','1').attr('stonetype', stoneType);
      }
    });
  });

  curStoneHorPosi = startPosiHor;
  curStoneVerPosi = startPosiVer;

  drawGhost();

  if( cantSet === 0 ) {
    return true;
  }else{
    return false;
  }
}

function testMove( direction, value = 1 ) {
  let cantMove = 0;
  for(var line = 21; line >= 0; line--) {
    if( direction === "down" || direction === "left" ) {
      $('.line_'+line+' cube').each( function(i) {
        if( $(this).hasClass('temp') ) {
          var val = parseInt( $(this).attr('value') );
          if( direction === "down" ) {
            var testVal = parseInt( $('.line_'+(line+value)+' .cube_'+i).not('.temp').attr('value') );
            if( val + testVal > 1 || line+value === 22 ) {
              cantMove++;
            }
          }else if( direction === "left" ){
            var testVal = parseInt( $('.line_'+line+' .cube_'+(i-value)).not('.temp').attr('value') );
            if( val + testVal > 1 || i === 0 ) {
              cantMove++;
            }
          }
        }
      });
    }else if( direction === "right" ){
      for(var j = 9; j >= 0; j--) {
        if( $('.line_'+line+' .cube_'+j).hasClass('temp') ){
          var val = parseInt( $('.line_'+line+' .cube_'+j).attr('value') );
          var testVal = parseInt( $('.line_'+line+' .cube_'+(j+value)).not('.temp').attr('value') );
          if( val + testVal > 1 || j === 9 ) {
            cantMove++;
          }
        }
      }
    }
  }

  if( cantMove === 0 ){
    return true;
  }else{
    return false;
  }
}

function move( direction, value = 1 ) {
  if( !pauseToNextRound ) {
    if( testMove( direction, value ) ) {
      if( nextStoneTimeOut !== null ) {
        clearTimeout( nextStoneTimeOut );
        nextStoneTimeOut = null;
      }

      for(var line = 21; line >= 0; line--) {
        if( direction === "down" || direction === "left" ) {
          $('.line_'+line+' cube').each( function(j) {
            if( $(this).hasClass('temp') ){
              var val = $(this).attr('value');
              var type = $(this).attr('stoneType');
              $(this).attr('value','0').attr('stoneType','').removeClass('temp');

              if( direction === "down" ) {
                if( val > 0 ){
                  $('.line_'+(line+value)+' .cube_'+j).attr('value',val).attr('stoneType',type).addClass('temp');
                }
              }else if( direction === "left" ) {
                if( val > 0 ){
                  $('.line_'+line+' .cube_'+(j-value)).attr('value',val).attr('stoneType',type).addClass('temp');
                }

              }
            }
          });
        }else if( direction === "right" ) {
          for(var j = 9; j >= 0; j--) {
            if( $('.line_'+line+' .cube_'+j).hasClass('temp') ){
              var val = $('.line_'+line+' .cube_'+j).attr('value');
              var type = $('.line_'+line+' .cube_'+j).attr('stoneType');
              $('.line_'+line+' .cube_'+j).attr('value','0').attr('stoneType','').removeClass('temp');

              if( val > 0 ){
                $('.line_'+line+' .cube_'+(j+value)).attr('value',val).attr('stoneType',type).addClass('temp');
              }
            }
          }
        }
      }

      if( direction === "down" ) {
        curStoneVerPosi += value;
      }else if( direction === "left" ) {
        curStoneHorPosi -= value;
      }else if( direction === "right" ) {
        curStoneHorPosi += value;
      }

      drawGhost();

    }else{
      if( direction === "down" ) {
        if( nextStoneTimeOut === null ) {
          nextStoneTimeOut = setTimeout(function() {
            nextStoneTimeOut = null;
            if( !stateGameOver ) {
              nextRound();
            }
          }, 400);
        }
      }
    }
  }
}

function drawGhost() {
  $('ghostStone').remove();

  let stoneType = curStone.name;
  let stoneWidth = curStone.form[0].length;
  let stoneHight = curStone.form.length;

  for (var i = 0; i <= 21; i++) {
    if( !testMove('down', i) ) {

      $('overlay').append(
        "<ghostStone class='"+stoneType+"'" +
        "style='" +
          "height: calc( var(--game-height) / 20 * "+stoneHight+" );" +
          "width: calc( var(--game-width) / 10 * "+stoneWidth+" );" +
          "background-size: auto calc( var(--game-height) / 20 * "+stoneHight+" );" +
          "left: calc( var(--game-width) / 10 * "+curStoneHorPosi+" );" +
          "top: calc(var(--game-height) / 20 * "+(i+curStoneVerPosi-1)+" );" +
          "'>" +
        "</ghostStone>"
      );

      i = 23;
    }
  }
}

function cleanLines( callback ) {
  let clearLineArr = [];

  for(var line = 21; line >= -1; line--) {
    let lineValue = 0;
    $('.line_'+line+' cube').each( function() {
      lineValue += parseInt( $(this).attr('value') );
    });

    if( lineValue === 10 ){
      clearLineArr.push( line );
    }
  }

  clearLineArr.forEach( line => {
    // empty lines
    $('.line_'+line+' cube').each( function() {
      $(this).attr('value','0').attr('stoneType','').removeClass('temp');
    });
  });

  // move down
  let moveDown = 0;
  setTimeout(function () {
    for(var i = 21; i >= 0; i--) {
      if( clearLineArr.indexOf( i+1 ) > -1 ) {
        moveDown++;
      }

      $('.line_'+i+' cube').each( function(j) {
        var val = $('.line_'+i+' .cube_'+j).attr('value');
        var type = $('.line_'+i+' .cube_'+j).attr('stoneType');

        $('.line_'+i+' .cube_'+j).attr('value','0').attr('stoneType','');
        $('.line_'+(i+moveDown)+' .cube_'+j).attr('value',val).attr('stoneType',type);
      });
    }
  }, 500);

  if( clearLineArr.length > 0 ) {
    setTimeout(function () {
      callback();
    }, 750);
  }else{
    callback();
  }
}

function togglePause() {
  //TODO besser machen
  if( gamePause === false ) {
    gamePause = true;

    clearInterval(stoneGravity);

    console.log( 'pause' );
  }else{
    gamePause = false;

    stoneGravity = setInterval( function() {
      move('down');
    }, speed );

    console.log( 'unpause' );
  }
}

function gameOver() {
  clearInterval(stoneGravity);

  stateGameOver = true;

  console.log( 'Game Over' );
}

$( document ).keydown( function(e) {
  if( !stateGameOver && !pauseToNextRound ) {
    if( e.keyCode == 39 && !gamePause ) { // ->
      move( "right" );
    }else if( e.keyCode == 37 && !gamePause ) { // <-
      move( "left" );
    }else if( e.keyCode == 40 && !gamePause ) { // V
      move( "down" );
    }else if( e.keyCode == 38 && !gamePause ) { // /\
      //rotate
    }else if( e.keyCode == 32 && !gamePause ) { // space
      //full down
    }else if( e.keyCode == 27 ) { // ESC
      togglePause();
    }
  }
});
