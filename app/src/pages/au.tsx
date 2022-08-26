/* eslint-disable @next/next/no-img-element */
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useLayoutEffect, useRef } from "react";
import { useContext, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ProductItem from "../components/productItem";
import ShopCartList from "../components/shopcartList";
import CartContext, { CartAction, CartState, ShopCartListModalContext } from "../contexts/cart/cart";
import { ProductItemContext } from "../contexts/cart/productItem";
import { listProduct } from "../lib/product";
import { converCartItemQty, qDecoder, qEncoder } from "../lib/qCodec";
import { CartItem } from "../typings/cart";
import { listProductConnection, Product } from "../typings/product";

const AUPage = () => {
  
  const router = useRouter(); 

  const [isQueryInit, setQueryIsInit] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpenCartModal, setIsOpenCartModal] = useState<boolean>(false);

  const [openProductItem, setOpenProductItem] = useState<Product | null>(null);
  const [products, setProducts] = useState<Array<Array<Product>>>([[]]);
  const [categorieId, setCategorieId] = useState<String | null>(null);
  const [currListProductConnection, setCurrListProductConnection] = useState<listProductConnection | null>(null);


  const { cartState, cartDispatch } = useContext(CartContext);

  // ref
  const contentRef = useRef<HTMLDivElement | null>(null);
  const checkoutRef = useRef<HTMLDivElement | null>(null);


  const addToCart = (product: Product) => {
    console.log("add", product.id, product.sortId)
    cartDispatch({
      type: CartAction.ADD_ITEM,
      playeload: product
    });
    //encodeQueryString(product);
    //updateLayout();
  }

  const unHashQueryProducts = async (q: string) => {
    const qProducts: Array<Product> = await qDecoder(q as string);
    const productQty = converCartItemQty(q as string);

    qProducts.forEach((product: Product) => {
      let qty: number = 1;
      if (productQty[product.sortId][product.id])
        qty = productQty[product.sortId][product.id];
      
      [...new Array(qty)].forEach(() => {
        cartDispatch({
          type: CartAction.ADD_ITEM,
          playeload: convertProductImage2CDN(product)
        });
      })
    })
  }

  useLayoutEffect(() => {
    if (Object.keys(cartState.items).length > 0) {
      const contentEleHeight = contentRef.current!.clientHeight;
      const checkOutEleHeight = checkoutRef.current!.clientHeight;
      contentRef.current!.style.height = `${contentEleHeight + checkOutEleHeight}px`;
    } else {
      contentRef.current!.style.removeProperty('height');
    }
  }, [cartState.items])


  useEffect(() => {

    if (!router.isReady) return;
    const { q } = router.query;
    if (q && q !== "" && q !== null){
      unHashQueryProducts(q as string)
    }
    setQueryIsInit(false);

  }, [router.isReady]);

  const fetchProducts = async (query: { [k: string]: any }) => {
    
    const productConnection: listProductConnection = await listProduct(query);

    if (productConnection.count > 0) {

      const tempProducts = (query['next']) ? [...products] : [[]];
      // const tempProducts: Array<Array<Product>> = [...products];
      console.log(tempProducts)
      do {
        console.log("product.length", tempProducts.length)
        if (tempProducts[tempProducts.length - 1].length > 3)
          tempProducts.push([]);
        tempProducts[tempProducts.length - 1].push(productConnection.items.shift() as Product);
      } while (productConnection.items.length > 0)
      setProducts(tempProducts);

    }
    setCurrListProductConnection(productConnection);
  }


  const fetchNextProducts = async () => {
    const query: { [k: string]: any } = {};
    query["country"] = "au"

    if (categorieId !== "" && categorieId !== null)
      query["sortId"] = categorieId

    if (currListProductConnection !== null && currListProductConnection.next !== null)
      query["next"] = currListProductConnection.next;

    await fetchProducts(query);

  }

  useEffect(() => {

    fetchProducts({
      "country": "au"
    }).then(() => {
      setIsLoading(false);
    })

  }, [router.isReady]);

  useEffect(() => {

    if (categorieId !== null)
      fetchProducts({
        "country": "au",
        "sortId": categorieId
      });

  }, [categorieId]);


  const encodeQueryString = () => {
    const encoded = qEncoder(cartState);
    if ((encoded === "" || Object.keys(cartState.items).length === 0))
    router.push(`/${"au"}`, undefined, { shallow: true })
    else
      router.push(`/${"au"}?q=${encoded}`, undefined, { shallow: true });
  }

  useEffect(() => {
      console.log("isQueryInit", isQueryInit)
      if(!isQueryInit)
        encodeQueryString();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQueryInit, cartState.items]);

  const calCartInfo = (cartState: CartState): JSX.Element => {
    //const qty = Object.values(cartState.items).map( (cartItem: CartItem) => cartItem.qty).reduce( (preQty: number, curQty) => preQty + curQty);
    const qty = Object.values(cartState.items).reduce<number>((preValue, cartItem: CartItem) => { return preValue + cartItem.qty }, 0);
    const totalPrice = Object.values(cartState.items).reduce<number>((preValue, cartItem: CartItem) => preValue + (cartItem.qty * cartItem.price), 0);
    return (
      <React.Fragment>
        <div className=' text-gray-600'>Quantity: {qty}</div>
        <div className='text-2xl font-bold'>Total Price: ${totalPrice}</div>
      </React.Fragment>
    )
  }

  const getProductListSize = (): number => {
    let count = 0;
    products.forEach((productRow: Product[]) => {
      count += productRow.length
    })
    return count;
  }

  const convertProductImage2CDN = (product: Product): Product => {
    const cdnImageProduct = { ...product };
    cdnImageProduct.image = `${process.env.AU_IMAGE_CDN_ENDPOINT}${product.image}`;
    return cdnImageProduct
  }


  return (
    <React.Fragment>
      <Head>
        <title>Goodstify {"au".toUpperCase()}</title>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <ProductItemContext.Provider value={{ openProductItem, setOpenProductItem }}>
        <ProductItem />
      </ProductItemContext.Provider>
      <ShopCartListModalContext.Provider value={{ isOpenCartModal, setIsOpenCartModal }}>
        <ShopCartList cart={Object.values(cartState.items)} />
      </ShopCartListModalContext.Provider>
      <div className={`h-screen` + (isOpenCartModal || openProductItem != null ? ' overflow-hidden' : '')}>
        <div className='w-full border-b'>
          <div className='flex justify-center items-center py-4'>
            <div className='text-2xl font-sans'>Goodstify.{"au"}</div>
          </div>
        </div>
        <div className='container mx-auto' ref={contentRef}>
          <div className='lg:flex md:p-5'>

            <div className='row px-6 lg:min-w-fit lg:pr-12'>
              <div className='text-lg font-semibold'>
                Categories
              </div>
              <ul className='ml-4'>
                <li className='cate-item md:mt-2' onClick={() => setCategorieId("")}>All Product</li>
                <li className='cate-item' onClick={() => setCategorieId("1")} >Levi&apos;s</li>
              </ul>
            </div>

            <div className="row min-h-screen lg:w-full lg:grow">
              {isLoading ?
                <div className="grid grid-cols-2 md:grid-cols-4">
                  {[...Array(4)].map((i: number) => (
                    <div className='card' key={`loading-card-${i}`}>
                      <div className="border h-72 mx-auto">
                        <div className="animate-pulse items-center justify-center">
                          <div className="w-full bg-gray-300 h-40"></div>
                          <div className="flex flex-col space-y-3 p-4">
                            <div className="w-36 md:w-24 bg-gray-300 h-6 rounded-md "></div>
                            <div className="w-16 bg-gray-300 h-6 rounded-md "></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                :
                !isLoading && products.length == 0 ?
                  <div className='text-center w-full p-6'>No Data here now!!!~</div>
                  :
                  <InfiniteScroll
                    dataLength={getProductListSize()}
                    next={async () => {
                      await fetchNextProducts()
                    }}
                    hasMore={(currListProductConnection!.next === null) ? false : true}
                    loader={<div className="grid grid-cols-2 md:grid-cols-4">
                      {[...Array(4)].map((i: number) => (
                        <div className='card' key={`loading-card-${i}`}>
                          <div className="border h-72 mx-auto">
                            <div className="animate-pulse items-center justify-center">
                              <div className="w-full bg-gray-300 h-40"></div>
                              <div className="flex flex-col space-y-3 p-4">
                                <div className="w-36 md:w-24 bg-gray-300 h-6 rounded-md "></div>
                                <div className="w-16 bg-gray-300 h-6 rounded-md "></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>}
                  >

                    {products.map((productRow: Product[], i: number) => {
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4" key={`productRow-${i}`}>
                          {productRow.map((product: Product) => {
                            return (
                              <div className='card' key={product.id}>
                                <div className='max-w-sm'>
                                  <img className='object-cover cursor-pointer' src={`${process.env.AU_IMAGE_CDN_ENDPOINT}${product.image}`} alt={`img-${product.desc}`} onClick={() => setOpenProductItem(convertProductImage2CDN(product))} />
                                </div>
                                <div className="card-content">
                                  <div className="card-title">
                                    {product.name}
                                  </div>
                                  <div className=''>
                                    $ {product.price}
                                  </div>
                                  <div className="card-action">
                                    <button className='btn' onClick={() => addToCart(convertProductImage2CDN(product))}>Add to Cart</button>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                          }
                        </div>
                      )
                    })
                    }
                  </InfiniteScroll>
              }
            </div>
          </div>
        </div>

        {Object.keys(cartState.items).length > 0 ?
          <div className='fixed bottom-0 border border-b w-full bt-4 pb-6 lg:py-2 px-6 bg-white' ref={checkoutRef}>
            <div className='container mx-auto px-0 md:px-16 lg:flex '>
              <div className='my-3 w-full'>
                {calCartInfo(cartState)}
              </div>
              <div className='w-full lg:place-self-center lg:text-right'>
                <button className={`btn p-3 rounded-md w-full lg:w-6/12` + (isOpenCartModal ? ' hidden' : '')} onClick={() => setIsOpenCartModal(true)}>View Cart</button>
              </div>
            </div>
          </div>
          : <></>}
      </div>
    </React.Fragment>
  )
}

export default AUPage;
