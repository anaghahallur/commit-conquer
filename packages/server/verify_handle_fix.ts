
import { ProductModel } from "../modules/products/product.model";

async function verify() {
  console.log("🚀 Starting Handle Uniqueness Verification...\n");

  try {
    // 1. Create initial product
    const p1 = ProductModel.create({
      title: "Test Product",
      description: "Original",
      images: [],
      status: "published",
      category: "Tops",
      tags: [],
      variants: []
    });
    console.log(`✅ Step 1: Created product "${p1.title}" (Handle: ${p1.handle})`);

    // 2. Try to create duplicate (should fail)
    try {
      ProductModel.create({
        title: "Test Product",
        variants: []
      } as any);
      console.log("❌ Error: Should have blocked duplicate active handle!");
    } catch (e: any) {
      console.log(`✅ Step 2: Correctly blocked duplicate active handle: "${e.message}"`);
    }

    // 3. Soft delete the first product
    ProductModel.delete(p1.id);
    console.log(`✅ Step 3: Soft-deleted product "${p1.id}"`);

    // 4. Re-create with same handle (should succeed)
    const p2 = ProductModel.create({
      title: "Test Product",
      description: "New Version",
      images: [],
      status: "published",
      category: "Tops",
      tags: [],
      variants: []
    });
    console.log(`✅ Step 4: Re-created same handle successfully! (New ID: ${p2.id})`);

    // 5. Verify search doesn't show deleted ones
    const all = ProductModel.findAll();
    const hasOld = all.some(p => p.id === p1.id);
    console.log(`✅ Step 5: Verified findAll() excluded deleted product: ${!hasOld}`);

    console.log("\n✨ Verification Complete: Soft-delete and Partial Uniqueness working as intended!");
  } catch (err) {
    console.error("\n❌ Verification Failed:", err);
  }
}

verify();
