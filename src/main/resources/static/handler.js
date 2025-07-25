let counter = 0;
let guesses = 0;
let recentGuesses = [];
// overFlow counter for when all of the guess entries are made and we want to update the other guessEntries
let overFlowCounter = 0;
// this is to register keyboard input 
function registerKeyboardInput(element) {
    let keyValue = element.target.id;
    if (overFlowCounter > 3) {
        overFlowCounter = 0;
    }
    // now add an event listener to check for when a button is pressed (add it to the guess form)
    console.log(`Selected key value: ${keyValue}`);
    if (overFlowCounter == 0) {
        recentGuesses[0] = keyValue;
        document.getElementById(`guessEntry1${counter}`).value = keyValue;
    } else if (overFlowCounter == 1) {
        recentGuesses[1] = keyValue;
        document.getElementById(`guessEntry2${counter}`).value = keyValue;
    } else if (overFlowCounter == 2) {
        recentGuesses[2] = keyValue;
        document.getElementById(`guessEntry3${counter}`).value = keyValue;
    } else if (overFlowCounter == 3) {
        recentGuesses[3] = keyValue;
        document.getElementById(`guessEntry4${counter}`).value = keyValue;
    }
    overFlowCounter++;
}
// move to next input button
function moveToNext(currentInput, nextInputId) {
  if (currentInput.value.length === currentInput.maxLength) {
    let nextId = 'guessEntry' + nextInputId.toString();
    console.log(`Next input ID: ${nextId}`);
    document.getElementById(nextId).focus();
  }
}
// if a user uses their mouse to click on the input we want to reset the overFlow counter so that users can use the keyboard from that point
function resetOverflowPosition(element) {
    overFlowCounter = element;
    console.log(`Reset to position ${overFlowCounter}`);
}
// change the background color of the keyboard based on the results of the guess
function changeKeyboardColors(result) {
    for (let i = 0; i < result.length; i++) {
        const key = document.getElementById(recentGuesses[i].toString().toUpperCase());
        if (!key) continue; // safeguard
        const classes = key.classList;
        if (result[i] === "O") {
            // Always override to green
            classes.remove('guess-box-yellow', 'guess-box-gray');
            classes.add('guess-box-green');
        } else if (result[i] === "M") {
            // Only set to yellow if not already green
            if (!classes.contains('guess-box-green')) {
                classes.remove('guess-box-gray');
                classes.add('guess-box-yellow');
            }
        } else if (result[i] === "X") {
            // Only set to gray if not green or yellow
            if (!classes.contains('guess-box-green') && !classes.contains('guess-box-yellow')) {
                classes.add('guess-box-gray');
            }
        }
    }

    // clear guesses for next round
    recentGuesses.length = 0;
}
// let just delete from the right most character
function handleDelete() {
    console.log("Am I here?");
    // we just need to remove the element from the previous overflow input and reset the overflow
    for (let i = 4; i >= 0; i--) {
        let newID = "guessEntry" + i.toString() + counter.toString();
        // if this entry element has a value then we delete it and break
        console.log(`Value to delete: ${document.getElementById(newID).value}`);
        if (document.getElementById(newID).value) {
            console.log(`Value to delete: ${document.getElementById(newID).value}`);
            // delete it and focus to the next input
            document.getElementById(newID).value = "";
            // get the new position to focus on
            let newPos = i-1;
            if (newPos < 1) {
                newPos = 1;
            }
            let nextId = "guessEntry" + (newPos).toString() + counter.toString();
            document.getElementById(nextId).focus();
            console.log(`Next Value: ${nextId}`);
            overFlowCounter--;
            break;
        }
    }
}

