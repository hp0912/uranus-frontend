import React from 'react';
import Head from 'next/head';
import { Banner } from '../components/Banner';

export default function Home() {
  return (
    <>
      <Head>
        <title>吼吼的博客</title>
        <meta
          name="keywords"
          content="前端，后端，Nodejs，golang，docker，kubernetes，k8s，吼吼"
        />
        <meta
          name="description"
          property="og:description"
          content="吼吼的个人博客"
        />
      </Head>
      <Banner />
    </>
  );
}

export const runtime = 'edge';

export async function getStaticProps() {
  return {
    props: {
      userState: null,
    },
  };
}
