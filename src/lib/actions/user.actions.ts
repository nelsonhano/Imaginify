"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { updateCreditsInternal } from "../services/user.service";

// READ
export async function getUserById(userId: string) {
    try {
        await connectToDatabase();

        let user = await User.findOne({ clerkId: userId });

        if (!user) {
            // Auto-provision user from Clerk session if webhook missed or is delayed
            try {
                const clerkUser = await currentUser();
                if (clerkUser && clerkUser.id === userId) {
                    const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
                    if (email) {
                        user = await User.findOne({ email });
                        if (user) {
                            user.clerkId = userId;
                            if (clerkUser.imageUrl) user.photo = clerkUser.imageUrl;
                            await user.save();
                        }
                    }
                    if (!user) {
                        const baseUsername = clerkUser.username || (email ? email.split('@')[0] : clerkUser.id);
                        const existingUsername = await User.findOne({ username: baseUsername });
                        const username = existingUsername ? `${baseUsername}_${clerkUser.id.slice(-4)}` : baseUsername;

                        user = await User.create({
                            clerkId: clerkUser.id,
                            email: email || `${clerkUser.id}@noemail.com`,
                            username: username,
                            firstName: clerkUser.firstName || "",
                            lastName: clerkUser.lastName || "",
                            photo: clerkUser.imageUrl || "/assets/icons/profile.svg",
                            creditBalance: 10,
                        });
                    }
                }
            } catch (syncError) {
                console.error("Auto-sync Clerk user to database failed:", syncError);
            }
        }

        return user ? JSON.parse(JSON.stringify(user)) : null;
    } catch (error) {
        console.error("Failed to get user by id:", error);
        return null;
    }
}

// USE CREDITS (SECURED)
export async function updateCredits() {
    try {
        const { userId: clerkId } = auth();
        if (!clerkId) throw new Error("Unauthorized");

        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) throw new Error("User not found");

        if (user.creditBalance < 1) {
            throw new Error("Insufficient credits");
        }

        const updatedUser = await updateCreditsInternal(user._id, -1);

        return JSON.parse(JSON.stringify(updatedUser));
    } catch (error) {
        handleError(error);
    }
}