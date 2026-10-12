import { Match, TournamentRound, TournamentTeam } from './types';

export interface GeneratedBracket {
  rounds: TournamentRound[];
  matches: Match[];
}

/**
 * Generates single-elimination knockout bracket rounds and match pairings
 * for a list of teams (powers of 2: 4, 8, 16, or padded with byes).
 */
export const generateKnockoutFixtures = (
  tournamentId: string,
  venueId: string,
  teams: TournamentTeam[],
  startDate: string
): GeneratedBracket => {
  const teamCount = teams.length;
  if (teamCount < 2) return { rounds: [], matches: [] };

  // Calculate number of rounds required: 2 -> 1, 4 -> 2, 8 -> 3, 16 -> 4
  const numRounds = Math.ceil(Math.log2(teamCount));
  const totalSlots = Math.pow(2, numRounds);

  const rounds: TournamentRound[] = [];
  const matches: Match[] = [];

  // Round naming based on distance from final
  const getRoundName = (roundIndex: number, totalRounds: number) => {
    const roundsFromEnd = totalRounds - 1 - roundIndex;
    if (roundsFromEnd === 0) return 'Championship Final';
    if (roundsFromEnd === 1) return 'Semifinals';
    if (roundsFromEnd === 2) return 'Quarterfinals';
    if (roundsFromEnd === 3) return 'Round of 16';
    return `Round ${roundIndex + 1}`;
  };

  const startDateTime = new Date(startDate);

  // Generate round objects
  for (let r = 0; r < numRounds; r++) {
    const roundId = `gen_rnd_${tournamentId}_${r + 1}`;
    rounds.push({
      id: roundId,
      tournament_id: tournamentId,
      round_number: r + 1,
      round_name: getRoundName(r, numRounds),
      status: r === 0 ? 'active' : 'pending'
    });
  }

  // Generate matches for Round 1
  const round1MatchesCount = totalSlots / 2;
  const round1Matches: Match[] = [];

  for (let m = 0; m < round1MatchesCount; m++) {
    const matchId = `gen_m_${tournamentId}_r1_${m + 1}`;
    const t1 = teams[m * 2] || undefined;
    const t2 = teams[m * 2 + 1] || undefined;

    const matchDate = new Date(startDateTime);
    matchDate.setDate(matchDate.getDate() + Math.floor(m / 2));
    matchDate.setHours(14 + (m % 2) * 3, 0, 0, 0);

    const match: Match = {
      id: matchId,
      tournament_id: tournamentId,
      round_id: rounds[0].id,
      round_name: rounds[0].round_name,
      team1_id: t1?.id,
      team2_id: t2?.id,
      team1: t1,
      team2: t2,
      venue_id: venueId,
      court_table: `Court ${(m % 2) + 1}`,
      start_time: matchDate.toISOString(),
      status: 'scheduled',
      bracket_node_id: `R1_${m + 1}`
    };

    round1Matches.push(match);
    matches.push(match);
  }

  // Generate subsequent rounds up to final
  let previousRoundMatches = round1Matches;
  for (let r = 1; r < numRounds; r++) {
    const currentRound = rounds[r];
    const currentRoundMatchesCount = previousRoundMatches.length / 2;
    const currentMatches: Match[] = [];

    for (let m = 0; m < currentRoundMatchesCount; m++) {
      const matchId = `gen_m_${tournamentId}_r${r + 1}_${m + 1}`;
      const parentMatch1 = previousRoundMatches[m * 2];
      const parentMatch2 = previousRoundMatches[m * 2 + 1];

      const matchDate = new Date(startDateTime);
      matchDate.setDate(matchDate.getDate() + r * 3 + m);
      matchDate.setHours(16, 0, 0, 0);

      const nodePrefix = r === numRounds - 1 ? 'FINAL' : r === numRounds - 2 ? 'SF' : `R${r + 1}`;

      const match: Match = {
        id: matchId,
        tournament_id: tournamentId,
        round_id: currentRound.id,
        round_name: currentRound.round_name,
        venue_id: venueId,
        court_table: 'Main Arena',
        start_time: matchDate.toISOString(),
        status: 'scheduled',
        bracket_node_id: `${nodePrefix}_${m + 1}`
      };

      // Link parents
      if (parentMatch1) parentMatch1.next_match_id = matchId;
      if (parentMatch2) parentMatch2.next_match_id = matchId;

      currentMatches.push(match);
      matches.push(match);
    }

    previousRoundMatches = currentMatches;
  }

  return { rounds, matches };
};
