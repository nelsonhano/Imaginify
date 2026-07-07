"use server";

import { auth } from "@clerk/nextjs/server";

import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { updateCreditsInternal } from "../services/user.service";

// READ
export async function getUserById(userId: string) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId: userId });

        if (!user) throw new Error("User not found");

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        handleError(error);
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

        const updatedUser = await updateCreditsInternal(user._id, -1);

        return JSON.parse(JSON.stringify(updatedUser));
    } catch (error) {
        handleError(error);
    }
}