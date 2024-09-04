import React, { useState } from 'react';
import { Button, Typography, Box, Grid, LinearProgress } from '@mui/material';
import { QuestionData } from '../types';

interface QuestionProps {
  data: QuestionData;
  onAnswer: (answer: string) => void;
  timeLeft: number;
  totalTime: number;
}

const Question: React.FC<QuestionProps> = ({ data, onAnswer, timeLeft, totalTime }) => {
  const [showHint, setShowHint] = useState(false);
  const colors = ['#e21b3c', '#1368ce', '#ffa602', '#26890c'];

  const timerProgress = (timeLeft / totalTime) * 100;

  return (
    <Box>
      <LinearProgress 
        variant="determinate" 
        value={timerProgress} 
        sx={{ 
          height: 10, 
          mb: 2,
          '& .MuiLinearProgress-bar': {
            transition: 'none',
          }
        }}
      />
      <Typography variant="h6" gutterBottom>
        Round {data.round} of {data.totalRounds}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {data.question}
      </Typography>
      <Grid container spacing={2} mt={2}>
        {data.options.map((option, index) => (
          <Grid item xs={6} key={index}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => onAnswer(option)}
              sx={{
                backgroundColor: colors[index],
                color: 'white',
                height: '100px',
                '&:hover': {
                  backgroundColor: colors[index],
                  opacity: 0.9,
                },
              }}
            >
              {option}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Box mt={2}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setShowHint(true)}
          disabled={showHint}
        >
          Show Hint
        </Button>
      </Box>
      {showHint && (
        <Typography variant="body2" mt={2} color="text.secondary">
          Hint: {data.hint}
        </Typography>
      )}
    </Box>
  );
};

export default Question;