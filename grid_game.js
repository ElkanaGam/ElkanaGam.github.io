const SIZE = 49;
const ocuppied = [0, 0, 1, 1, 1, 0, 0,
                  0, 0, 1, 1, 1, 0, 0,
                  1, 1, 1, 1, 1, 1, 1,
                  1, 1, 1, 0, 1, 1, 1,
                  1, 1, 1, 1, 1, 1, 1,
                  0, 0, 1, 1, 1, 0, 0,
                  0, 0, 1, 1, 1, 0, 0];


var gameMoves = []

function isWin(){
    var total = 0;
    for (var i=0; i<SIZE; i++){
        total += ocuppied[i];
        
    }
    return ((total ===1) && (ocuppied[24]===1));
}


const notInBoard = [0, 1, 5, 6, 7, 8, 12, 13, 35, 36, 40, 41, 42, 43, 47, 48];

var targetCells = [];

function parseId(s) {
    var id = s.slice(5);
    return Number(id);
}


function parseMove(s){
    var delimeter = s.indexOf('-')
    var src  = s.slice(0,delimeter);
    var target = s.slice(delimeter+1);
    return {
        src: src,
        target :target
    };
}
function undo(){
    if (gameMoves.length >0){
    var lastMove = gameMoves.pop();
    
    
    var cells = parseMove(lastMove);
    var jumped = getJumpedCell(cells.src, cells.target);
    console.log(jumped);
    console.log(cells.src);
    console.log(cells.target);
    document.querySelector('#cell_'+cells.src).setAttribute('draggable', 'true');
    document.querySelector('#cell_'+cells.src).setAttribute('src', 'circle.png');
    ocuppied[cells.src] = 1;
    document.querySelector('#cell_'+cells.target).setAttribute('src', 'transpernt.png');
    document.querySelector('#cell_'+cells.src).setAttribute('draggable', 'false')
    ocuppied[cells.target] = 0;
    document.querySelector('#cell_'+jumped).setAttribute('draggable', 'false');
    document.querySelector('#cell_'+jumped).setAttribute('src', 'circle.png');
    ocuppied[jumped] = 1;
        
    var head = document.getElementById('head');
    head.innerHTML = 'Welcome to peg solitere game';
    
    }
    move();
    
    
    
}

function createOptional(i) {
    var cells = [];
    cells.push(i + 2);
    cells.push(i - 2);
    cells.push(i + 14);
    cells.push(i - 14);
    return cells;
    

}

function realMove(target, source) {
    if (target < 0 || target > 48) {
        return false;
    } else if (notInBoard.includes(target)) {
        return false;
    } else if (Math.floor(target / 7) !== Math.floor(source / 7) && (Math.abs(source - target) === 2)) {
        return false;
    }
    return true;

}

function legalSequence(target, source){
    var difference = target - source;
    switch (difference){
        case 2: // right
            return ((ocuppied[source+1]===1) && (ocuppied[target] === 0));
        case -2: // left
            return ((ocuppied[source-1]===1) && (ocuppied[target] === 0));
        case 14: // down
            return ((ocuppied[source+7]===1) && (ocuppied[target] === 0));
        case -14: // up
            return ((ocuppied[source-7]===1) && (ocuppied[target] === 0));
        default:
            return false;
    }
    
}


function createRealMoves(cell){
    
    var optional = createOptional(cell);
    var realMoves = [];
    for (var i=0; i<optional.length; i++){
        if (realMove(optional[i], cell) &&  legalSequence(optional[i], cell)){
            realMoves.push(optional[i])
        }
    }
    return realMoves;
    
}

function move() {
    console.log('mov');
    for (i = 0; i < SIZE; i++) {
        
        if (notInBoard.includes(i)){
            continue;
        }else{
        var currentCell = document.querySelector('#cell_' + i);
        if (ocuppied[i] ===1){            
            
            var items = createRealMoves(i);
            if (items.length > 0) {
                // make this cell dragable
                currentCell.setAttribute('draggable', 'true');
                currentCell.style.backgroundColor = 'red';
                
                currentCell.addEventListener('dragstart', handleDragStart, false);
                currentCell.addEventListener('dragend', handleDragEnd, false);


            } else {
                currentCell.style.backgroundColor = '#eaac7f';
                currentCell.setAttribute('draggable', 'false');
            }
        }else{
            
            currentCell.style.backgroundColor = '#eaac7f';
            currentCell.setAttribute('draggable', 'false');
        }
        }
    }
}



function handleDragStart(e) {
    this.style.opacity = '0.4';
    var draggedId = parseId(this.id)
    var items = createRealMoves(draggedId);
    var l = items.length;

    for (i = 0; i < l; i++) {
        var target = document.querySelector("#cell_" + items[i])
        targetCells.push(target);
        target.classList.add('over');
        target.addEventListener('dragover', handleDragOver);
        target.addEventListener('drop', handleDrop, false);
    }

    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedId);

}

function handleDragOver(e) {
    e.preventDefault();
}

function getJumpedCell(id1, id2) {
    var j = Math.abs(id1 - id2);
    switch (j){
        case 2:
            return Math.max(id1, id2) - 1;
            break;
        case 14:
            return Math.max(id1, id2) - 7;
            break;
        default:
            return 0;
    }
}

function handleJump(id1, id2) {
    
    var jumped = document.querySelector("#cell_" + getJumpedCell(id1, id2))
    jumped.setAttribute('src', './transpernt.png');
    ocuppied[id1] = 1;
    ocuppied[id2] = 0;
    ocuppied[parseId(jumped.id)] = 0;
    gameMoves.push(id2+"-"+id1)
    
    
}

function handleDrop(e) {
    e.stopPropagation();
    if (dragSrcEl !== this) {
        this.setAttribute('src', "./circle.png");

        var prev = document.querySelector('#cell_' + e.dataTransfer.getData('text/html'))
        prev.setAttribute('src', './transpernt.png');
        prev.style.backgroundColor = '#eaac7f';
        handleJump(parseId(this.id), parseId(prev.id));
        console.log(""+prev.id+"->"+" "+this.id)
        this.setAttribute('draggable', 'false');

        
    }
    if (toContinue()){
            move();
     }
    else{
        move(); // for clear all cell from previos state
        var head = document.getElementById('head');
        if (isWin()){
            head.innerHTML = 'GREAT! YOU WON THE GAME!'
        }
        else{
            head.innerHTML = 'GAME OVER' 
        }
    }
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    var l = targetCells.length;

    for (i = 0; i < l; i++) {
        targetCells[i].classList.remove('over');
        targetCells[i].removeEventListener('drop', handleDrop, false);
    }
}

function toContinue(){
    for (i = 0; i < SIZE; i++) {
        if (ocuppied[i] === 1){
        
            var items = createRealMoves(i);
            if (items.length > 0) {
                return true;
            }
        }
    }return false
    
}







var undoBtn = document.querySelector('#undo' );
undoBtn.addEventListener('click', undo, false);
move();
 