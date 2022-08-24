export interface ProductFilters {
    [key: string]: Array<ProductFilter>
}

export interface ProductFilter {
    id: string,
    name: string
}