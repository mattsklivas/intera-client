import React from 'react'
import Head from 'next/head'
import '../styles/globals.css'
import { UserProvider } from '@auth0/nextjs-auth0/client'

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Head>
        <title>Intera</title>
        <meta
          name="description"
          content="Intera - An ASL/Speech to Text Faciliator \& Learning Platform"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </UserProvider>
  )
}
