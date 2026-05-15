
import { UserService } from "../packages/server/src/services/userService";
import { LeaderboardService } from "../packages/server/src/services/leaderboardService";
import { NotificationService } from "../packages/server/src/services/notificationService";

async function verifyOvertaken() {
  console.log("--- Testing Overtaken Awareness Logic ---");
  
  const userService = new UserService();
  const leaderboardService = new LeaderboardService();
  const notificationService = new NotificationService();

  // Reset
  userService._reset([]);
  notificationService._reset();

  // 1. Setup users
  const userA = await userService.register({ username: "UserA", email: "a@ex.com" });
  const userB = await userService.register({ username: "UserB", email: "b@ex.com" });

  // Mock the hook (similar to what's in app.ts)
  const originalAddPoints = userService.addPoints.bind(userService);
  userService.addPoints = async (id, points) => {
    const oldRanks = await leaderboardService.getRankMap();
    const result = await originalAddPoints(id, points);
    const newRanks = await leaderboardService.getRankMap();
    
    const drops = leaderboardService.detectRankDrops(oldRanks, newRanks);
    for (const droppedId of drops) {
      const overtaker = await userService.findById(id);
      await notificationService.create({
        userId: droppedId,
        type: 'OVERTAKEN',
        message: `You've been overtaken by @${overtaker.username} on the leaderboard!`
      });
    }
    return result;
  };

  // 2. User A gets points
  await userService.addPoints(userA.id, 10);
  console.log("User A points added.");

  // 3. User B gets points and overtakes User A
  await userService.addPoints(userB.id, 20);
  console.log("User B points added (overtaking User A).");

  // 4. Check notifications for User A
  const notifs = await notificationService.getForUser(userA.id);
  if (notifs.length > 0) {
    console.log("✅ Notification found for User A:", notifs[0].message);
  } else {
    console.error("❌ No notification found for User A!");
  }
}

verifyOvertaken();
