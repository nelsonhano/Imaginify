import Header from '@/components/Header'
import React from 'react'

import { transformationTypes } from '../../../../../../constants';

const AddTransformationTypePage = ({ params: {type}}: SearchParamProps) => {
  const { title, subTitle } = transformationTypes[type];
  
  return (
    <Header 
      title={title}
      subtitle={subTitle}
      type={type}
    />
  )
}

export default AddTransformationTypePage
