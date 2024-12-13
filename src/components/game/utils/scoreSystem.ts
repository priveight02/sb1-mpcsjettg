export const scoreSystem = {
  handleScoring: (state: any) => {
    state.score += state.powerUps.doublePoints ? 2 : 1;
    
    // Update high score
    if (state.score > state.highScore) {
      state.highScore = state.score;
    }

    // Handle score milestones
    if (state.score % 10 === 0) {
      state.powerUps.shield = true;
      setTimeout(() => {
        state.powerUps.shield = false;
      }, 5000);
    }
  }
};