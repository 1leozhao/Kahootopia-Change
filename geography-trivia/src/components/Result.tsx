import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { AnswerResponse } from '../types';

interface ResultProps {
  result: AnswerResponse & { points: number };
  score: number;
  totalRounds: number;
  highScore: number;
  onPlayAgain: () => void;
}

const Result: React.FC<ResultProps> = ({ result, score, totalRounds, highScore, onPlayAgain }) => {
  const isNewHighScore = score > highScore;

  return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h6" gutterBottom color={result.isCorrect ? 'success.main' : 'error'}>
        {result.isCorrect ? 'Correct!' : 'Incorrect'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        The correct answer was: {result.correctAnswer}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Points earned: {result.points}
      </Typography>
      {result.gameOver && (
        <>
          <Typography variant="h5" gutterBottom>
            Game Over!
          </Typography>
          <Typography variant="body1" gutterBottom>
            Your final score: {score} / {totalRounds * 1000}
          </Typography>
          {isNewHighScore ? (
            <Typography variant="h6" color="secondary" gutterBottom>
              New High Score!
            </Typography>
          ) : (
            <Typography variant="body1" gutterBottom>
              High Score: {highScore}
            </Typography>
          )}
          <Button variant="contained" color="primary" onClick={onPlayAgain} size="large">
            Play Again
          </Button>
        </>
      )}
    </Box>
  );
};

export default Result;