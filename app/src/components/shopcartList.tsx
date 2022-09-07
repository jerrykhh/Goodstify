/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React, { useContext, useEffect, useRef, useState } from "react";
import CartContext, { CartAction, ShopCartListModalContext } from "../contexts/cart/cart";
import { copy2Clipboard } from "../lib/util";
import { CartItem } from "../typings/cart";

interface ShopCartListProps {
    igName: string
    countryCode: string,
    cart: CartItem[]
}

const ShopCartList = ({ igName, countryCode, cart }: ShopCartListProps): JSX.Element => {

    const { isOpenCartModal, setIsOpenCartModal } = useContext(ShopCartListModalContext);
    const { cartState, cartDispatch } = useContext(CartContext);

    const btnCopyRef = useRef<HTMLButtonElement | null>(null);

    const copy = () => {
        btnCopyRef.current!.innerText = "Copied";


        copy2Clipboard(window.location.href.replace(`/${countryCode}?`, `/${countryCode}.html?`));
        setTimeout(() => {
            btnCopyRef.current!.innerText = "Copy";
        }, 3000)

    }

    return (
        !isOpenCartModal ?
            <React.Fragment></React.Fragment>
            :
            <div className="w-full h-full min-h-screen fixed top-0 left-0 bg-white scroll-m-0 overflow-x-hidden overflow-y-auto z-10">

                <div className={`container mx-auto p-8 min-h-screen h-fit` + ((cart.length > 3) ? 'mb-[420px]' : '')}>

                    <div className="text-right">
                        <button className="text-4xl text-gray-500" onClick={() => setIsOpenCartModal(false)}>X</button>
                    </div>
                    <div className="p-4 mt-4 md:mt-0 h-full">
                        {Object.keys(cart).length === 0 ?
                            <div className="mt-12">
                                <div className="text-center">Cart is Empty.</div>
                            </div>
                            :
                            cart.map((cartItem: CartItem, i: number) => {
                                return (
                                    <div className="flex items-center my-4" key={i}>
                                        <img src={cartItem.image} className="w-36 h-36 object-scale-down" alt={cartItem.desc} />

                                        <div className="w-full space-y-1">
                                            <div className="font-bold text-xl">{cartItem.name}</div>
                                            <div className="text-lg">$ {cartItem.price}</div>
                                        </div>
                                        <div className="action flex-row items-center md:flex">
                                            <button className="bg-black text-white px-4 py-2" onClick={() => cartDispatch({
                                                type: CartAction.ADD_ITEM,
                                                playeload: cartItem
                                            })}>+</button>
                                            <div className="p-4 w-12">{cartItem.qty}</div>
                                            <button className="bg-black text-white px-4 py-2" onClick={() => cartDispatch({
                                                type: CartAction.REMOVE_ITEM,
                                                playeload: cartItem
                                            })}>-</button>
                                        </div>
                                    </div>
                                )
                            })
                        }
                        <div className="mt-20">
                            <div className="text-center mb-80">
                                <p>Please copy blew url and send it to us (Instagram): <a href={`https://www.instagram.com/${igName}/`} target="_blank" rel="noopener noreferrer"><span className="text-blue-500 cursor-pointer">@{igName}</span></a></p>
                                <div className="mt-8 md:flex justify-center md:space-y-0 space-y-4">
                                    <input className="p-2 border w-full md:w-4/12 text-gray-500" type="text" value={window.location.href} disabled />
                                    <button className="btn w-full md:w-fit md:ml-4" onClick={() => copy()} ref={btnCopyRef}>Copy</button>
                                </div>
                                <div className="mt-16 text-justify space-y-6">
                                    <p className="text-gray-400 text-sm">
                                        <div className="my-2">You confirm that you have carefully read and agreed tothe items listed in these Terms and Conditions:</div>
                                        <div className="my-2">1. The price of products or serviceslisted on this page is calculated based on the price displayed on the page. We will try our best to ensure that all the prices displayed on the Website arethe most updated. However, the Company reserves the right to change the priceat any time without further notice to anyone.</div>
                                        <div className="my-2">2. The Company reserves the rightof final interpretation of all content, terms and conditions, privacy regulations or other text issued by the Company on this page. The Company reserves the right to amend, change or revise these Terms and Conditions at anytime without prior notice and have the final decision in case of any dispute.</div>

                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
    )

}

export default ShopCartList;