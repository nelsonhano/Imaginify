"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import * as React from "react"
import { z } from "zod"
import { useTransition } from 'react'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


import { Input } from "@/components/ui/input"
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "../../../constants"
import { CustomField } from "./CustomField"
import { useState } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import { updateCredits } from "@/lib/actions/user.actions"
import MediaUploader from "./MediaUploader"

export const formSchema = z.object({
    title: z.string(),
    aspectRation: z.string().optional(),
    color: z.string().optional(),
    prompt: z.string().optional(),
    publicId: z.string()
})

export default function TransformationForm({ action, data = null, userId, type, creditBalance, config = null }: TransformationFormProps) {
      
    const transformationType = transformationTypes[type];
    const [ newTransformation, setNewTransformation ] = useState< Transformations | null >(null)
    const [image, setImage] = useState(data);
    const [isSubmitting, setIsSubmitting ] = useState(false)
    const [ isTransforming, setIsTransforming ] = useState(false);
    const [ transformationConfig, setTransformationConfig ] = useState(config);
    const [ isPending, startTransition ] = useTransition()


    const initiaValues = data && action === 'Update' ? {
        title: data?.title,
        aspectRatio: data?.aspectRatio,
        color: data?.color,
        prompt: data?.prompt,
        publicId: data?. publicId
    }: defaultValues
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initiaValues
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }
    //TODO: Reture to updateCredits
    const onTransformHandler = async () => {
        setIsTransforming(true);

        setTransformationConfig(
            deepMergeObjects(newTransformation, transformationConfig)
        )

        setNewTransformation(null);

        startTransition(async () => {
            // await updateCredits(userId, creditFee)
        })
    }

    const onSelectField = (value:string, onChangeField: (value:string) =>void) => {
        const imageSize = aspectRatioOptions[value as AspectRatioKey];
        
        setImage((preState: any) => ({
            ...preState,
            aspectRation: imageSize.aspectRatio,
            width: imageSize.width,
            height: imageSize.height
        }));
        
        setNewTransformation(transformationType.config);
        
        return onChangeField(value)
    }
    
    const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
        debounce(() => {
            setNewTransformation((preState: any) => ({
                ...preState,
                [type]: {
                    ...preState?.[type],
                    [fieldName === 'prompt' ? 'prompt' : 'to']:
                    value
                }
            }))
        }, 1000)
    }
  return (
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CustomField 
                control={form.control}
                name='title'
                formLabel="Image label"
                className="w-full"
                render={({field}) => <Input className="input-field"{...field} />}
            />

            {type === 'fill' && (
                <CustomField 
                    control={form.control}
                    name="aspectRation"
                    formLabel="Aspect Ratio"
                    className="w-full"
                    render={({field}) => (
                        <Select
                            onValueChange={(value) =>{
                                onSelectField(value, field.onChange)
                            }}
                        >
                            <SelectTrigger className="select-field">
                                <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(aspectRatioOptions).map((key) => (
                                    <SelectItem key={key} value={key} className="select-item">
                                        {aspectRatioOptions[key as AspectRatioKey].label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                            
                        </Select>
                        
                    )}
                />
            )}

            {(type === 'remove' || type === 'recolor') && (
                <div className="prompt-filed">
                    <CustomField 
                        control={form.control}
                        name='prompt'
                        formLabel={
                            type === 'remove' ? 'Object to remove' : 'Object to recolor'
                        }
                        className="w-full"
                        render={(({ field }) => (
                            <Input 
                                value={field.value}
                                className="input-field"
                                onChange={(e)=>onInputChangeHandler(
                                    'prompt',
                                    e.target.value,
                                    type,
                                    field.onChange
                                )}
                            />
                        ))}
                    />

                    {type === 'recolor' && (
                        <CustomField 
                            control={form.control}
                            name='color'
                            formLabel="Replacement Color"
                            className="w-full"
                            render={({field}) => (
                                <Input 
                                    value={field.value}
                                    className="input-field"
                                    onChange={(e) => onInputChangeHandler(
                                        'prcolorompt',
                                        e.target.value,
                                        'recolor',
                                        field.onChange
                                    )}
                                />
                            )}
                        />
                    )}
                </div> 
            )}
            <div className="media-uploader-field">
                <CustomField
                    control={form.control}
                    name='publicId'
                    className="flex size-full flex-col"
                    render={({field}) => (
                        <MediaUploader 
                            onValueChange={field.onChange}
                            setImage={setImage}
                            publicId={field.value}
                            image={image}
                            type={type}
                        />
                    )}
                />
            </div>
             
            <div className="flex flex-col gap-4">
                <Button 
                    className="submit-button capitalize"
                    type="submit"
                    disabled={isTransforming || newTransformation === null } 
                >
                {isTransforming ? 'Transforming...' : 'Apply Transformation'}
                </Button>

                  <Button
                      className="submit-button capitalize"
                      type="submit"
                      disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Save Image'}
                  </Button>
            </div>
          </form>
      </Form>
  )
}
   