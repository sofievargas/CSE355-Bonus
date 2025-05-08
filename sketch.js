class Cell {
  constructor(i, j, pos) {
    this.x = i; // x index in the grid
    this.y = j; // y index in the grid
    this.pos = pos; // p5.Vector (3D position)
    this.state = 0;  // 0, 1, or 2
    this.next_state = 0; //0, 1, or 2
  }
}
/*
Three states:
0 -> monolingual (spanish)
1 -> bilingual with preference for dominant language (spanish + catalan)
2 -> bilingual state with preference for secondary language (catalan + spanish)

Format:
for each generation, 
call a function to check what the next state for each cell is.
the next state is determined by summing the values of the cell and its
nine neighbors.

Three thresholds are used to determine each state:
Threshold a = sum value below the threshold results in a sharp transition,
i.e. state 2 to state 0
Threshold b = sum value below the threshold results in a higher value state to lower value state
Threshold c = sum value above the threshold results in a lower value state to higher value state
For example, to change from state 0 to state 1, the sum must be greater than threshold b
To change from state 1 to state 2, sum must be greater than threshold c
*/
let cells = [];
let generation = 0;
let b = 8;
let home = [.481, .064, .426];
let friends = [.466, .07, .455];
let strangers = [0.362, 0.1, 0.528];
let traditional_stores = [.415, 0.077, 0.498];
let large_shopping_malls = [0.333, 0.096, 0.558];
let random_gen = [0.333, 0.333, 0.333];
let zoom;
let zView;
let states;

function setup() {
  let c0 = color(255,0,0);
  let c1 = color(235, 152, 52);
  let c2 = color(0,230,255);
  states = [c0, c1, c2];
  for (let j = 0; j < 105; j++) {
    let row = [];
    for (let i = 0; i < 64; i++) {
      let x = i * 20;
      let y = 0;
      let z = j * 20;
      let pos = createVector(x,y,z);
      let cell = new Cell(i,j,pos);
      row.push(cell);
      console.log(cell.x, cell.y, cell.pos);
    }
    cells.push(row);
  }
  createCanvas(600, 800, WEBGL);

  let nextGen = createButton("Next Generation");

  let sethome = createButton("Home");
  sethome.mousePressed(() => initializeGen(home));
  sethome.position(650, 300);

  let setfriends = createButton("Friends");
  setfriends.mousePressed(() => initializeGen(friends));
  setfriends.position(710, 300);

  let setstrangers = createButton("Strangers");
  setstrangers.mousePressed(() => initializeGen(strangers));
  setstrangers.position(770, 300);

  let setstores = createButton("Stores");
  setstores.mousePressed(() => initializeGen(traditional_stores));
  setstores.position(850, 300);

  let setmalls = createButton("Malls");
  setmalls.mousePressed(() => initializeGen(large_shopping_malls));
  setmalls.position(910, 300);

  let setRandom = createButton("Random");
  setRandom.mousePressed(() => initializeGen(random_gen));
  setRandom.position(1000, 300);

  nextGen.position(650, 200);
  nextGen.mousePressed(() => findNextGen());
  camera(640, 1500, 1050, 640, 0, 1050, 0, 0, -1);

  shape = buildGeometry(createShape);
}

function draw() {
  background(220);
  orbitControl();
  noStroke();
  lights();

  for(let i of cells){
    for (let j of i) {
      push();
      translate(j.pos.x, j.pos.y, j.pos.z);
      fill(states[j.state]);
      sphere(10);
      pop();
    }
  }

}

function createShape(){
  sphere(10);
}

function initializeGen(environment){
  for(let i of cells){
    for (let j of i){
      let r = random();
      if(r < environment[0]){
        j.state = 0;
      }else if(r < environment[0]+environment[1]){
        j.state = 1;
      }else{
        j.state = 2;
      }
      console.log("r = ", r);
    }
  }
}

function findNextGen(){
 for(let i of cells){
   for(let j of i){
      //console.log(cells.length);
     // console.log(cells[0].length);
      let ctest = cells[104][63];
     // console.log(ctest.pos);
      let neighbors = findNeighbors(j);
      //console.log(j.state);
      j.next_state = nextState(neighbors, j.state);
    }
 }

 for(let i of cells){
  for(let j of i){
     //console.log(cells.length);
    // console.log(cells[0].length);
     let ctest = cells[104][63];
    // console.log(ctest.pos);
     let neighbors = findNeighbors(j);
     //console.log(j.state);
     j.state = j.next_state;
   }
}
  generation++;
 console.log("next generation created");

}

function findNeighbors(cell){
  //neighbors indexes = [top left, middle left, bottom left, 
                      //top middle, middle, bottom middle, 
                      //top right, middle right, bottom right]
  neighbors = [];
  for(let i = 0; i < 9; i++){
    let pos = createVector(0,0,0);
    let n = new Cell(0,0, pos);
    neighbors.push(n);
  }
  //cell has no left side
    if(cell.x == 0){
      neighbors[0].x = 63;
      neighbors[1].x = 63;
      neighbors[2].x = 63;
    }else{
      neighbors[0].x = cell.x-1;
      neighbors[1].x = cell.x-1;
      neighbors[2].x = cell.x-1;
    }
    //cell has no right side
    if(cell.x == 63){
      neighbors[6].x = 0;
      neighbors[7].x = 0;
      neighbors[8].x = 0;
    }else{
      neighbors[6].x = cell.x+1;
      neighbors[7].x = cell.x+1;
      neighbors[8].x = cell.x+1;
    }
    //cell has no upper side
    if(cell.y == 0){
      neighbors[0].y = 104;
      neighbors[3].y = 104;
      neighbors[6].y = 104;
    }else{
      neighbors[0].y = cell.y-1;
      neighbors[3].y = cell.y-1;
      neighbors[6].y = cell.y-1;
    }
    //cell has no lower side
    if(cell.y == 104){
      neighbors[2].y = 0;
      neighbors[5].y = 0;
      neighbors[8].y = 0;
    }else{
      neighbors[2].y = cell.y+1;
      neighbors[5].y = cell.y+1;
      neighbors[8].y = cell.y+1;
    }
    neighbors[1].y = cell.y;
    neighbors[3].x = cell.x;
    neighbors[5].x = cell.x;
    neighbors[7].y = cell.y;
    neighbors[4] = cell;
    new_neighbors = []
    for(let n of neighbors){
      //(n.x, n.y, n.pos);
      //console.log(cells[n.y][n.x].pos);
      new_neighbors.push(cells[n.y][n.x]);

    }
    return new_neighbors;
}

function nextState(neighbors, state){
  let sum = 0;
  for(let n of neighbors){
    sum += n.state;
  }
  let a = 3;
  let c = 15;
  //console.log(sum);
  switch (state){
    case 0:
      if(sum <= b){
        return 0;
      }
      else if(sum > b){
        return 1;
      }
      break;
    case 1:
      if(sum < b){
        return 0;
      }
      else if(sum >= b && sum <= c){
        return 1;
      }
      else if(sum > c){
        return 2;
      }
      break;
    case 2:
      if(sum <= a){
        return 0;
      }
      else if(sum > a && sum < b){
        return 1;
      }
      else if(sum >= b){
        return 2;
      }
      break;
  }
}

