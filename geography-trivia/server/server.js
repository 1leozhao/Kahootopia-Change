const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let gameQuestions = [];
let currentGame = null;

app.get('/api/start-game', async (req, res) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,capital,population,region,languages');
    const countries = response.data;
    gameQuestions = generateQuestions(countries, 10);
    currentGame = {
      questions: gameQuestions,
      currentRound: 0,
      score: 0
    };
    res.json({ message: 'Game started', totalRounds: gameQuestions.length });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

app.get('/api/question', (req, res) => {
  if (!currentGame || currentGame.currentRound >= currentGame.questions.length) {
    res.status(400).json({ error: 'No active game or game over' });
    return;
  }
  const question = currentGame.questions[currentGame.currentRound];
  res.json({
    round: currentGame.currentRound + 1,
    totalRounds: currentGame.questions.length,
    ...question
  });
});

app.post('/api/answer', (req, res) => {
  if (!currentGame || currentGame.currentRound >= currentGame.questions.length) {
    res.status(400).json({ error: 'No active game or game over' });
    return;
  }
  const { answer } = req.body;
  const question = currentGame.questions[currentGame.currentRound];
  const isCorrect = answer.toLowerCase() === question.correctAnswer.toLowerCase();
  if (isCorrect) {
    currentGame.score += 1;
  }
  currentGame.currentRound += 1;
  const gameOver = currentGame.currentRound >= currentGame.questions.length;
  res.json({
    isCorrect,
    correctAnswer: question.correctAnswer,
    score: currentGame.score,
    gameOver,
    totalScore: gameOver ? currentGame.score : null
  });
});

function generateQuestions(countries, count) {
  const questions = [];
  const questionTypes = ['capital', 'population', 'region', 'language'];

  while (questions.length < count) {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let question, correctAnswer, options, hint;

    switch (questionType) {
      case 'capital':
        question = `What is the capital of ${country.name.common}?`;
        correctAnswer = country.capital[0];
        options = getRandomOptions(correctAnswer, countries.map(c => c.capital[0]));
        hint = `This country is located in ${country.region}.`;
        break;
      case 'population':
        question = `Which country has a population closest to ${country.population.toLocaleString()}?`;
        correctAnswer = country.name.common;
        options = getRandomOptions(correctAnswer, countries.map(c => c.name.common), (a, b) => Math.abs(countries.find(c => c.name.common === a).population - country.population) - Math.abs(countries.find(c => c.name.common === b).population - country.population));
        hint = `The country is located in ${country.region}.`;
        break;
      case 'region':
        question = `In which region is ${country.name.common} located?`;
        correctAnswer = country.region;
        options = getRandomOptions(correctAnswer, [...new Set(countries.map(c => c.region))]);
        hint = `This country's capital is ${country.capital[0]}.`;
        break;
      case 'language':
        if (country.languages && Object.keys(country.languages).length > 0) {
          const languages = Object.values(country.languages);
          const languageList = languages.join(', ');
          question = `What ${languages.length > 1 ? 'are' : 'is'} the official language${languages.length > 1 ? 's' : ''} of ${country.name.common}?`;
          correctAnswer = languageList;
          options = getRandomLanguageOptions(correctAnswer, countries);
          hint = `This country is located in ${country.region} and its capital is ${country.capital[0]}.`;
        } else {
          continue; // Skip this iteration if the country has no languages listed
        }
        break;
    }

    questions.push({ question, correctAnswer, options, hint });
  }

  return questions;
}

function getRandomOptions(correct, allOptions, sortFn = null) {
  const options = [correct];
  const filteredOptions = allOptions.filter(option => option && option !== correct);
  
  while (options.length < 4 && filteredOptions.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredOptions.length);
    const option = filteredOptions.splice(randomIndex, 1)[0];
    if (option) options.push(option);
  }

  return sortFn ? options.sort(sortFn) : options.sort(() => 0.5 - Math.random());
}

function getRandomLanguageOptions(correct, countries) {
  const options = [correct];
  const allLanguageSets = countries
    .filter(c => c.languages && Object.keys(c.languages).length > 0)
    .map(c => Object.values(c.languages).join(', '))
    .filter(langs => langs !== correct);

  while (options.length < 4 && allLanguageSets.length > 0) {
    const randomIndex = Math.floor(Math.random() * allLanguageSets.length);
    const option = allLanguageSets.splice(randomIndex, 1)[0];
    if (!options.includes(option)) {
      options.push(option);
    }
  }

  return options.sort(() => 0.5 - Math.random());
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});