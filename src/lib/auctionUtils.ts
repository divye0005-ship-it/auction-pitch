export const getNextBidAmount = (current: number, base: number) => {
  if (current === 0) return Math.max(50, base); 
  if (current < 200) return current + 10;
  if (current < 500) return current + 25;
  if (current < 1000) return current + 50;
  return current + 100;
};
