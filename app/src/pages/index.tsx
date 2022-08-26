/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next'
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { listProductConnection, Product } from '../typings/product'
import CartContext, { CartAction, CartState, ShopCartListModalContext, useCartReducer } from '../contexts/cart/cart'
import { converCartItemQty, qDecoder, qEncoder } from '../lib/qCodec'
import { CartItem } from '../typings/cart'
import ShopCartList from '../components/shopcartList'
import { ProductItemContext } from '../contexts/cart/productItem'
import ProductItem from '../components/productItem'
import { listProduct } from '../lib/product'
import InfiniteScroll from "react-infinite-scroll-component";
import Head from 'next/head'

// interface HomePageProps {
//   products2dMatrix: Array<Product[]>;
// }

const linktree: { [k: string]: string } = {
  "Instagram": "https://www.instagram.com/goodstify_au/",
  "Goodstify AU (Australia)": "./au",
  "Goodstify JP (Japan) Comming Soon": "#",
  "Goodstify TW": "#"
  // "Goodstify JP": "./jp"
}

const Home: NextPage = () => {


  return (
    <React.Fragment>
      <Head>
        <title>Goodstify - Linktree</title>
      </Head>
      <div className='container mx-auto max-w-lg h-screen'>
        <div className='flex items-center justify-center h-screen'>

          <div className='p-4 '>
            <div className='text-center text-4xl '>
              <img src="/icon.png" alt='Goodstify Logo' className='border' />
            </div>
            {Object.keys(linktree).map((title: string) => (

              <div className='text-center m-4' key={title}>
                <a href={linktree[title]} >
                  {(linktree[title] !== "#") ?
                    <div className='border border-black text-3x p-4 hover:bg-black hover:text-white'>
                      {title}
                    </div>
                    :
                    <div className='border text-3x p-4 bg-gray-100 text-gray-300 border-gray-400'>
                      {title}
                    </div>

                  }

                </a>
              </div>
            ))
            }
          </div>



        </div>

      </div>
    </React.Fragment>

  )
}


export default Home
