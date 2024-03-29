import { useState } from "react";
import ShopPage from "../components/shopPage";


const AUPage = () => {

    const [categorieId, setCategorieId] = useState<string|null>(null);

    return <ShopPage 
                countryCode="au"
                igName="goodstify_au"
                icon="/au-icon.ico"
                categorieId={categorieId}
                categories={ <ul className='ml-4'>
                <li className='cate-item md:mt-2' onClick={() => setCategorieId("")}>All Product</li>
                <li className='cate-item' onClick={() => setCategorieId("2")} >Supplement</li>
              </ul>}
                imageCDN_endPoint={`${process.env!.AU_IMAGE_CDN_ENDPOINT}`}
              />

}


export default AUPage;