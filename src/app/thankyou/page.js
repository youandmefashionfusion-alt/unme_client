"use client"
import React,{ Suspense } from 'react'
import Thankyou from '../../../components/Thankyou'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <Thankyou/>
    </Suspense>
  )
}

export default page
