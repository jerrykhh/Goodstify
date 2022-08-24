/* eslint-disable @next/next/no-img-element */
import { useContext } from "react";
import { ProductItemContext } from "../contexts/cart/productItem";
import { Product } from "../typings/product";

const ProductItem = (): JSX.Element => {

    const { openProductItem, setOpenProductItem } = useContext(ProductItemContext);

    return (
        !openProductItem ?
            <></>
            :
            <div className="w-full h-screen flex fixed bg-black bg-opacity-70">
                <div className="container mx-auto p-8 self-center">
                    <div className="text-right mr-4 mb-6">
                        <button className="text-4xl text-white" onClick={() => setOpenProductItem(null)}>X</button>
                    </div>
                    <div className="bg-white rounded-md flex flex-col lg:flex-row">
                        <img src={openProductItem.image} alt={openProductItem.desc} className=" lg:max-w-2xl object-contain rounded-none lg:rounded-l-md" />
                        <div className="p-8 space-y-2 py-7">
                            <div className="text-2xl font-bold">{openProductItem.name}</div>
                            <div className="text-base text-gray-500">$ {openProductItem.price}</div>
                            <p className="item-content">
                                Description: <br/>
                                {openProductItem.desc}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default ProductItem