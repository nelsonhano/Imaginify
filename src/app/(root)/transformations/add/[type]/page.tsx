import Header from '@/components/Header'
import React from 'react'

import { transformationTypes } from '../../../../../../constants';

const AddTransformationTypePage = ({ params: {type}}: SearchParamProps) => {
  const { title, subTitle } = transformationTypes[type];
  console.log('Debugging path url', transformationTypes[type]);
  console.log('Debugging path url',transformationTypes);
  
  return (
    <Header 
      title={title}
      subtitle={subTitle}
    />
  )
}

export default AddTransformationTypePage
