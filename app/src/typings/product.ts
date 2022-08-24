export interface Product {
    sortId: string;
    id: string;
    name: string;
    price: number;
    image: string;
    desc: string;
    display: boolean;
}

export interface listProductConnection {
    items: Product[],
    count: number,
    next: string|null
}
