import random
wordList = []

with open("4-letter-words-processed-new.txt") as f:
    for x in f:
        wordList.append(x)
f.close()

# randomize the words
random.shuffle(wordList)
# write the words to the text document
with open("C:\\Users\\Ben\\Documents\\Personal_Projects\\JavaWordle4\\ben\\src\\main\\java\\com\\wordle4\\ben\\WORDLEANSWERS.txt", "w") as f:
    for i in wordList:
        f.write(i)
f.close()
    