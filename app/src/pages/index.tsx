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

// interface HomePageProps {
//   products2dMatrix: Array<Product[]>;
// }


const Home: NextPage = () => {

  const router = useRouter();
  const { q } = router.query;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpenCartModal, setIsOpenCartModal] = useState<boolean>(false);

  const [openProductItem, setOpenProductItem] = useState<Product | null>(null);
  const [products, setProducts] = useState<Array<Array<Product>>>([[]]);
  const [categorieId, setCategorieId] = useState<String|null>(null);
  const [currListProductConnection, setCurrListProductConnection] = useState<listProductConnection | null>(null);


  const { cartState, cartDispatch } = useContext(CartContext);

  // ref
  const contentRef = useRef<HTMLDivElement | null>(null);
  const checkoutRef = useRef<HTMLDivElement | null>(null);

  const fetchProducts = async (query: { [k: string]: any }) => {
    
    const productConnection: listProductConnection = await listProduct(query);

    if (productConnection.count > 0) {
      
      const tempProducts = (query['next'])? [...products]: [[]];
      // const tempProducts: Array<Array<Product>> = [...products];
      console.log(tempProducts)
      do {
        console.log("product.length",tempProducts.length )
        if (tempProducts[tempProducts.length - 1].length > 3)
          tempProducts.push([]);
        tempProducts[tempProducts.length - 1].push(productConnection.items.shift() as Product);
      } while (productConnection.items.length > 0)
      setProducts(tempProducts);

    }
    setCurrListProductConnection(productConnection);
  }


  const fetchNextProducts = async (query: { [k: string]: any }) => {

    if (!query["next"] && currListProductConnection !== null && currListProductConnection.next !== null)
      query["next"] = currListProductConnection.next;
    
    fetchProducts(query);
    
  }

  const unHashQueryProducts = async () => {
    const qProducts: Array<Product> = await qDecoder(q as string);
    const productQty = converCartItemQty(q as string);

    qProducts.forEach((product: Product) => {
      let qty: number = 1;
      if (productQty[product.sortId][product.id])
        qty = productQty[product.sortId][product.id];

      [...new Array(qty)].forEach(() => {
        cartDispatch({
          type: CartAction.ADD_ITEM,
          playeload: product
        });
      })

    })
  }

  const clearProductFetch = async () => {
    setCurrListProductConnection(null);
    setProducts([...[...[]]]);
  }

  useEffect(() => {

    fetchProducts({
      "country": "au"
    }).then(() => {
      setIsLoading(false);
    })

  }, []);

  useEffect( () => {

    if(categorieId !== null)
      fetchProducts({
        "country": "au",
        "sortId": categorieId
      });
  
  }, [categorieId]);

  useEffect(() => {

    if (!router.isReady) return;
    console.log('q', q);
    if (q && q !== "" && q !== null)
      unHashQueryProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])


  useEffect(() => {

    encodeQueryString();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartState.items]);

  useLayoutEffect(() => {
    if (Object.keys(cartState.items).length > 0) {
      const contentEleHeight = contentRef.current!.clientHeight;
      const checkOutEleHeight = checkoutRef.current!.clientHeight;
      contentRef.current!.style.height = `${contentEleHeight + checkOutEleHeight}px`;
    } else {
      contentRef.current!.style.removeProperty('height');
    }
  }, [cartState.items])

  const addToCart = (product: Product) => {
    cartDispatch({
      type: CartAction.ADD_ITEM,
      playeload: product
    });
    //encodeQueryString(product);
    //updateLayout();
  }

  const encodeQueryString = () => {
    const encoded = qEncoder(cartState);
    if (encoded === "" || Object.keys(cartState.items).length === 0)
      router.push(`/`, undefined, { shallow: true })
    else
      router.push(`/?q=${encoded}`, undefined, { shallow: true });
  }


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

  // const [ productCart, setProductCart] = useState<Product| null>(null);
  // const [ filterId, setFilterId] = useState<String| null>(null);

  return (
    <React.Fragment>
      <ProductItemContext.Provider value={{ openProductItem, setOpenProductItem }}>
        <ProductItem />
      </ProductItemContext.Provider>
      <ShopCartListModalContext.Provider value={{ isOpenCartModal, setIsOpenCartModal }}>
        <ShopCartList cart={Object.values(cartState.items)} />
      </ShopCartListModalContext.Provider>
      <div className={`h-screen` + (isOpenCartModal || openProductItem != null ? ' overflow-hidden' : '')}>
        <div className='w-full border-b'>
          <div className='flex justify-center items-center py-4'>
            <div className='text-2xl font-sans'>Goodstify</div>
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
                isLoading && products.length == 0 ?
                  <div className='text-center w-full p-6'>No Data here now!!!~</div>
                  :
                  products.map((productRow: Product[], i: number) => {
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4" key={`productRow-${i}`}>
                        {productRow.map((product: Product) => {
                          return (
                            <div className='card' key={product.id}>
                              <div className='max-w-sm'>
                                <img className='object-cover' src={`${process.env.AU_IMAGE_CDN_ENDPOINT}${product.image}`} alt={`img-${product.desc}`} onClick={() => setOpenProductItem(product)} />
                              </div>
                              <div className="card-content">
                                <div className="card-title">
                                  {product.name}
                                </div>
                                <div className=''>
                                  $ {product.price}
                                </div>
                                <div className="card-action">
                                  <button className='btn' onClick={() => addToCart(product)}>Add to Cart</button>
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

// export const getStaticProps = async (context: GetStaticPropsContext) => {
//   // const res: Product[] = [
//   //   {
//   //     sortId: "sortId1",
//   //     id: "dasikofpasfpasdf1",
//   //     name: "product-name1product-name1product-name1product-name1product-name1product-name1product-name1",
//   //     price: 3000,
//   //     image: "https://media.istockphoto.com/photos/skin-and-hair-care-beauty-product-mockup-lotion-bottle-oil-cream-on-picture-id1198863709?k=20&m=1198863709&s=612x612&w=0&h=fIKFkMvxGYvKW1ZjUc-QZDJqRaYnrr2UeUh91ItPfog=",
//   //     des: "I go to school by busI go to school by busI go to school by busI go to school by busI go to school by busI go to school by busI go to school by busI go to school by busI go to school by busI go to school by busI go to school by busI go to school by busI go to school by busI go to school by bus",
//   //     display: true
//   //   },
//   //   {
//   //     sortId: "sortId1",
//   //     id: "dasikofpasfpasdf2",
//   //     name: "product-name1",
//   //     price: 3000,
//   //     image: "https://media.istockphoto.com/photos/skin-and-hair-care-beauty-product-mockup-lotion-bottle-oil-cream-on-picture-id1198863709?k=20&m=1198863709&s=612x612&w=0&h=fIKFkMvxGYvKW1ZjUc-QZDJqRaYnrr2UeUh91ItPfog=",
//   //     des: "I go to school by bus",
//   //     display: true
//   //   },
//   //   {
//   //     sortId: "sortId1",
//   //     id: "dasikofpasfpasdf3",
//   //     name: "product-name1",
//   //     price: 3000,
//   //     image: "https://media.istockphoto.com/photos/skin-and-hair-care-beauty-product-mockup-lotion-bottle-oil-cream-on-picture-id1198863709?k=20&m=1198863709&s=612x612&w=0&h=fIKFkMvxGYvKW1ZjUc-QZDJqRaYnrr2UeUh91ItPfog=",
//   //     des: "I go to school by bus",
//   //     display: true
//   //   },
//   //   {
//   //     sortId: "sortId1",
//   //     id: "dasikofpasfpasdf4",
//   //     name: "product-name1",
//   //     price: 3000,
//   //     image: "https://media.istockphoto.com/photos/skin-and-hair-care-beauty-product-mockup-lotion-bottle-oil-cream-on-picture-id1198863709?k=20&m=1198863709&s=612x612&w=0&h=fIKFkMvxGYvKW1ZjUc-QZDJqRaYnrr2UeUh91ItPfog=",
//   //     des: "I go to school by bus",
//   //     display: true
//   //   },
//   //   {
//   //     sortId: "sortId1",
//   //     id: "dasikofpasfpasdf5",
//   //     name: "product-name1",
//   //     price: 3000,
//   //     image: "https://media.istockphoto.com/photos/skin-and-hair-care-beauty-product-mockup-lotion-bottle-oil-cream-on-picture-id1198863709?k=20&m=1198863709&s=612x612&w=0&h=fIKFkMvxGYvKW1ZjUc-QZDJqRaYnrr2UeUh91ItPfog=",
//   //     des: "I go to school by bus",
//   //     display: true
//   //   }
//   // ];

//   let products2dMatrix = [];

//   while (res.length)
//     products2dMatrix.push(res.splice(0, 4));

//   return {
//     props: {
//       products2dMatrix
//     }
//   }
// }

export default Home
