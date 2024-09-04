// Achievements.tsx
import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

interface AchievementsProps {
  achievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Achievements</Typography>
      <List>
        {achievements.map((achievement) => (
          <ListItem key={achievement.id}>
            <ListItemIcon>
              <EmojiEventsIcon color={achievement.unlocked ? "primary" : "disabled"} />
            </ListItemIcon>
            <ListItemText 
              primary={achievement.name} 
              secondary={achievement.description}
              style={{ opacity: achievement.unlocked ? 1 : 0.5 }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Achievements;