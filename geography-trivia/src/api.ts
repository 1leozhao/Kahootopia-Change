import axios from 'axios';
import { QuestionData, AnswerResponse } from './types';

const API_BASE_URL = 'http://localhost:3001/api';

export const startGame = async (): Promise<{ totalRounds: number }> => {
  const response = await axios.get(`${API_BASE_URL}/start-game`);
  return response.data;
};

export const getQuestion = async (): Promise<QuestionData> => {
  const response = await axios.get(`${API_BASE_URL}/question`);
  return response.data;
};

export const submitAnswer = async (answer: string): Promise<AnswerResponse> => {
  const response = await axios.post(`${API_BASE_URL}/answer`, { answer });
  return response.data;
};