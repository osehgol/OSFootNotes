//developed from examples here: 

var PenNotes = [48, 50, 52, 55, 57, 60, 62, 64, 67, 69]; //default notes to hold the pentomic scale
var MusicNotes = []; //this array at setup holds PenNotes[]. When submit Midi clicked+use Custom checked, it takes in userNotes[]
var noteInput = []; // text input boxes notes, get pushed after clicking submit Midinotes
var userNotes = []; //takes and holds noteInput[] (UG) values

var serial; // variable to hold an instance of the serialport library
var portName = '/dev/cu.usbserial-A5026YQG'; // fill in your serial port name here

var lastTime = 0; //timer to keep steps from overlapping
var osc; // hold oscillator library

var submit, selectButton, instructions, boxSelection; // value to hold values for midi submissions
var fileLoad, fileValue, canvas, file, soundLoadInstructions, userUpload, userPlayInstructions;
var userMedia = false;
var music = [];
var divideMusicUpload = [];
var steps = [];
var stepCalibration, stepInstructions;
var stepMachine = false;

//at setup, push default penNotes[] values into MusicNotes[]
function setup() {
  createCanvas(windowWidth, windowHeight);
  for (var n = 0; n < PenNotes.length; n++) {
    MusicNotes.push(PenNotes[n]);
  }

  //You want to change scale, so submit new note values in these text input boxes
  for (var i = 0; i < 10; i++) {
    noteInput[i] = createInput(); // allow user to input scale midi values
    noteInput[i].size(25);
    noteInput[i].position(0 + i * 50, 310); // put it somewhere, like here
  }
  
  //and select submit
  submit = createButton("Submit Midi Notes"); // say hey, I made the changes
  submit.position(500, 310); // put it here, cause that looks nice... well makes sense anyway
  submit.mousePressed(EnterNote);
  
  //EnterNote() function runs. It is pushing noteInput (UG) values into userNotes[]. MusicNotes[] 
  function EnterNote() {
 
 userNotes.splice(0, userNotes.length);
  for (var i = 0; i < 10; i++) {
    userNotes.push(noteInput[i].value());
    noteInput[i].value("");
  }
 
}
  //Now we need to check the "Use Custom Scale" box to start playing
  
  //checkbox - "check to use custom scale" -- enables UG notes(noteIntput array) 
  selectButton = createCheckbox(); //create checkbox "check to use custom scale"
  selectButton.position(0, 350); // position checkbox 
  selectButton.changed(UserScale); // detect change in state of checkbox
  instructions = createDiv("Check to use custom scale"); // text "check to use custom scale"
  instructions.position(30, 350); // position of text "check to use custom scale"
  
  //This runs UserScale()
  //UserScale() is pushing userNotes[] into MusicNotes[]  

function UserScale() {
  boxSelection = !boxSelection //smart hack by JasonO http://p5js.org/reference/#/p5/createCheckbox
  MusicNotes.splice(0, MusicNotes.length);
  if (boxSelection === true && userNotes.length > 0 && userMedia === false) {
    for (var m = 0; m < 10; m++) {
      MusicNotes.push(userNotes[m]);
    }
  }
  //
  if (boxSelection === false && userMedia === false) {
    for (var n = 0; n < PenNotes.length; n++) {
      MusicNotes.push(PenNotes[n]);
      //print("PenNotes " + PenNotes[n]);
    }
  }
}
  
  //checkbox - "check to calibrate steps" (uncheck when finished)
  stepCalibration = createCheckbox();
  stepCalibration.position(300, 350);
  stepCalibration.changed(CalibrateSteps);
  stepInstructions = createDiv("Check to calibrate steps (uncheck when finished)");
  stepInstructions.position(330, 350);

  userUpload = createCheckbox();
  userUpload.position(0, 405);
  userUpload.changed(UploadedMedia);
  userPlayInstructions = createDiv("Check to use uploaded sounds");
  userPlayInstructions.position(30, 405);
  
  soundFile = createFileInput(createSound);
  soundFile.position(0, 380)
  soundLoadInstructions = createDiv("Upload sounds to play");
  soundLoadInstructions.position(150, 380);

  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('list', printList); // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen); // callback for the port opening
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors
  serial.on('close', portClose); // callback for the port closing
  serial.list(); // list the serial ports
  serial.open(portName); // open a serial port
  osc = new p5.SinOsc(); // A sine oscillator
  // Start silent
  osc.start();
  osc.amp(0);
}

// A function to play a note
function playNote(note, duration) {
  osc.freq(midiToFreq(note));
  // fade(value, seconds from now)
  osc.amp(1);
  osc.fade(1, 0.1);
}

function draw() {
background(255);
  //   //Displaying values of current notes
  // for (var i = 0; i < MusicNotes.length; i++){
  // text(MusicNotes[i], 0+i*50, 330, 70, 80);  
  //   }  
  
  var w = width / PenNotes.length;
  for (var i = 0; i < PenNotes.length; i++) {
    var x = i * w;
    // If the mouse is over the key
    if (mouseX > x && mouseX < x + w && mouseY < 300) {
      // If we're clicking
      if (mouseIsPressed) {
        fill(100, 255, 200, 30);
        // Or just rolling over
      } else {
        fill(127);
      }
    } else {
      fill(255, 0, 0);
    }
    rect(x, 0, w - 1, 300, 20); // key design
    //print(music.length);
  }
  
  //Displaying values of current notes
  displayNotes();
  //
  updateNotes();
}