function keyboardConfig() {
    // add a keyboard to allow users to type in answers
    const newRow = document.createElement("div");
    newRow.classList.add("keyboard");
    newRow.id = "keyboardDiv";
    // create 26 buttons for each key on the keyboard
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    for (let i = 0; i < 26; i++) {
        let newButton = document.createElement("button");
        newButton.id = letters[i];
        newButton.value = letters[i];
        newButton.classList.add('guess-box');
        newButton.innerText = letters[i];
        newButton.onclick = registerKeyboardInput.bind(letters[i]);
        newRow.appendChild(newButton);
    }
    // add a delete button
    let deleteButton = document.createElement("button");
    deleteButton.id = 'delete';
    deleteButton.value = 'delete';
    deleteButton.classList.add('guess-box');
    deleteButton.innerText = 'DEL';
    deleteButton.onclick = handleDelete.bind();
    newRow.appendChild(deleteButton);
    // add a submit button
    let submitButton = document.createElement("button");
    submitButton.id = 'enterButton';
    submitButton.value = 'enter';
    submitButton.classList.add('guess-box');
    submitButton.innerText = 'ENTER';
    submitButton.addEventListener("click", (event) => {
        handleSubmission(event);
    })
    newRow.appendChild(submitButton);
    // add it to the frontend container
    const container = document.getElementById("keyboardContainer");
    container.appendChild(newRow);
}
function handleSubmission(event) {
    event.preventDefault();
    // now we get the letters, make a string, send it to the backend, wait for response with the "XMO" results and then fill in the screen
    let guess = document.getElementById(`guessEntry1${counter}`).value + document.getElementById(`guessEntry2${counter}`).value + document.getElementById(`guessEntry3${counter}`).value + document.getElementById(`guessEntry4${counter}`).value;
    // now send the guessed work to the backend
    console.log(guess);
    console.log(counter);
    // need to send the guessed word to the backend via a post 
    // this is an asynchronous operation to send the data that the user entered to the backend for processing
    fetch('/api/guess', { // our route is /api in the controller so we start with that and then we call the next route guess so this is where we are sending the result to
        method: 'POST',
        headers: { 'Content-Type': 'text/plain'}, //plain text package type
        body: guess // this is the variable (guess from above) that we are sending to the backend
    })
    // this parses the returned data (we use text because it was plain text) 
    .then(res => res.text()) 
    // now that we have the response body parsed we cana ssign it to a variable for further processing for the frontend now
    .then(result => { //assign the received response to a variable called result
        if (result.length !== 4) {
            document.getElementById("answer").innerHTML = "Must be four letters long!";
        } else if (result == "----") {
            document.getElementById("answer").innerHTML = "Answer not in word list!";
        } else {
            // show the user their result by dynamically adding HTML elements to show the guess results
            for (let i = 0; i < result.length; i++) {
                let idElement = "guessEntry" + (i+1).toString() + counter.toString();
                recentGuesses.push(document.getElementById(idElement).value);
                console.log(`Recent guess: ${recentGuesses[i]}`);
                // set the element to read only
                document.getElementById(idElement).readOnly = true;
                if (result[i] == "O") {
                    document.getElementById(idElement).style.backgroundColor = "green";
                } else if (result[i] == "M") {
                    document.getElementById(idElement).style.backgroundColor = "yellow";
                } else {
                    document.getElementById(idElement).style.backgroundColor = "gray";
                }
            }
            const newRow = document.createElement("div");
            newRow.classList.add("guess-row");
            newRow.id = "guessRow" + counter;
            // create new input tags after "removing" the old ones
            if (result != "OOOO" && guesses <= 5) {
                guesses++;
                counter++;
                for (let i = 0; i < 4; i++) {
                    let newInput = document.createElement("input");
                    // give a unique ID to the new input tag
                    let counterP = i+1;
                    let newID = "guessEntry" + counterP.toString() + counter.toString();
                    newInput.id = newID;
                    newInput.type = "text";
                    newInput.maxLength = "1";
                    newInput.pattern = "[A-Za-z]";
                    newInput.title = "Letters only"
                    newInput.required = true;
                    newInput.addEventListener("click", () => resetOverflowPosition(i));
                    newInput.classList.add("guess-box");
                    if (counterP != 4) {
                        let nextInputId = (counterP + 1).toString() + counter.toString();
                        newInput.addEventListener("keyup", function () {
                            console.log(`Passed in input ID: ${nextInputId}`);
                            moveToNext(this, nextInputId);
                        });
                    }
                    newRow.appendChild(newInput);
                }
                const container = document.getElementById("guessContainer");
                container.appendChild(newRow);
                document.getElementById("answer").innerHTML = "";
                overflowCounter = 0;
            } else if (guesses > 6) {
                document.getElementById("answer").innerHTML = "You Lose!";
            } else if (result == "OOOO") {
                document.getElementById("answer").innerHTML = "You Win!";
            }
            // now lets change the keyboard colors to reflect the guesses made by the user
            changeKeyboardColors(result);
        }
    });
}
// wait until the document is fully loaded before we start adding elements to the DOM
document.addEventListener("DOMContentLoaded", () => {
    // create the keyboard
    keyboardConfig();
    // add an event listener to the submit button
    const submitted = document.getElementById("submitButton");
    submitted.addEventListener("click", (event) => {
        handleSubmission(event);
    })


})