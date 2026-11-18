import mongoose from "mongoose";
import User from "../src/lib/database/models/user.model.js";
import Image from "../src/lib/database/models/image.model.js";
import Transaction from "../src/lib/database/models/transaction.model.js";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  FAIL: ${testName}`);
    testsFailed++;
  }
}

console.log("\n==========================================");
console.log("SUITE 1: Mongoose Models & Schemas Verification");
console.log("==========================================");

// 1. User Model Schema Checks
console.log("\n--- Testing User Model ---");
assert(User.schema.paths.clerkId !== undefined, "User schema has 'clerkId'");
assert(User.schema.paths.email !== undefined, "User schema has 'email'");
assert(User.schema.paths.username !== undefined, "User schema has 'username'");
assert(User.schema.paths.photo !== undefined, "User schema has 'photo'");
assert(User.schema.paths.creditBalance !== undefined, "User schema has 'creditBalance'");
assert(User.schema.paths.creditBalance.defaultValue === 10, "User schema defaults creditBalance to 10");
assert(User.schema.paths.planId.defaultValue === 1, "User schema defaults planId to 1");

// Test User validation with valid doc
const testUser = new User({
  clerkId: "user_test123",
  email: "test@example.com",
  username: "testuser",
  photo: "https://example.com/avatar.png",
});
const userValidationError = testUser.validateSync();
assert(!userValidationError, "Valid User document passes validation without errors");

// Test User validation missing required clerkId
const invalidUser = new User({
  email: "test@example.com",
});
const invalidUserError = invalidUser.validateSync();
assert(invalidUserError && invalidUserError.errors.clerkId, "User document rejects missing clerkId");

// 2. Image Model Schema Checks
console.log("\n--- Testing Image Model ---");
assert(Image.schema.paths.title !== undefined, "Image schema has 'title'");
assert(Image.schema.paths.transformationType !== undefined, "Image schema has 'transformationType'");
assert(Image.schema.paths.publicId !== undefined, "Image schema has 'publicId'");
assert(Image.schema.paths.secureURL !== undefined, "Image schema has 'secureURL'");
assert(Image.schema.paths.transformationUrl !== undefined, "Image schema has 'transformationUrl'");
assert(Image.schema.paths.transformationURL !== undefined, "Image schema has 'transformationURL'");
assert(Image.schema.paths.creator !== undefined, "Image schema has 'creator'");
assert(Image.schema.paths.creator.options.ref === "User", "Image schema creator references User model");
assert(Image.schema.paths.updatedAt !== undefined, "Image schema has 'updatedAt'");
assert(Image.schema.paths.createdAt !== undefined, "Image schema has 'createdAt'");

// Test Image validation with valid doc
const testImage = new Image({
  title: "Test Image",
  transformationType: "fill",
  publicId: "imaginify/sample123",
  secureURL: "https://res.cloudinary.com/demo/sample123.jpg",
  transformationUrl: "https://res.cloudinary.com/demo/sample123_fill.jpg",
  transformationURL: "https://res.cloudinary.com/demo/sample123_fill.jpg",
  creator: new mongoose.Types.ObjectId(),
});
const imageValidationError = testImage.validateSync();
assert(!imageValidationError, "Valid Image document passes validation without errors");

// Test Image validation missing required title
const invalidImage = new Image({
  transformationType: "fill",
});
const invalidImageError = invalidImage.validateSync();
assert(invalidImageError && invalidImageError.errors.title, "Image document rejects missing title");

// 3. Transaction Model Schema Checks
console.log("\n--- Testing Transaction Model ---");
assert(Transaction.schema.paths.stripeId !== undefined, "Transaction schema has 'stripeId'");
assert(Transaction.schema.paths.amount !== undefined, "Transaction schema has 'amount'");
assert(Transaction.schema.paths.credits !== undefined, "Transaction schema has 'credits'");
assert(Transaction.schema.paths.buyer !== undefined, "Transaction schema has 'buyer'");
assert(Transaction.schema.paths.buyer.options.ref === "User", "Transaction schema buyer references User model");

const testTransaction = new Transaction({
  stripeId: "txn_12345",
  amount: 40,
  credits: 120,
  plan: "Pro Package",
  buyer: new mongoose.Types.ObjectId(),
});
const txnValidationError = testTransaction.validateSync();
assert(!txnValidationError, "Valid Transaction document passes validation without errors");

// 4. Utility Functions Tests
console.log("\n==========================================");
console.log("SUITE 2: Utility Functions Verification");
console.log("==========================================");
import { deepMergeObjects, getImageSize, aspectRatioOptions } from "../src/lib/utils.js";

// deepMergeObjects test
const obj1 = { restore: true, remove: { prompt: "tree" } };
const obj2 = { remove: { to: "rock" } };
const merged = deepMergeObjects(obj1, obj2);
assert(merged.remove.to === "rock", "deepMergeObjects merges nested objects properly");

// getImageSize test
const fillSize = getImageSize("fill", { aspectRatio: "1:1" }, "width");
assert(fillSize === 1000, "getImageSize returns correct width for 1:1 aspect ratio");

const nonFillSize = getImageSize("restore", { width: 640 }, "width");
assert(nonFillSize === 640, "getImageSize returns custom image dimension for non-fill transformations");

console.log("\n==========================================");
console.log(`VERIFICATION SUMMARY: ${testsPassed} passed, ${testsFailed} failed`);
console.log("==========================================\n");

if (testsFailed > 0) {
  process.exit(1);
}
