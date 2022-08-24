import { DynamoDB } from 'aws-sdk';

interface PostProps {

    body: string

}

const dynamodb = new DynamoDB({
    apiVersion: '2012-08-10'
})


exports.handler = async (event: PostProps) => {

    console.log(event);
    const products: {[k:string]:string} = JSON.parse(event.body);

    try {
        const batchGetItemArray: DynamoDB.KeyList = [];

        Object.keys(products).forEach( (sortId: string) => {

            const uniqProducts = [...new Set(products[sortId])];
            uniqProducts.forEach( (productId: string) => {

                batchGetItemArray.push({
                    "sortId":{
                        S: sortId
                    },
                    "id": {
                        S: productId
                    }
                })
            })
        });

        const params: DynamoDB.BatchGetItemInput = {
            RequestItems: {
                "goodstify-products": {
                    Keys: batchGetItemArray
                }
            }
        };

        const data = (await dynamodb.batchGetItem(params).promise());
        console.log(data);
        return {
            
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(data.Responses!["goodstify-products"].map((obj) => DynamoDB.Converter.unmarshall(obj)))
        
        }
    }catch (e){
        return {msg: `Failed ${e}`};
    
    }



}