import Header from '@/components/Header'
import React from 'react'

import { transformationTypes } from '../../../../../../constants';
import TransformationForm from '@/components/shared/TransformationForm';
import { getUserById } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export const dynamic = "force-dynamic";

const AddTransformationTypePage = async ({ params }: SearchParamProps) => {
  const { type } = await params;
  const transformation = transformationTypes[type as TransformationTypeKey];

  if (!transformation) redirect('/');

  const { title, subTitle } = transformation;

  const { userId } = auth();

  if (!userId) redirect('/sign-in')

  const user = await getUserById(userId);

  if (!user) redirect('/');

  return (
    <>
      <Header 
        title={title}
        subtitle={subTitle}
      />
      
      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user._id}
          type={type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  )
}

export default AddTransformationTypePage
