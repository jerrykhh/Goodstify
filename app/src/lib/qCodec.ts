import { json } from "stream/consumers";
import { CartState } from "../contexts/cart/cart";
import { CartItem } from "../typings/cart";
import { Product } from "../typings/product";

export const qDecoder = async (q: string) => {

    //console.log("qde", window.atob(q));

    const res = await fetch(`${process.env.API_END_POINT}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: window.atob(q)
    });

    const data = await res.json();
    //console.log(data);
    return data;

}

export const converCartItemQty = (q: string) => {
    const hashedProduct: { [k: string]: string[] } = JSON.parse(window.atob(q));
    // {
    //     "id": ["id", "id"]
    // }
    // {
    //      "id": "id": qty
    // }
    const productsQty: { [k: string]: { [k: string]: number } } = {};
    Object.keys(hashedProduct).forEach((sortId) => {
        if (!productsQty[sortId]){
            productsQty[sortId] = {};
        }

        for (const id of hashedProduct[sortId]) {
            console.log(productsQty[sortId][id])
            if (!productsQty[sortId][id])
                productsQty[sortId][id] = 1;
            else
                productsQty[sortId][id]+=1;
        }
    })

    return productsQty;
}

interface HashCart {
    [key: string]: string[]
}

export const qEncoder = (cartState: CartState): string => {

    const cartStateItem = { ...cartState.items };
    const cart: HashCart = {};

    //console.log("cartStateItem", cartStateItem)

    Object.values(cartStateItem).map((cartItem: CartItem) => {
        if (!cart[cartItem.sortId])
            cart[cartItem.sortId] = [];
        [...Array(cartItem.qty)].forEach(() => {
            cart[cartItem.sortId].push(cartItem.id);
        })
    })

    // Object.values(cartStateItem).map((cartItem: CartItem) => {
    //     [...Array(cartItem.qty)].forEach(() => {
    //         cart.push(cartItem.id);
    //     });
    // })

    //console.log("cart", cart);
    return window.btoa(JSON.stringify(cart));
}
