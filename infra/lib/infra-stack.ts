import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const prodctTable = new dynamodb.Table(this, "ProductTable", {
      tableName: 'goodstify-products',
      partitionKey: {
        name: "sortId",
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 8,
      writeCapacity: 4
    });

    prodctTable.autoScaleReadCapacity({
      minCapacity: 4,
      maxCapacity: 8
    });

    prodctTable.autoScaleWriteCapacity({
      minCapacity: 1,
      maxCapacity: 4
    });

    const webBucket = new s3.Bucket(this, 'webBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const cdn = new cloudfront.Distribution(this, "StorageCDN", {
      defaultBehavior: {
        origin: new origins.S3Origin(webBucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN
      }
    });

    new cdk.CfnOutput(this, "StorageCDNDomainName", {
      value: cdn.domainName
    })
    new cdk.CfnOutput(this, "StorageCDNDistributionDomainName", {
      value: cdn.distributionDomainName
    })

    const listProductsLambda = new lambda.Function(this, "listProductsLambda", {
      functionName: "Goodstify-listProduct",
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("./func/products/listProduct/"),
      handler: "index.handler",
      environment: {
        PRODUCT_TABLE: prodctTable.tableName
      },
    });

    prodctTable.grantReadData(listProductsLambda);
    
    const batchProductLambda = new lambda.Function(this, 'batchProductsLambda', {
      functionName: "Goodstify-batchProduct",
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("./func/products/batchProduct/"),
      handler: "index.handler",
      environment: {
        PRODUCT_TABLE: prodctTable.tableName
      },
    })
    
    prodctTable.grant(batchProductLambda, "dynamodb:BatchGetItem");


    const apiEndpoint = new apigateway.RestApi(this, 'static-web-api', {
      endpointTypes: [apigateway.EndpointType.REGIONAL]
    })

    const products = apiEndpoint.root.addResource('products');
    products.addCorsPreflight({
      allowOrigins: ['http://localhost:3000', 'http://192.168.1.206:3000', "http://192.168.1.206:3000"],
      allowHeaders: Cors.DEFAULT_HEADERS.concat(['x-api-key']),
      allowMethods: ['OPTIONS', 'GET', 'POST'],
      allowCredentials: true,
    })

    products.addMethod('GET', new apigateway.LambdaIntegration(listProductsLambda, {
      proxy: true,
      // passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
      // // integrationResponses: [{
      //   statusCode: "200",
      //   contentHandling: apigateway.ContentHandling.CONVERT_TO_TEXT,
      //   responseParameters: {
      //     'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
      //     'method.response.header.Access-Control-Allow-Origin': "'*'",
      //     'method.response.header.Access-Control-Allow-Credentials': "'false'",
      //     'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      // },
      // }],
      // requestTemplates: {
      //   "application/json": '{"sortId": "$input.params(\'sortId\')","country": "$input.params(\'country\')"},"next": "$input.params(\'next\')"}'
      // },
      requestParameters: {
        "integration.request.querystring.sortId" : "method.request.querystring.sortId",
        "integration.request.querystring.country" : "method.request.querystring.country",
        "integration.request.querystring.next" : "method.request.querystring.next",
      },
    }), {
      // methodResponses: [{
      //   statusCode: "200",
      //   responseParameters: {
      //     'method.response.header.Access-Control-Allow-Headers': true,
      //     'method.response.header.Access-Control-Allow-Methods': true,
      //     'method.response.header.Access-Control-Allow-Credentials': true,
      //     'method.response.header.Access-Control-Allow-Origin': true,
      // },  
      // }],
      requestParameters: {
        "method.request.querystring.sortId" : false,
        "method.request.querystring.country" : true,
        "method.request.querystring.next" : false,
      },
    });


    products.addMethod("POST", new apigateway.LambdaIntegration(batchProductLambda, {
      proxy: true,
      // integrationResponses: [{
      //   statusCode: "200",
      //   contentHandling: apigateway.ContentHandling.CONVERT_TO_TEXT
      // }]
    }), {
      
      // methodResponses: [{
      //   statusCode: "200",
      //   responseModels: { "application/json": apigateway.Model.EMPTY_MODEL }
      // }],
      
    })

    // products.addCorsPreflight({
    //   allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
    //   allowMethods: ['OPTIONS', 'GET', 'POST'],
    //   allowCredentials: true,
    //   allowOrigins: ['http://localhost:3000'],
    // });


    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'InfraQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
