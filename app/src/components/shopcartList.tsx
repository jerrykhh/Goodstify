/* eslint-disable @next/next/no-img-element */
import React, { useContext, useEffect, useState } from "react";
import CartContext, { CartAction, ShopCartListModalContext } from "../contexts/cart/cart";
import { CartItem } from "../typings/cart";

interface ShopCartListProps {
    cart: CartItem[]
}

const ShopCartList = ({ cart }: ShopCartListProps): JSX.Element => {

    const { isOpenCartModal, setIsOpenCartModal } = useContext(ShopCartListModalContext);
    const { cartState, cartDispatch } = useContext(CartContext);

    return (
        !isOpenCartModal ?
            <React.Fragment></React.Fragment>
            :
            <div className="w-full h-full fixed top-0 left-0 bg-white scroll-m-0 overflow-hidden">

                <div className="container mx-auto p-8 h-full">

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
                                <div className="flex items-center space-x-4" key={i}>
                                    <img src={cartItem.image} className="w-36 h-36 object-scale-down" alt={cartItem.desc} />

                                    <div className="w-full space-y-[0.5]">
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
                    </div>
                </div>
            </div>
    )

}

export default ShopCartList;