// CalibrateSteps() runs when "check to calibrate steps is checked"
// this is not doing anything right now but it's an area to work on
function CalibrateSteps() {
  stepMachine = !stepMachine;
  return stepMachine;
}

// When we click
function mousePressed() {
  // Map mouse to the key index
  var key = floor(map(mouseX, 0, width, 0, MusicNotes.length));

  if (userMedia === false) {
    if (mouseY < 300) {
      playNote(MusicNotes[key]);
    }
  }
  if (userMedia === true) {
    //for(var um = 0; um < 10; um++){
    //}
    if (mouseY < 300) {
      //midiToFreq(music[key]) / midiToFreq(60);
      //print(uploadedNote);
      music[key].play();
    }
  }
}

// Fade it out when we release
function mouseReleased() {
  osc.fade(0, 0.25);
}

function serverConnected() {
  println('connected to server.');
}

function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    println(i + " " + portList[i]);
  }
}

function portOpen() {
  println('the serial port opened.')
}

function serialEvent() {
  // read a string from the serial port
  // until you get carriage return and newline:
  var inString = serial.readStringUntil('\r\n');

  //check to see that there's actually a string there:
  if (inString.length > 0) {
    var inData = Number(inString);
  }

  if (stepMachine === true && inData > 0) {
    steps.push(inData);
    print(steps[0]);
  }
  else {
    if (inData === 1) {
      if (millis() - lastTime > 50 && userMedia === false) {
        playNote(MusicNotes[0]);
        lastTime = millis();
      }
      if (millis() - lastTime > 50 && userMedia === true) {
        music[0].play();
      }
    }

    if (inData === 0) {
      osc.fade(0, 0.5);
    }

    if (inData === 2) {
      if (millis() - lastTime > 50 && userMedia === false) {
        playNote(MusicNotes[1]);
        lastTime = millis();
      }
      if (millis() - lastTime > 50 && userMedia === true) {
        music[1].play();
      }
    }

    if (inData === 3) {
      if (millis() - lastTime > 50 && userMedia === false) {
        playNote(MusicNotes[2]);
        lastTime = millis();
      }
      if (millis() - lastTime > 50 && userMedia === true) {
        music[2].play();
      }
    }

    if (inData === 4) {
      if (millis() - lastTime > 50 && userMedia === false) {
        playNote(MusicNotes[3]);
        lastTime = millis();
      }
      if (millis() - lastTime > 50 && userMedia === true) {
        music[3].play();
      }
    }

    if (inData === 5) {
      if (millis() - lastTime > 50 && userMedia === false) {
        playNote(MusicNotes[4]);
        lastTime = millis();
      }
      if (millis() - lastTime > 50 && userMedia === true) {
        music[4].play();
      }
    }

    if (inData === 6) {
      if (millis() - lastTime > 50 && userMedia === false) {
        playNote(MusicNotes[5]);
        lastTime = millis();
      }
      if (millis() - lastTime > 50 && userMedia === true) {
        music[5].play();
      }
    }

    if (inData === 7) {
      if (millis() - lastTime > 50 && userMedia === false) {
        playNote(MusicNotes[6]);
        lastTime = millis();
      }
      if (millis() - lastTime > 50 && userMedia === true) {
        music[6].play();
      }
    }

    if (inData === 8) {
      if (millis() - lastTime > 50 && userMedia === false) {
        playNote(MusicNotes[7]);
        lastTime = millis();
      }
      if (millis() - lastTime > 50 && userMedia === true) {
        music[7].play();
      }
    }

    if (inData === 9) {
      if (millis() - lastTime > 50 && userMedia === false) {
        playNote(MusicNotes[8]);
        lastTime = millis();
      }
      if (millis() - lastTime > 50 && userMedia === true) {
        music[8].play();
      }
    }

    if (inData === 10) {
      if (millis() - lastTime > 50 && userMedia === false) {
        playNote(MusicNotes[9]);
        lastTime = millis();
      }
      if (millis() - lastTime > 50 && userMedia === true) {
        music[9].play();
      }
    }
  }
}

function createSound(fileSound) {
  musicFile = loadSound(fileSound, loadedSoundFile);
}

function UploadedMedia() {
  userMedia = !userMedia;
  MusicNotes.splice(0, MusicNotes.length);
  if (userMedia === true && music.length > 0) {
    for (var u = 0; u < 10; u++) {
      MusicNotes.unshift(music[u]);
    }
  }
  if (userMedia === false && boxSelection === false) {
    for (var n = 0; n < PenNotes.length; n++) {
      MusicNotes.push(PenNotes[n]);
    }
  }
}

function loadedSoundFile() {
  music.unshift(musicFile);
  music[0].play();
}

function serialError(err) {
  println('Something went wrong with the serial port. ' + err);
}

function portClose() {
  println('The serial port closed.');
}

function displayNotes(){
  //Displaying values of default notes
  for (var i = 0; i < MusicNotes.length; i++){
  text(MusicNotes[i], 0+i*50, 330, 70, 80);  
    }  
}

function updateNotes(){
  //Displaying values of UG notes
  for (var i = 0; i < userNotes.length; i++){
  text(userNotes[i], 0+i*50, 330, 70, 80);  
    }  
  
}


