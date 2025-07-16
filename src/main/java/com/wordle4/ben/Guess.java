package com.wordle4.ben;

import java.util.ArrayList;

public class Guess {
    public String guess;
    public ArrayList<String> guessList = new ArrayList<>();
    // constructor just to add the ghuess to the list and log it for the backend
    public Guess(String guess) {
        this.guess = guess;
        guessList.add(this.guess);
    }
}