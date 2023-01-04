# Goodstify App and IaC

## Description
I trying to launch new business about the purchasing agent in Hong Kong but I am a student not many budget. In addition, Im not sure the market in Hong Kong is workable or not. Therefore, I build  the simple prototype to understand  the demand of the market. Moreover, the Serverless architecture using the AWS Cloud is proposed to avoid high development and operation cost. As the same time, I know many Instagram Store in Hong Kong but their don't have own webpage to show their product. Instagram grid is not user friendly for showing the product such as the old-date post. Also, their business like a startup the budget may not cover the expensive online store platform such as Shopline, Shopify, etc. As a result, I can transform the business to help them to build the own page if not successful for my purchasing business.

## Phase 1

> Current

I builded the prototype which is a static website, and fetch data via async to update showing product but it did not included the checkout function. index of the web app will be a linktree for redirect to product page or own social media page, etc. Furthermore, the URL will update when the user add the product to cart.

For Example:

```
goodstify.com/?q={encoded_cart_data}
goodstify.com/?q=adgsfodmbviom1easfsdfasffdfoikfgpe
```

Customer can send the above Link to Seller. The Seller can know what is customer wanted.

DEMO Video (app): [ Click Here (Youtube) ](https://youtu.be/3yp9DX_hEPw) 
DEMO Video (AWS DynamoDB + app)(Cantonese): [ Click Here (Youtube) ](https://youtu.be/GR282M8QwwI)

### Directory 

```
/app    Next.js 12 App
/infra  Infrastructure As Code (IaC) using AWS CDK
```

### System Architecture
![image](resource/arch.jpg)

## Phase 2
Simple Admin Portal for CRUD the product. when the user build the infrastructure using the /infra code will generate the two key for access the Admin Protal. The Lambda Func (backend) will decrypt the key when CURD the product in Admin portal. Morever, Seller can send the payment link to user.