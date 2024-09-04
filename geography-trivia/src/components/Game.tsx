import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { Button, Typography, Box, Container, CssBaseline } from '@mui/material';
import axios from 'axios';
import { startGame, getQuestion, submitAnswer } from '../api';
import { QuestionData, AnswerResponse } from '../types';
import Question from './Question';
import Result from './Result';
import Achievements, { Achievement } from './Achievements';

// sound files
const correctSound = new Audio('/sounds/correct.mp3');
const incorrectSound = new Audio('/sounds/incorrect.mp3');
const gameOverSound = new Audio('/sounds/game-over.mp3');
const backgroundMusicAudio = new Audio('/sounds/background-music.mp3');
backgroundMusicAudio.loop = true;

// Material UI component library
const theme = createTheme({
  palette: {
    primary: {
      main: '#46178f',
    },
    secondary: {
      main: '#FFC300',
    },
    success: {
      main: '#43B929',
    },
    background: {
      default: '#46178f',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Montserrat", sans-serif',
    allVariants: {
      fontFamily: '"Montserrat", sans-serif',
    },
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        body {
          font-family: 'Montserrat', sans-serif;
        }
      `,
    },
  },
});

const StyledContainer = styled(Container)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const Game: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [result, setResult] = useState<AnswerResponse | null>(null);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const totalTime = 10;

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
  const storedAchievements = localStorage.getItem('achievements');
  if (storedAchievements) {
    return JSON.parse(storedAchievements);
  }
  return [
    { id: 'max_points', name: 'In The Air', description: 'Answer a question for maximum points', unlocked: false },
    { id: 'all_correct', name: 'Hot', description: 'Answer every question correctly in a single game', unlocked: false },
    { id: 'high_score', name: 'Flawlëss', description: 'Achieve a score of 10,000 points', unlocked: false },
  ];
});

  const playBackgroundMusic = useCallback(() => {
    backgroundMusicAudio.play();
  }, []);

  const stopBackgroundMusic = useCallback(() => {
    backgroundMusicAudio.pause();
    backgroundMusicAudio.currentTime = 0;
  }, []);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('highScore');
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }

    return () => {
      stopBackgroundMusic();
    };
  }, [stopBackgroundMusic]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && questionData && !result) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleAnswer('');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, questionData, result]);

  const playSound = useCallback((sound: HTMLAudioElement) => {
    sound.currentTime = 0;
    sound.play();
  }, []);

  const saveAchievements = useCallback((newAchievements: Achievement[]) => {
    localStorage.setItem('achievements', JSON.stringify(newAchievements));
  }, []);

  const checkAchievements = useCallback(() => {
    const newAchievements = [...achievements];
    let achievementsChanged = false;
  
    if (result && result.points === 1000 && !newAchievements.find(a => a.id === 'max_points')!.unlocked) {
      newAchievements.find(a => a.id === 'max_points')!.unlocked = true;
      achievementsChanged = true;
    }
  
    if (result && result.gameOver && score === totalRounds * 1000 && !newAchievements.find(a => a.id === 'all_correct')!.unlocked) {
      newAchievements.find(a => a.id === 'all_correct')!.unlocked = true;
      achievementsChanged = true;
    }
  
    if (score == 10000 && !newAchievements.find(a => a.id === 'high_score')!.unlocked) {
      newAchievements.find(a => a.id === 'high_score')!.unlocked = true;
      achievementsChanged = true;
    }
  
    if (achievementsChanged) {
      setAchievements(newAchievements);
      saveAchievements(newAchievements);
    }
  }, [achievements, result, score, totalRounds, saveAchievements]);

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements, result, score, saveAchievements]);

  const handleStartGame = async () => {
    try {
      const { totalRounds } = await startGame();
      setTotalRounds(totalRounds);
      setGameStarted(true);
      setScore(0);
      playBackgroundMusic();
      fetchQuestion();
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const fetchQuestion = async () => {
    try {
      const data = await getQuestion();
      setQuestionData(data);
      setResult(null);
      setTimeLeft(totalTime);
    } catch (error) {
      console.error('Error fetching question:', error);
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        console.warn('Game might be over or there was an issue fetching the next question.');
        setResult({
          isCorrect: false,
          correctAnswer: '',
          gameOver: true,
          points: 0,
          score: score,
          totalScore: score,
        });
      }
    }
  };

  const calculatePoints = (timeLeft: number): number => {
    return Math.round((timeLeft / totalTime) * 1000);
  };

  const handleAnswer = async (answer: string) => {
    if (result?.gameOver) {
      console.warn('Game is already over. Cannot submit more answers.');
      return;
    }

    const points = calculatePoints(timeLeft);
    
    try {
      const response = await submitAnswer(answer);
      
      let earnedPoints = 0;
      if (response.isCorrect) {
        earnedPoints = points;
        setScore((prevScore) => prevScore + points);
        playSound(correctSound);
      } else {
        playSound(incorrectSound);
      }
      
      setResult({ ...response, points: earnedPoints });

      if (response.gameOver) {
        playSound(gameOverSound);
        const finalScore = score + earnedPoints;
        if (finalScore > highScore) {
          setHighScore(finalScore);
          localStorage.setItem('highScore', finalScore.toString());
        }
      } else {
        setTimeout(fetchQuestion, 2000);
      }

      checkAchievements();
    } catch (error) {
      console.error('Error submitting answer:', error);
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        console.warn('Game might be over or there was an issue with the answer submission.');
        setResult({
          isCorrect: false,
          correctAnswer: '',
          gameOver: true,
          points: 0,
          score: score,
          totalScore: score,
        });
      }
    }
  };

  const handlePlayAgain = () => {
    setGameStarted(false);
    setQuestionData(null);
    setResult(null);
    setScore(0);
    stopBackgroundMusic();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh', 
          backgroundColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url("/images/world-map-outline.svg")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <StyledContainer maxWidth="sm">
          <Typography variant="h4" gutterBottom align="center" color="primary">
            Kahootopia!
          </Typography>
          {!gameStarted ? (
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                High Score: {highScore}
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleStartGame}
                size="large"
              >
                Start Game
              </Button>
              <Box mt={4}>
                <Achievements achievements={achievements} />
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="h6" gutterBottom align="center">
                Score: {score}
              </Typography>
              {questionData && !result && (
                <Question 
                  data={questionData} 
                  onAnswer={handleAnswer}
                  timeLeft={timeLeft}
                  totalTime={totalTime}
                />
              )}
              {result && (
                <Result
                  result={result}
                  score={score}
                  totalRounds={totalRounds}
                  highScore={highScore}
                  onPlayAgain={handlePlayAgain}
                />
              )}
            </>
          )}
        </StyledContainer>
      </Box>
    </ThemeProvider>
  );
};

export default Game;