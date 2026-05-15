
import { AuthService } from "../packages/modules/auth/auth.service";

/**
 * Verification Script for Google OAuth Security Fixes
 * Run this with: npx ts-node scratch/verify_fix.ts
 */
async function verify() {
  console.log("--- 1. Testing Unverified Email Rejection ---");
  
  const payloadUnverified = {
    email: "fake@unverified.com",
    email_verified: false,
    iss: "accounts.google.com",
    aud: "mock_client_id"
  };
  
  const tokenUnverified = Buffer.from(JSON.stringify({ alg: "RS256" })).toString('base64url') + "." + 
                          Buffer.from(JSON.stringify(payloadUnverified)).toString('base64url') + "." + 
                          "sig";

  try {
    await AuthService.googleLogin(tokenUnverified);
    console.error("❌ FAIL: Accepted an unverified email token!");
  } catch (e: any) {
    console.log("✅ SUCCESS: Correctly rejected unverified email:", e.message);
  }

  console.log("\n--- 2. Testing Audience (aud) Mismatch ---");
  process.env.GOOGLE_CLIENT_ID = "real_client_id";
  const payloadBadAud = { ...payloadUnverified, email_verified: true, aud: "fake_client_id" };
  const tokenBadAud = Buffer.from(JSON.stringify({ alg: "RS256" })).toString('base64url') + "." + 
                      Buffer.from(JSON.stringify(payloadBadAud)).toString('base64url') + "." + 
                      "sig";

  try {
    await AuthService.googleLogin(tokenBadAud);
    console.error("❌ FAIL: Accepted a token with mismatched audience!");
  } catch (e: any) {
    console.log("✅ SUCCESS: Correctly rejected audience mismatch:", e.message);
  }

  console.log("\n--- 3. Testing User Name Truncation ---");
  const longName = "A".repeat(100);
  const payloadLongName = { ...payloadUnverified, email_verified: true, aud: "real_client_id", name: longName };
  const tokenLongName = Buffer.from(JSON.stringify({ alg: "RS256" })).toString('base64url') + "." + 
                        Buffer.from(JSON.stringify(payloadLongName)).toString('base64url') + "." + 
                        "sig";

  try {
    const { customer } = await AuthService.googleLogin(tokenLongName);
    console.log("✅ SUCCESS: Logged in with oversized name");
    console.log(`   First Name in DB: "${customer.first_name}" (Length: ${customer.first_name.length})`);
    if (customer.first_name.length <= 50) {
      console.log("✅ SUCCESS: Name correctly truncated to 50 characters.");
    } else {
      console.error("❌ FAIL: Name was NOT truncated!");
    }
  } catch (e: any) {
    console.error("❌ FAIL: Error during login:", e.message);
  }
}

verify();
