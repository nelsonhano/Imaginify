"use server";

import { v2 as cloudinary } from 'cloudinary';
import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';
import { Stripe } from 'stripe';

import { connectToDatabase } from "../database/mongoose";
import Image from '../database/models/image.model';
import User from "../database/models/user.model";
import { handleError } from "../utils";

const populateUser = (query: any) => query.populate({
    path: 'creator',
    model: User,
    select: '_id firstName lastName'
})

//ADD IMAGE
export async function addImage({ image, userId, path}: AddImageParams) {
    try {
        await connectToDatabase();

        const creator = await User.findById(userId);
        
        if (!creator) {
            throw new Error("User not Found");
        }
         
        const newImage = await Image.create({
            ...image,
            creator: creator._id,
        });
        console.log(newImage);
        
        revalidatePath(path)
        
        return JSON.parse(JSON.stringify(newImage));
    } catch (error) {
        handleError(error)
    }
}

//UPDATE IMAGE
export async function updateImage({ image, userId, path }: UpdateImageParams) {
    try { 
        await connectToDatabase();

        const imageToUpdate = await Image.findById(image._id);

        if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
            throw new Error("Unauthorized or Image Not Found");
        }

        const updateImage = await Image.findByIdAndUpdate(
            imageToUpdate._id,
            image,
            {new: true}
        )

        revalidatePath(path)

        return JSON.parse(JSON.stringify(updateImage ));
    } catch (error) {
        handleError(error)
    }
}


//DELETE IMAGE
export async function deleteImage(imageId: string) {
    try {
        await connectToDatabase();

        await Image.findByIdAndDelete(imageId);
    } catch (error) {
        handleError(error)
    } finally{
        redirect('/')
    }
}
//GET IMAGE
export async function getImageById(imageId: string) {
    try {
        await connectToDatabase();

        const image = await populateUser(Image.findById(imageId));
        
        if (!image) throw new Error("Image Not Found");
        
        // revalidatePath(path)

        return JSON.parse(JSON.stringify(image));
    } catch (error) {
        handleError(error)
    }
}

//GET IMAGES
export async function getAllImages({ limit = 9, page = 1, searchQuery = ''}: {
    limit?: number; page: number; searchQuery?: string;
}) {
    try {
        await connectToDatabase();

        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.NEXT_CLOUDINARY_CLOUD_KEY,
            api_secret: process.env.NEXT_CLOUDINARY_CLOUD_SECRETE,
            secure: true,
        })

        let expression = 'folder=imaginify';

        if (searchQuery) {
            expression += ` AND ${searchQuery}`
        }

        const { resources } = await cloudinary.search
            .expression(expression)
            .execute();

        const resourcesIds = resources.map((resources: any) => resources.public_id);

        let query = {};

        if (searchQuery) {
            query = {
                publicId: {
                    $in: resourcesIds
                }
            }
        }

        const skipAmount = (Number(page) - 1) * limit;

        const images = await populateUser(Image.find(query))
            .sort({ updateAt: -1})
            .skip(skipAmount)
            .limit(limit);
            
            const totalImages = await Image.find(query).countDocuments();
            const savedImages = await Image.find().countDocuments();

            return {
                data: JSON.parse(JSON.stringify(images)),
                totalPage: Math.ceil(totalImages / limit),
                savedImages,
            }
    } catch (error) {
        handleError(error)
    }
}