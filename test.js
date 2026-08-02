const rules = `
function isValidRoom(data) {
  return hasOnlyAllowedFields(data, ['roomId', 'title', 'hostId', 'status', 'currentBidderId', 'currentBidAmount', 'currentPlayerId', 'timerEnd', 'players', 'squads', 'purses', 'auctionedPlayerIds', 'createdAt', 'playersCount', 'revealTimer', 'isPublic', 'skipVotes', 'terminateVotes']) &&
         data.roomId is string && data.roomId.size() == 6 &&
         data.hostId is string &&
         data.status in ['waiting', 'active', 'finished'] &&
         data.players is map &&
         data.squads is map &&
         data.purses is map &&
         data.auctionedPlayerIds is list &&
         data.playersCount is number &&
         data.revealTimer is number &&
         data.isPublic is bool &&
         data.skipVotes is list;
}
`;
