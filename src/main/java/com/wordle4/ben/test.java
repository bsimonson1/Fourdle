package com.wordle4.ben;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

public class test {
    public static void main(String[] args) {
        String result = "";
        System.out.println("Guess the word: ");
        while (!"OOOO".equals(result)) {
            Scanner input = new Scanner(System.in);
            String guess = input.nextLine().toUpperCase();
            if (guess.length() > 4) {
                System.out.println("Four letters only!");
                continue;
            }
            result = entryCheck(guess);
            System.out.println(result);
        }
        System.out.println("You are the love of my life!");
    }
    public static String grabAnswer() {
        String data = "BADD";
        try {
            File myObj = new File("JavaWordle4\\WORDLEANSWERS.txt");
            Scanner myReader = new Scanner(myObj);
            data = myReader.nextLine();
            myReader.close();
        } catch (FileNotFoundException e) {
            System.out.println("An error occurred.");
            e.printStackTrace();
        }
        return data;
    }
    public static String entryCheck(String s) {
        // Let's just add an example word here for the day called LOVE ( we will change this once we get a list of 4 letter words)
        String answer = grabAnswer();
        String check = "XXXX";

        // int matchedCounter = 0;
        StringBuilder g = new StringBuilder(s);

        Map<Integer, String> answerMap = new HashMap<>();
        Map<Integer, String> guessMap = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            answerMap.put(i, Character.toString(answer.charAt(i)));
            guessMap.put(i, Character.toString(s.charAt(i)));
        }
        // Now go through the guess letter by letter
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
                    check = sb.toString(); // Update the position of the O
                    // Mark this guess as used by setting the value to 9 (cannot be achieved so effectively it removes it from the map))
                    guessMap.put(guessLetter.getKey(), "9");  // Mark guessMap as processed
                    answerMap.put(answerLetter.getKey(), "9");  // Mark answerMap as processed
                    break; // No need to check further guesses once a correct letter is found
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
                    check = sb.toString(); // Update the position of the M
                }
            }
        }

        return check;
    }
}
