
import { OrderService } from "../packages/modules/orders/order.service";

async function verifyRefundSecurity() {
  console.log("--- Testing Refund Security Logic ---");

  // 1. Get an existing order (ORD-1003 is 'delivered' in seeds)
  const orderId = "ORD-1003";
  const order = OrderService.getById(orderId);
  console.log(`Original Order Total: ${order.total / 100} USD`);

  // 2. Perform a partial refund
  const refund1 = 1000; // $10.00
  await OrderService.refund({ order_id: orderId, amount: refund1 });
  console.log(`Refunded $10.00. New refunded_total: ${OrderService.getById(orderId).refunded_total / 100} USD`);

  // 3. Attempt a refund that exceeds the total
  const remaining = order.total - 1000;
  const badRefund = remaining + 1;
  
  try {
    await OrderService.refund({ order_id: orderId, amount: badRefund });
    console.error("❌ FAILED: Refund exceeding total should have been blocked!");
  } catch (err: any) {
    console.log(`✅ SUCCESS: Blocked refund exceeding total. Error: ${err.message}`);
  }

  // 4. Verify revenue stats (ORD-1000 is 10214 cents = $102.14)
  const stats = OrderService.stats();
  console.log(`Total Revenue (seeded orders): ${stats.revenue / 100} USD`);
  // If revenue was $2451.36 and we refunded $10, it should be $2441.36
}

verifyRefundSecurity();
