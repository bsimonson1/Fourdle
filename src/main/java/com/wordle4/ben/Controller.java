package com.wordle4.ben;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// annotations are like labels or tags in the code that give instructions or additional context to the compiler (can be applied to classes, methods fields etc.)

// this is a web controller for receiving web traffic
@RestController // this is an annotation and is defined in the RestController package
@RequestMapping("/api") // all routes start with API
public class Controller {
    // this will be for our application properties folder
    @Value("${spring.application.name}")
    private String appName;

    @CrossOrigin
    @PostMapping("/guess") // since we are sending the guess to /api/guess we name this post map /guess
    public String getGuess(@RequestBody String guess) { //request body gets the raw string as opposed to a URL param or form param
        // ensure the user enters a guess that is uppercased
        Guess myGuess = new Guess(guess.toUpperCase()); //create a guess object (good practice since we can make an interface and abstract some of the methods away but this is a very simple application)
        System.out.println("User guessed: " + myGuess.guess); // debug message to ensure we are getting the guess
        // now send this back to the front end
        return entryCheck(myGuess.guess); // return the result of the guess back to the frontend
    }

    // grab the new answer of the day (need time logic)
    public static String grabAnswer() {
        String answer = "BADD"; // default
        Path datePath = Paths.get("JavaWordle4/ben/src/main/java/com/wordle4/ben/date.txt");
        Path wordListPath = Paths.get("JavaWordle4/ben/src/main/java/com/wordle4/ben/WORDLEANSWERS.txt");

        try {
            // Read the current stored date
            String storedDate = Files.readAllLines(datePath).get(0);
            String today = LocalDate.now().toString();

            // Check if it's a new day
            if (!storedDate.equals(today)) {
                // update the date file to today's date
                Files.write(datePath, Collections.singleton(today));

                // read all the words from the word list
                List<String> words = Files.readAllLines(wordListPath);

                if (words.size() > 1) {
                    // remove the first word (yesterday's answer)
                    words.remove(0);
                    // rewrite the file without the old word
                    Files.write(wordListPath, words);
                }
            }
            // read the updated first word
            answer = Files.readAllLines(wordListPath).get(0);

        } catch (IOException e) {
            System.err.println("Error handling files: " + e.getMessage());
            e.printStackTrace();
        }

        return answer;
    }
    public static Map<String, Integer> grabPossibleAnswerMap() {
        Map<String, Integer> possibleAnswerMap = new HashMap();
        String  guessFilePath = "JavaWordle4/4-letter-words-processed-new.txt";
        int counter = 0;
        try (Scanner scanner = new Scanner(new File(guessFilePath))) {
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
                // Process each line here
                possibleAnswerMap.put(line, counter);
            }
        } catch (FileNotFoundException e) {
            System.err.println("File not found: " + e.getMessage());
        }
        return possibleAnswerMap;

    }
	// check the entry (return a sequence of XMO for incorrect, correct but wrong position, or correct right position)
	public static String entryCheck(String s) {
        // Let's just add an example word here for the day called LOVE ( we will change this once we get a list of 4 letter words)
        String answer = grabAnswer();
        String check = "XXXX";
        Map<String, Integer> possibleAnswerMap = new HashMap();
        possibleAnswerMap = grabPossibleAnswerMap();
        if (!possibleAnswerMap.containsKey(s)) {
            return "----";
        }
        // int matchedCounter = 0;
        StringBuilder g = new StringBuilder(s);

        Map<Integer, String> answerMap = new HashMap<>();
        Map<Integer, String> guessMap = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            answerMap.put(i, Character.toString(answer.charAt(i)));
            guessMap.put(i, Character.toString(s.charAt(i)));
        }
        for (Map.Entry<Integer, String> answerLetter : answerMap.entrySet()) {
            for (Map.Entry<Integer, String> guessLetter : guessMap.entrySet()) {
                // Case 1: Correct letter at the correct position (O)
                if (guessLetter.getValue().equals(answerLetter.getValue()) && guessLetter.getKey().equals(answerLetter.getKey()) && guessLetter.getKey() < 4 && !guessLetter.getValue().equals("9") && answerLetter.getKey() < 4 && !answerLetter.getValue().equals("9")) {
                    StringBuilder sb = new StringBuilder(check);
                    sb.setCharAt(guessLetter.getKey(), 'O');
                    for (int i = 0; i < check.length(); i++) {
                        if (check.charAt(i) == 'M' && guessLetter.getValue().equals(Character.toString(g.charAt(i))) && guessLetter.getKey() != i) {
                            sb.setCharAt(i, 'X');
                        }
                    }
                    check = sb.toString(); 
                    // Mark this guess as used by setting the value to 9 (cannot be achieved so effectively it removes it from the map))
                    guessMap.put(guessLetter.getKey(), "9");  
                    answerMap.put(answerLetter.getKey(), "9");  
                    break; 
                }
                // Case 2: Correct letter but wrong position (M)
                else if (guessLetter.getValue().equals(answerLetter.getValue())) {
                    StringBuilder sb = new StringBuilder(check);
                    sb.setCharAt(guessLetter.getKey(), 'M');
                    // check for duplicates
                    for (int i = 0; i < check.length(); i++) {
                        if (check.charAt(i) == 'M' && guessLetter.getValue().equals(Character.toString(g.charAt(i))) && guessLetter.getKey() != i) {
                            sb.setCharAt(i, 'X');
                        }
                    }
                    check = sb.toString(); // Update the position of the M (in the event there are multiple of the same character in the incorrect spot in the guessed word but not in the answer word)
                }
            }
        }

        return check;
    }
}