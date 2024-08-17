import Header from '@/components/Header'
import React from 'react'

import { transformationTypes } from '../../../../../../constants';
import TransformationForm from '@/components/shared/TransformationForm';
import { getUserById } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

const AddTransformationTypePage = async ({ params: {type}}: SearchParamProps) => {
  const { title, subTitle } = transformationTypes[type];

  const { userId } = auth();

  if (!userId) redirect('/sign-in')

  const user = await getUserById(userId);

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
