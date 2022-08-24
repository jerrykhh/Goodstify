import { DynamoDB } from 'aws-sdk';

interface GetProps {
    queryStringParameters: {
        sortId: string,
        ids: string,
        country: string,
        next: string
    }
    }


const dynamodb = new DynamoDB({
    apiVersion: '2012-08-10'
})

exports.handler = async (event: GetProps) => {

    if (event.queryStringParameters.sortId && event.queryStringParameters.sortId !== "") {

        const params: DynamoDB.QueryInput = {
            TableName: `${process.env.PRODUCT_TABLE}`,
            KeyConditionExpression: "sortId = :sortId",
            FilterExpression: "display = :display AND country = :country",
            ExpressionAttributeValues: {
                ":sortId": {
                    S: event.queryStringParameters.sortId
                },
                ":display": {
                    BOOL: true
                },
                ":country": {
                    S: event.queryStringParameters.country
                }
            },
            Limit: 48
        };

        if(event.queryStringParameters.next)
            params.ExclusiveStartKey = JSON.parse(Buffer.from(event.queryStringParameters.next, 'base64').toString());

        const data = (await dynamodb.query(params).promise());
        const result = {
            items: data.Items?.map(obj => DynamoDB.Converter.unmarshall(obj)),
            count: data.Count,
            next: (data.LastEvaluatedKey)? Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString('base64'): null
        }
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(result)
        }

    } else {
        const params: DynamoDB.ScanInput = {
            TableName: `${process.env.PRODUCT_TABLE}`,
            FilterExpression: "display = :display AND country = :country",
            ExpressionAttributeValues: {
                ":display": {
                    BOOL: true
                },
                ":country": {
                    S: event.queryStringParameters.country
                }
            },
            Limit: 48
        }

        if(event.queryStringParameters.next)
            params.ExclusiveStartKey = JSON.parse(Buffer.from(event.queryStringParameters.next, 'base64').toString());
        

        const data = (await dynamodb.scan(params).promise());

        const result = {
            items: data.Items?.map(obj => DynamoDB.Converter.unmarshall(obj)),
            count: data.Count,
            next: (data.LastEvaluatedKey)? Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString('base64'): null
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(result)
        }
    }


}