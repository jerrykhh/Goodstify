import { createContext } from "react";
import { Product } from "../../typings/product";

export interface IProductItemProps {
    openProductItem: Product|null,
    setOpenProductItem: React.Dispatch<React.SetStateAction<Product|null>>
}

export const ProductItemContext = createContext<IProductItemProps>({
    openProductItem: null,
    setOpenProductItem: () => {}
});