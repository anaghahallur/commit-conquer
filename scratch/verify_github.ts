
import { AuthService } from "../packages/modules/auth/auth.service";

async function verify() {
  console.log("--- Testing GitHub Account Linking ---");

  // Create a demo user
  const { customer } = await AuthService.register({
    email: "github_test@example.com",
    password: "password123",
    first_name: "GitHub",
    last_name: "Tester"
  });

  console.log("User created:", customer.id);

  // Mock GitHub code exchange
  // Note: Since I can't actually hit GitHub's API without real keys, 
  // I will mock the _exchangeGitHubCode and _fetchGitHubUser functions 
  // for this verification script if I were using a real test framework.
  // Here, I'll just check if the methods exist and the types are correct.
  
  console.log("AuthService.githubConnect exists:", typeof AuthService.githubConnect === 'function');
  console.log("AuthService.githubLogin exists:", typeof AuthService.githubLogin === 'function');

  // I'll add a small check to ensure the customer object has the new fields
  if ('github_id' in customer) {
    console.log("✅ SUCCESS: Customer type includes github_id");
  } else {
    console.error("❌ FAIL: Customer type missing github_id");
  }

  console.log("\nVerification complete. (Manual verification of OAuth flow required with real GITHUB_CLIENT_ID)");
}

verify();
