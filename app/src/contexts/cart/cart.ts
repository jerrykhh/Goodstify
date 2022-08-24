import { useReducer, createContext } from "react";
import { CartItem } from "../../typings/cart";
import { Product } from "../../typings/product";

export enum CartAction {
    ADD_ITEM,
    REMOVE_ITEM,
    CLEAR
}

export interface CartStateAction {
    type: CartAction;
    playeload: Product;
}

export interface CartState {
    items: { [key: string]: CartItem};
}

export const initCartState: CartState = {
    items: {}
}

const cartReducer = (state: CartState, action: CartStateAction ) => {
    const item = action.playeload as CartItem;
    const items = {...state.items};
    switch(action.type) {
        case CartAction.ADD_ITEM:

            if (items[item.id]){

                const cartItem = {...items[item.id]};
                cartItem.qty++;
                items[item.id] = cartItem;
            }else{
                item.qty = 1;
                items[item.id] = item;
            }
            console.log("return", items)
            return {...state, items};
        
        case CartAction.REMOVE_ITEM:

            if (item.id in items){
                if(items[item.id].qty <= 1){
                    delete items[item.id];
                    if(Object.keys(items).length === 0)
                    return {...state, items: {}};
                }else{
                    const cartItem = {...items[item.id]}
                    cartItem.qty--;
                    items[item.id] = cartItem;
                }
            }
            return {...state, items};
        
        default:
            return state;
    }
}

export const useCartReducer = () => {
    return useReducer(cartReducer, initCartState);
}


interface IShopCartListModalProps {
    isOpenCartModal: boolean,
    setIsOpenCartModal: React.Dispatch<React.SetStateAction<boolean>>
}

export const ShopCartListModalContext = createContext<IShopCartListModalProps>({
    isOpenCartModal: false,
    setIsOpenCartModal: () => {}
});


export interface ICartContextProps {
    cartState: CartState,
    cartDispatch: React.Dispatch<CartStateAction>
}

const CartContext = createContext<ICartContextProps>({
    cartState: initCartState,
    cartDispatch: () => {}
})

export default CartContext;