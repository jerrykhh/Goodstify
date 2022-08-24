import { listProductConnection, Product } from "../typings/product"

export const listProduct = async (queryString: { [key: string]: string }) => {

    let reqQueryString = "";
    Object.keys(queryString).forEach((params, i) => {
        if (queryString[params] !== "" && queryString[params] !== null) {
            reqQueryString += `${params}=${queryString[params]}`
            if (i < Object.keys(queryString).length - 1)
                reqQueryString += "&"
        }
    })

    console.log(process.env.API_END_POINT)
    const res = await fetch(`${process.env.API_END_POINT}/products?${reqQueryString}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await res.json();
    return data;
}