/**
 * packages/server/src/services/leaderboardService.ts
 */

import { UserService } from './userService';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalPoints: number;
  commitCount: number;
}

// Shares the same module-level store as UserService via the singleton instance.
const userService = new UserService();

export class LeaderboardService {
  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const users = await userService.findAll();

    return [...users]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
      .map((user, index) => ({
        rank:        index + 1,
        userId:      user.id,
        username:    user.username,
        totalPoints: user.totalPoints,
        commitCount: 0,
      }));
  }

  async getUserRank(
    userId: string,
  ): Promise<{ rank: number; totalPoints: number } | null> {
    const users = await userService.findAll();

    const sorted = [...users].sort((a, b) => b.totalPoints - a.totalPoints);
    const index  = sorted.findIndex((u) => u.id === userId);

    if (index === -1) return null;

    return {
      rank:        index + 1,
      totalPoints: sorted[index].totalPoints,
    };
  }

  /** Returns a map of userId -> rank (1-indexed) */
  async getRankMap(): Promise<Map<string, number>> {
    const users = await userService.findAll();
    const sorted = [...users].sort((a, b) => b.totalPoints - a.totalPoints);
    
    const map = new Map<string, number>();
    sorted.forEach((u, i) => {
      map.set(u.id, i + 1);
    });
    return map;
  }

  /** 
   * Compares two rank maps and returns list of user IDs whose rank dropped 
   * (e.g. went from 1 to 2).
   */
  detectRankDrops(
    oldMap: Map<string, number>,
    newMap: Map<string, number>,
  ): string[] {
    const drops: string[] = [];

    newMap.forEach((newRank, userId) => {
      const oldRank = oldMap.get(userId);
      if (oldRank !== undefined && newRank > oldRank) {
        drops.push(userId);
      }
    });

    return drops;
  }
}