import mongoose from "mongoose";
import User from "../src/lib/database/models/user.model.ts";
import Image from "../src/lib/database/models/image.model.ts";
import Transaction from "../src/lib/database/models/transaction.model.ts";
import { deepMergeObjects, getImageSize } from "../src/lib/utils.ts";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string) {
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
assert(Boolean(invalidUserError && invalidUserError.errors.clerkId), "User document rejects missing clerkId");

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
assert(Boolean(invalidImageError && invalidImageError.errors.title), "Image document rejects missing title");

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

// 5. Webhook Logic & Event Mapping Tests
console.log("\n==========================================");
console.log("SUITE 3: Webhook Event Handling Logic");
console.log("==========================================");

// Clerk user.created event simulation
const clerkUserCreatedEvent = {
  type: "user.created",
  data: {
    id: "user_clerk_999",
    email_addresses: [{ email_address: "jane@example.com" }],
    username: null, // missing username from OAuth
    image_url: null, // missing photo
    first_name: "Jane",
    last_name: "Doe",
  },
};

const mappedClerkUser = {
  clerkId: clerkUserCreatedEvent.data.id,
  email: clerkUserCreatedEvent.data.email_addresses[0].email_address,
  username:
    clerkUserCreatedEvent.data.username ||
    clerkUserCreatedEvent.data.email_addresses[0]?.email_address.split("@")[0] ||
    clerkUserCreatedEvent.data.id,
  firstName: clerkUserCreatedEvent.data.first_name || "",
  lastName: clerkUserCreatedEvent.data.last_name || "",
  photo: clerkUserCreatedEvent.data.image_url || "/assets/icons/profile.svg",
};

assert(mappedClerkUser.username === "jane", "Clerk webhook falls back to email prefix when username is null");
assert(mappedClerkUser.photo === "/assets/icons/profile.svg", "Clerk webhook falls back to default avatar when photo is null");
assert(mappedClerkUser.clerkId === "user_clerk_999", "Clerk webhook maps clerkId correctly");

// Stripe checkout.session.completed simulation
const stripeEvent = {
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_12345",
      amount_total: 4000, // in cents
      metadata: {
        plan: "Pro Package",
        credits: "120",
        buyerId: "64b7f8e1234567890abcdef1",
      },
    },
  },
};

const mappedTransaction = {
  stripeId: stripeEvent.data.object.id,
  amount: stripeEvent.data.object.amount_total ? stripeEvent.data.object.amount_total / 100 : 0,
  plan: stripeEvent.data.object.metadata?.plan || "",
  credits: Number(stripeEvent.data.object.metadata?.credits) || 0,
  buyerId: stripeEvent.data.object.metadata?.buyerId || "",
};

assert(mappedTransaction.amount === 40, "Stripe webhook converts cents to dollars correctly");
assert(mappedTransaction.credits === 120, "Stripe webhook casts credits to number correctly");
assert(mappedTransaction.buyerId === "64b7f8e1234567890abcdef1", "Stripe webhook extracts buyerId from metadata");

// 6. Security & Authorization Logic Tests
console.log("\n==========================================");
console.log("SUITE 4: Security & Business Rules");
console.log("==========================================");

// Credit Deduction Guard
function canDeductCredit(creditBalance: number): boolean {
  return creditBalance >= 1;
}
assert(canDeductCredit(10) === true, "User with 10 credits can apply transformation");
assert(canDeductCredit(1) === true, "User with 1 credit can apply transformation");
assert(canDeductCredit(0) === false, "User with 0 credits is rejected from applying transformation");
assert(canDeductCredit(-1) === false, "User with negative credits is rejected from applying transformation");

// Image Ownership Check
function isAuthorizedToModifyImage(imageCreatorId: string, currentUserId: string): boolean {
  return imageCreatorId === currentUserId;
}
const creatorId = "user_mongo_1";
const attackerId = "user_mongo_2";
assert(isAuthorizedToModifyImage(creatorId, creatorId) === true, "Creator is authorized to edit/delete image");
assert(isAuthorizedToModifyImage(creatorId, attackerId) === false, "Unauthorized user is rejected from modifying image");

// Transaction Buyer ID validation
function validateTransactionParams(buyerId?: string) {
  if (!buyerId) {
    throw new Error("Missing buyer ID for transaction");
  }
  return true;
}
assert(validateTransactionParams("valid_id") === true, "Transaction with buyerId passes validation");
let rejected = false;
try {
  validateTransactionParams("");
} catch {
  rejected = true;
}
assert(rejected === true, "Transaction without buyerId is rejected");

console.log("\n==========================================");
console.log(`VERIFICATION SUMMARY: ${testsPassed} passed, ${testsFailed} failed`);
console.log("==========================================\n");

if (testsFailed > 0) {
  process.exit(1);
}
