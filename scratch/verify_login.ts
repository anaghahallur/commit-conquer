
import { AuthService } from "../packages/modules/auth/auth.service";

async function verifyLogin() {
  console.log("--- Testing Login Logic ---");
  try {
    const { customer, token } = await AuthService.login({
      email: "demo@example.com",
      password: "demo1234"
    });
    console.log("✅ Login successful for:", customer.email);
    console.log("Token:", token);
  } catch (e: any) {
    console.error("❌ Login failed:", e.message);
  }
}

verifyLogin();
