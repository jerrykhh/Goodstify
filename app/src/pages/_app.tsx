import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useReducer } from 'react'
import CartContext, { useCartReducer } from '../contexts/cart/cart'

function App({ Component, pageProps }: AppProps) {

  const [cartState, cartDispatch] = useCartReducer();

  return (
    <CartContext.Provider value={{ cartState, cartDispatch }}>
      <Component {...pageProps} />
    </CartContext.Provider>

  )
}

export default App
