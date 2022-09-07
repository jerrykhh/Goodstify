import { useState } from "react";
import ShopPage from "../components/shopPage";


const JPPage = () => {

    const [categorieId, setCategorieId] = useState<string|null>(null);

    return <ShopPage 
                countryCode="jp"
                igName="goodstify_jp"
                icon="/jp-icon.ico"
                categorieId={categorieId}
                categories={ <ul className='ml-4'>
                <li className='cate-item md:mt-2' onClick={() => setCategorieId("")}>All Product</li>
                <li className='cate-item' onClick={() => setCategorieId("1")} >Other</li>
              </ul>}
                imageCDN_endPoint={`${process.env!.JP_IMAGE_CDN_ENDPOINT}`}
              />

}


export default JPPage;