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
let b = 5;
let home = [.481, .064, .426];
let friends = [.466, .07, .455];
let strangers = [0.362, 0.1, 0.528];
let traditional_stores = [.415, 0.077, 0.498];
let large_shopping_malls = [0.333, 0.096, 0.558];
let random_gen = [0.333, 0.333, 0.333];
let zoom;
let zView;
let states;
let setBText;
let setB;
let currDist = [0,0,0];
let currDistText;

function setup() {
  let c0 = color(255,0,0);
  let c1 = color(255, 196, 59);
  let c2 = color(3, 219, 255);
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
  background(255, 208, 181);

  let title = createP("<b>Cellular Automata: Simulating the Catalan Language");
  title.position(650, 0);
  title.addClass("p");

  let nextGen = createButton("Next Generation");
  nextGen.mousePressed(() => findNextGen());
  nextGen.position(650, 230);

  let sethome = createButton("Home");
  sethome.mousePressed(() => initializeGen(home));
  sethome.position(650, 300);

  let setfriends = createButton("Friends");
  setfriends.mousePressed(() => initializeGen(friends));
  setfriends.position(650, 370);

  let setstrangers = createButton("Strangers");
  setstrangers.mousePressed(() => initializeGen(strangers));
  setstrangers.position(650, 440);

  let setstores = createButton("Traditional Stores");
  setstores.mousePressed(() => initializeGen(traditional_stores));
  setstores.position(650, 510);

  let setmalls = createButton("Large Shopping Malls");
  setmalls.mousePressed(() => initializeGen(large_shopping_malls));
  setmalls.position(650, 580);

  let setRandom = createButton("Random");
  setRandom.mousePressed(() => initializeGen(random_gen));
  setRandom.position(650, 650);


  let intro = createP(`<p>This cellular automaton is designed to simulate language shifts, 
    using data on Catalan/Spanish speakers. Each person (sphere) to the left can be in one of three states:
    Red for monolingual (Spanish) speakers,
    Yellow for bilingual speakers with a preference for the dominant language (Spanish & Catalan),
    and finally Blue for bilingual speakers with a preference for the secondary language (Catalan & Spanish).
    Initialize the first generation based on the language usage over different environments, such as at home, with friends, etc.
    Then press Next Generation to see the change in the distribution.</p>`);
  intro.position(1000, 230);
  intro.addClass("intro");

  setB = createSlider(5, 12, 7, 1);
  setB.position(100, 800);
  setBText = createP(`<b>B Threshold Value = ${setB.value()} </b>`);
  setBText.position(100, 810);
  setBText.addClass("intro");

  currDistText = createP(`<b> Red: %${ currDist[0]*100 }   Yellow: %${currDist[1]*100}   Blue: %${currDist[2]*100}`);
  currDistText.position(300, 810);
  currDistText.addClass("intro");


  let description = createP("<b>Background</b>");
  description.position(100, 850);
  description.addClass("p");

  let description2 = createP(`<p>
  The project is a visualizationi of the findings in <b>"A Language Shift Simulation Based on Cellular Automata"</b>, 
  cited below. For each speaker, or sphere, the next state is determined by summing up the state values of the speaker themself
  along with its eight adjacent neighbors. The resulting sum is then evaluated against three thresholds, known as A, B, and C.
  <br /> <br />
  Threshold A = sum value below the threshold results in a sharp transition
  (i.e. blue to red), <br />
  Threshold B = sum value below the threshold results in a higher value state to lower value state <br />
  Threshold C = sum value above the threshold results in a lower value state to higher value state
  (i.e. red to yellow) <br /> <br />
  <b>Remarks </b> <br />
  It is rare/virtually impossible for a transition from red to blue happen. This follows naturally, as this would
  represent a monolingual Spanish speaker transitioning to a bilingual speaker with a preference for Catalan.
  <br /> <br />
  As seen in the paper as well as the simulation above, the behavior of the automaton differs greatly based on what 
  threshold B is. Changing the slider above will update the value accordingly. Based on which initial environment is chosen
  for the first generation, the B threshold will determine when and if the secondary language, or Catalan, will go extinct.
  As the paper states in reference to the point at which the secondary language becomes extinct or survives: <br /> <br />
  "In the four social contexts where the values of state 0 at t = 0 were lowest 
  (at home, with friends, with strangers and in traditional stores), 
  the reversal took place at the thresholds of b = 7 and b = 8, but the social context 
  where the value of state 0 at t = 0 was highest (at large shopping malls), 
  the reversal was observed at thresholds of b = 6 and b = 7."
  <br /> <br />
  Threshold A is set to 3 and Threshold C is set to 15 for all environments.

  <br /> <br />
  <b> Work Cited <br /> <br />
  F. S. Beltran, S. Herrando, Violant Estreder, D. Ferreres, and M. Ruiz-Soler, 
  “A Language Shift Simulation Based on Cellular Automata,” Jan. 01, 2010. 
  <a href=https://www.researchgate.net/publication/259557981_A_Language_Shift_Simulation_Based_on_Cellular_Automata">https://www.researchgate.net/publication/259557981_A_Language_Shift_Simulation_Based_on_Cellular_Automata</a>
‌

  </p>`);
  description2.position(100, 950);
  description2.addClass("intro");



  camera(640, 2500, 1050, 640, 0, 1050, 0, 0, -1);


  shape = buildGeometry(createShape);
}

function draw() {
  orbitControl();
  background(255, 208, 181);
  noStroke();
  lights();
  setBText.html(`<b>B Value = ${setB.value()} </b>`);
  b = setB.value();
  currDistText.html(`<b> Red: ${currDist[0]}   Yellow: ${currDist[1]}   Blue: ${currDist[2]}`);

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
  currDist[0] = environment[0];
  currDist[1] = environment[1];
  currDist[2] = environment[2];
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
  findDist();
}

function findDist(){
  let curr0 = 0;
  let curr1 = 0;
  let curr2 = 0;
  let total = 105*64;
  for(let i of cells){
    for(let j of i){
      switch(j.state){
        case 0:
          curr0++;
          break;
        case 1:
          curr1++;
          break;
        case 2:
          curr2++;
          break;
      }
    }
  }
  currDist[0] = (curr0/total).toFixed(3);
  currDist[1] = (curr1/total).toFixed(3);
  currDist[2] = (curr2/total).toFixed(3);
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

