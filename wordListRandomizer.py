import random
wordList = []

with open("4-letter-words-processed.txt") as f:
    for x in f:
        wordList.append(x)
f.close()
print(len(wordList))
# randomize the words
random.shuffle(wordList)
# write the words to the text document
with open("src\\main\\java\\com\\wordle4\\ben\\WORDLEANSWERS.txt", "w") as f:
    for i in wordList:
        f.write(i)
f.close()
    