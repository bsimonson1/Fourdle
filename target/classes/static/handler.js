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
// if a user uses their mouse to click on the input we want to reset the overFlow counter so that users can use the keyboard from that point
function resetOverflowPosition(element) {
    overFlowCounter = element;
    console.log(`Reset to position ${overFlowCounter}`);
}
// this is really really bad but I need to bind the element to the function so that I can get the correct value of the overFlowCounter for guesses after the first...
function resetOverflowPositionBind(element) {
    overFlowCounter = element.target.id[element.target.id.length - 2] - 1;
    console.log(`Reset to position ${overFlowCounter}`);
}
function changeKeyboardColors(result) {
    for (let i = 0; i < 4; i++) {
        console.log(`Guess: ${recentGuesses[i]}, is in position ${result[i]}`);
        if (result[i] == "O") {
            document.getElementById(recentGuesses[i]).classList.add('guess-box-green');
        } else if (result[i] == "M") {
            document.getElementById(recentGuesses[i]).classList.add('guess-box-yellow');
        } else {
            document.getElementById(recentGuesses[i]).classList.add('guess-box-gray');
        }
    }
    // need to clear the recent guesses for the next guess
    recentGuesses.length = 0;
}

document.addEventListener("DOMContentLoaded", () => {
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
    const container = document.getElementById("keyboardContainer");
    container.appendChild(newRow);

    const submitted = document.getElementById("submitButton");
    submitted.addEventListener("click", (event) => {
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
            if (result == "----") {
                document.getElementById("answer").innerHTML = "Answer not in word list!";
            } else {
                // show the user their result by dynamically adding HTML elements to show the guess results
                for (let i = 0; i < result.length; i++) {
                    let counterP = i+1;
                    let idElement = "guessEntry" + counterP.toString() + counter.toString();
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
                guesses++;
                const newRow = document.createElement("div");
                newRow.classList.add("guess-row");
                newRow.id = "guessRow" + counter;
                // create new input tags after "removing" the old ones
                if (result != "OOOO" && guesses <= 5) {
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
                        newInput.onclick = resetOverflowPositionBind.bind(i);
                        newInput.classList.add("guess-box");
                        newRow.appendChild(newInput);
                    }
                    const container = document.getElementById("guessContainer");
                    container.appendChild(newRow);
                } else if (guesses > 5) {
                    document.getElementById("answer").innerHTML = "You Lose!";
                } else if (result == "OOOO") {
                    document.getElementById("answer").innerHTML = "You Win!";
                }
                // now lets change the keyboard colors to reflect the guesses made by the user
                changeKeyboardColors(result);
            }
        });
    })
})

// <input type="text" id="guessEntry10" maxlength="1" pattern="[A-Za-z]" title="Letters only" required>