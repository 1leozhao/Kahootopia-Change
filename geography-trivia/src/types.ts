export interface Question {
  name: {
    common: string;
  };
  capital: string[];
}

export interface GameState {
  questions: Question[];
  currentRound: number;
  score: number;
  totalRounds: number;
}

export interface AnswerResponse {
    isCorrect: boolean;
    correctAnswer: string;
    score: number;
    gameOver: boolean;
    totalScore: number | null;
    points: number;
  }
  
  export interface QuestionData {
    round: number;
    totalRounds: number;
    question: string;
    options: string[];
    hint: string;
  }