get api list
[
{
name: "api/category",
schemaName: "GetCategoryParams",

        types: {
            parentId: string|null;
        }
    },
    {
        name: "api/config",
        schemaName: "GetConfigParams",

    },
    {
        name: "api/customer/{id}",
        schemaName: "GetCustomerParams",

        types: {
            id: string;
        }
    },
    {
        name: "api/customer/vat/{vatNumber}",
        schemaName: "GetCustomerVatParams",

        types: {
            vatNumber: string;
        }
    },
    {
        name: "api/customer/{id}/orders",
        schemaName: "GetCustomerOrdersParams",

        types: {
            id: string;
        }
    },
    {
        name: "api/feed/google/{country}/{language}",
        schemaName: "GetGoogleFeedParams",

        types: {
            country: string;
            language: string;
        }
    },
    {
        name: "api/garage",
        schemaName: "GetGarageParams",
        type: "get"
    },
    {
        name: "api/garage/{id}",
        schemaName: "GetGarageItemParams",

        types: {
            id: string;
        }
    },
    {
        name: "api/iplookup/{ip}",
        schemaName: "GetIpLookupParams",

        types: {
            ip: string;
        }
    },
    {
        name: "api/makemodeltype/{id}",
        schemaName: "GetMakeModelTypeParams",

        types: {
            id: string;
        }
    },
    {
        name: "api/makemodeltype/part/{id}",
        schemaName: "GetMakeModelTypePartParams",

        types: {
            id: string;
        }
    },
    {
        name: "api/makemodeltype/{id}/check/{partId}",
        schemaName: "CheckMakeModelTypeCompatibilityParams",

        types: {
            id: string;
            partId: string;
        }
    },
    {
        name: "api/makemodeltype/brands",
        schemaName: "GetMakeModelTypeBrandsParams",
        type: "get"
    },
    {
        name: "api/makemodeltype/models/{mmtId}",
        schemaName: "GetMakeModelTypeModelsParams",

        types: {
            mmtId: string;
        }
    },
    {
        name: "api/makemodeltype/types/{mmtId}",
        schemaName: "GetMakeModelTypeTypesParams",

        types: {
            mmtId: string;
            year: number | null;
        }
    },
    {
        name: "api/makemodeltype/engines/{mmtId}",
        schemaName: "GetMakeModelTypeEnginesParams",

        types: {
            mmtId: string;
            year: number | null;
        }
    },
    {
        name: "api/makemodeltype/years/{mmtId}",
        schemaName: "GetMakeModelTypeYearsParams",

        types: {
            mmtId: string;
        }
    },
    {
        name: "api/makemodeltype/trims/{mmtId}",
        schemaName: "GetMakeModelTypeTrimsParams",

        types: {
            mmtId: string;
        }
    },
    {
        name: "api/manufacturer",
        schemaName: "GetManufacturerParams",
        type: "get"
    },
    {
        name: "api/order/{orderId}",
        schemaName: "GetOrderParams",

        types: {
            orderId: string;
            customerId: string | null;
            checkStatus: boolean;
        }
    },
    {
        name: "api/order/{orderId}/{email}",
        schemaName: "GetOrderWithEmailParams",

        types: {
            orderId: string;
            email: string;
            customerId: string | null;
            checkStatus: boolean;
        }
    },
    {
        name: "api/order",
        schemaName: "GetOrdersParams",

        types: {
            CustomerId: string;
            Email: string;
            ExcludeStatus: OrderStatus[];
            IncludeStatus: OrderStatus[];
            StoreId: string;
            Search: string;
            Take: number;
            ContinuationToken: string;
        }
    },
    {
        name: "api/order/{orderId}/invoice",
        schemaName: "GetOrderInvoiceParams",

        types: {
            orderId: string;
        }
    },
    {
        name: "api/parts/{id}",
        schemaName: "GetPartParams",

        types: {
            id: string;
        }
    },
    {
        name: "api/parts/oeref/{input}",
        schemaName: "GetPartOeRefParams",

        types: {
            input: string;
        }
    },
    {
        name: "api/parts/exportcsv/{lang}",
        schemaName: "ExportPartsCsvParams",

        types: {
            lang: string;
        }
    },
    {
        name: "api/ping",
        schemaName: "GetPingParams",
        type: "get"
    },
    {
        name: "api/profile",
        schemaName: "GetProfileParams",
        type: "get"
    },
    {
        name: "api/profile/savedsearches",
        schemaName: "GetSavedSearchesParams",

        types: {
            mmtId: string | null;
        }
    },
    {
        name: "api/profile/vat/{vatNumber}",
        schemaName: "GetProfileVatParams",

        types: {
            vatNumber: string;
        }
    },
    {
        name: "api/proxy/{catchAll}",
        schemaName: "GetProxyParams",

        types: {
            catchAll: string;
        }
    },
    {
        name: "api/return/{id}",
        schemaName: "GetReturnParams",

        types: {
            id: string;
            createNew: boolean;
        }
    },
    {
        name: "api/return/{id}/{email}",
        schemaName: "GetReturnWithEmailParams",

        types: {
            id: string;
            email: string;
            createNew: boolean;
        }
    },
    {
        name: "api/return",
        schemaName: "GetCreditNoteParams",

        types: {
            id: string;
        }
    },
    {
        name: "api/stock/{id}",
        schemaName: "GetStockParams",

        types: {
            id: string;
        }
    },
    {
        name: "api/translations/{lang}",
        schemaName: "GetTranslationsParams",

        types: {
            lang: string;
        }
    },
    {
        name: "api/vin/{vin}",
        schemaName: "GetVinParams",

        types: {
            vin: string;
        }
    },

],
Post api list
[
{
name: "api/customer",
schemaName: "PostCustomerParams",
types: {
email: string; // required, unique email

firstName?: string | null;
lastName?: string | null;
middleName?: string | null;
initials?: string | null;

phoneNumber?: string | null;
picture?: string | null;

lang?: string | null;

hasLoggedIn?: boolean | null;
marketingConsent?: boolean;

id?: string | null;

vatNumber?: string | null; // required for B2C clients
addresses:CustomerAddress[]| null;
businessAccount?: boolean | null;
companyName?: string | null;
},

    },
    {
        name: "api/Garage",
        schemaName: "PostGarageParams",
        types: {
           id?: string | null;

name?: string | null; // custom car name

year?: number | null; // int32

picture?: string | null;

vin?: string | null;

makeModelTypeId?: string | null;

isFavorite?: boolean;
isNew?: boolean;

lastUsed?: string | null;

        }
    },
    {
        name: "api/MakeModelType"
        schemaName: "PostMakeModelTypeParams",
        types: {
           makeModelTypeId?: string | null;

name?: string | null;
year?: number | null; // int32
}
},
{
name: "api/Order/Calculate"
schemaName: "PostOrderParams",
types: {
id?: string | null;

customer?: CustomerModel | null;

billing: CustomerAddress;
shipping: CustomerAddress;

items: OrderItem[];
payments: OrderPayment[];

shippingFee?: number | null;
shippingMethod?: string | null;

totalPriceExVat?: number | null;
totalPriceIncVat?: number | null;

tracking?: TrackingInfo[] | null;

vinNumber?: string | null;

createDate: string; // ISO date-time (RFC 3339)

errors?: OrderError[] | null;

metaData?: object | null;
status:OrderStatus;
totalPaid? : number | null;
}
},
{
name: "api/Order/Process"
schemaName: "PostOrderProcessParams",
types: {
export interface ProcessOrderRequest {
id?: string | null;

status?: OrderStatus;

customer?: CustomerModel | null;

billing: CustomerAddress;
shipping: CustomerAddress;

items: OrderItem[];
payments?: OrderPayment[];

shippingFee?: number | null;
shippingMethod?: string | null;

totalPriceExVat?: number | null;
totalPriceIncVat?: number | null;
totalPaid?: number | null;

tracking?: TrackingInfo[] | null;

vinNumber?: string | null;

createDate?: string; // ISO date-time

errors?: OrderError[] | null;

metaData?: object | null;
}

        }
    },
    {
        name: "api/Order/Commit"
        schemaName: "PostOrderCommitParams",
        types: {

id?: string | null;

status?: OrderStatus;

customer?: CustomerModel | null;

billing: CustomerAddress;
shipping: CustomerAddress;

items: OrderItem[];
payments?: OrderPayment[];

shippingFee?: number | null;
shippingMethod?: string | null;

totalPriceExVat?: number | null;
totalPriceIncVat?: number | null;
totalPaid?: number | null;

tracking?: TrackingInfo[] | null;

vinNumber?: string | null;

createDate?: string; // ISO date-time

errors?: OrderError[] | null;

metaData?: Record<string, unknown> | null;
status:OrderStatus;
totalPaid? : number | null;

        }
    },
    {
        name: "api/Order/Pay"
        schemaName: "PostOrderPayParams",
        types: {

id?: string | null;

status?: OrderStatus;

customer?: CustomerModel | null;

billing: CustomerAddress;
shipping: CustomerAddress;

items: OrderItem[];
payments?: OrderPayment[];

shippingFee?: number | null;
shippingMethod?: string | null;

totalPriceExVat?: number | null;
totalPriceIncVat?: number | null;
totalPaid?: number | null;

tracking?: TrackingInfo[] | null;

vinNumber?: string | null;

createDate?: string; // ISO date-time

errors?: OrderError[] | null;

metaData?: Record<string, unknown> | null;
status:OrderStatus;
totalPaid? : number | null;

        }
    },
    {
        name: "api/Parts"
        schemaName: "PostPartsParams",
        types: {

categoryIds?: string[] | null;

country?: string | null; // ISO2 code (BE/NL/FR)

language?: number | null;

makeModelTypeId?: string | null;

manufacturerIds?: string[] | null;

maxPrice?: number | null;
minPrice?: number | null;

name?: string | null;

oeReference?: string | null;

order?: "ASC" | "DESC" | "PRIORITY" | null;

type?: number | null;

vendorId?: string | null;

continuationToken?: string | null;

search?: string | null;

take?: number | null;

        }
    },
    {
        name: "api/PayNL"
        schemaName: "PostPayNLParams",
        types: {
          cid?:string | null;
          oid?:string | null;
          sid?:string|null
        }
    },
    {
        name: "api/Profile"
        schemaName: "PostProfileParams",
        types: {

id?: string | null;

email: string;

firstName?: string | null;
lastName?: string | null;
middleName?: string | null;
initials?: string | null;

phoneNumber?: string | null;
picture?: string | null;

lang?: string | null;

hasLoggedIn?: boolean | null;

marketingConsent?: boolean;

vatNumber?: string | null;

businessAccount?: boolean | null;
companyName?: string | null;

addresses?: CustomerAddress[] | null;

        }
    },
    {
     name:"api/Profile/addresses"
     schemaName:"PostProfileAddressesParams",
     types:{

id?: string | null;
name?: string | null;
street?: string | null;
houseNumber?: string | null;
buildingNumber?: string | null;
postalCode?: string | null;
city?: string | null;
state?: string | null;
country?: string | null;
phoneNumber?: string | null;
email?: string | null;
vatNumber?: string | null;
isCompany: boolean;
isDefaultBilling: boolean;
isDefaultShipping: boolean;
hehDepartementId: number | null;
b2bRouterId: number | null;
b2bRouterIds: Record<string, any> | null; // UI shows 'object'

     }
    },
    {
        name: "api/Return"
        schemaName: "PostReturnParams",
        types: {
           id?: string | null;

orderId?: string | null;
customerId?: string | null;
firstName?: string | null;
lastName?: string | null;
email?: string | null;
iban?: string | null;
accountName?: string | null;
message?: string | null;
totalPrice?: number | null; // UI specifies 'decimal'
items?: ReturnItemModel[] | null;
}
},
{
name: "api/Support"
schemaName: "PostSupportParams",
types: {
category: SupportCategory;
email: string;
files?: any[] | null; // UI shows 'array | null'
firstName: string;
invoiceNumber?: string | null;
lastName: string;
message?: string | null;
orderId?: string | null;
vin?: string | null;
}
},

]
Delete api
[

    {
        name: "api/garage/${id}"
        schemaName: "PostGarageDeleteParams",
        types: {
          id:string
        }
    },
    {
        name:"api/profile"
        schemaName:"PostProfileDeleteParams",
    },
    {
        name:"api/profile/addresses/${id}"
        schemaName:"PostProfileAddressesDeleteParams",
        types:{
            id:string
        }
    }

]
// Generated Model Types

export type ArticleType = "Part" | "Deposit" | "Bundle";

export interface CarModel {
id?: string | null;
name?: string | null;
year?: number | null;
picture?: string | null;
vin?: string | null;
makeModelTypeId?: string | null;
isFavorite?: boolean;
isNew?: boolean;
lastUsed?: string | null;
}

export interface CarModelRepsonse {
brandId?: string | null;
brandName?: string | null;
modelId?: string | null;
modelName?: string | null;
typeId?: string | null;
typeName?: string | null;
engineId?: string | null;
engineName?: string | null;
fuel?: NullableOfFuelType;
engineSize?: string | null;
powerHp?: number | null;
doors?: number | null;
seats?: number | null;
body?: string | null;
variant?: string | null;
id?: string | null;
name?: string | null;
year?: number | null;
picture?: string | null;
vin?: string | null;
makeModelTypeId?: string | null;
isFavorite?: boolean;
isNew?: boolean;
lastUsed?: string | null;
}

export interface CategoryModel {
id?: string;
parentId?: string;
name?: string | null;
displayOrder?: number;
titles?: { [key: string]: string } | null;
descriptions?: { [key: string]: string } | null;
children?: any[] | null;
}

export interface CategoryModel2 {
id?: string;
parentId?: string;
name?: string | null;
displayOrder?: number;
titles?: { [key: string]: string } | null;
descriptions?: { [key: string]: string } | null;
children?: CategoryModel[] | null;
}

export interface CustomerAddress {
id?: string | null;
name?: string | null;
street?: string | null;
houseNumber?: string | null;
buildingNumber?: string | null;
postalCode?: string | null;
city?: string | null;
state?: string | null;
country?: string | null;
phoneNumber?: string | null;
email?: string | null;
vatNumber?: string | null;
isCompany?: boolean;
isDefaultBilling?: boolean;
isDefaultShipping?: boolean;
hehDepartementId?: number;
b2bRouterId?: number | null;
b2BRouterIds?: { [key: string]: number } | null;
}

export interface CustomerAddress2 {
id?: string | null;
name?: string | null;
street?: string | null;
houseNumber?: string | null;
buildingNumber?: string | null;
postalCode?: string | null;
city?: string | null;
state?: string | null;
country?: string | null;
phoneNumber?: string | null;
email?: string | null;
vatNumber?: string | null;
isCompany?: boolean;
isDefaultBilling?: boolean;
isDefaultShipping?: boolean;
hehDepartementId?: number;
b2bRouterId?: number | null;
b2BRouterIds?: { [key: string]: number } | null;
}

export interface CustomerModel {
id?: string | null;
email: string;
initials?: string | null;
firstName?: string | null;
lastName?: string | null;
middleName?: string | null;
marketingConsent?: boolean;
lang?: string | null;
picture?: string | null;
phoneNumber?: string | null;
hasLoggedIn?: boolean | null;
vatNumber?: string | null;
companyName?: string | null;
businessAccount?: boolean | null;
addresses?: CustomerAddress[] | null;
}

export interface CustomerModel2 {
id?: string | null;
email: string;
initials?: string | null;
firstName?: string | null;
lastName?: string | null;
middleName?: string | null;
marketingConsent?: boolean;
lang?: string | null;
picture?: string | null;
phoneNumber?: string | null;
hasLoggedIn?: boolean | null;
vatNumber?: string | null;
companyName?: string | null;
businessAccount?: boolean | null;
addresses?: CustomerAddress[] | null;
}

export interface GTMotiveInfo {
makecode?: string | null;
umc?: string | null;
equipmentCodes?: string[] | null;
cupiCode?: string | null;
materialType?: string | null;
makeDescription?: string | null;
modelDescription?: string | null;
description?: string | null;
}

export interface IActionResult {
}

export interface InMotiveInfo {
makeId?: number | null;
modelId?: number | null;
versionId?: number | null;
}

export interface IpLookupModel {
ip?: string | null;
country?: string | null;
countryName?: string | null;
languages?: string[];
}

export type Languages = "nl" | "en" | "fr" | "de";

export interface MakeModelType {
id?: string;
partitionKey?: string;
normalizedName?: string;
vinCode?: string | null;
brandNr?: number;
brandId?: string | null;
brandName?: string | null;
modelNr?: number;
modelId?: string | null;
modelName?: string | null;
modelCode?: string | null;
modelYear?: number | null;
modelFrom?: string | null;
modelTo?: string | null;
typeNr?: number;
typeId?: string | null;
typeName?: string | null;
engineNr?: number;
engineId?: string | null;
engineName?: string | null;
fuel?: NullableOfFuelType;
engineSize?: string | null;
powerKw?: number | null;
powerHp?: number | null;
cylinderCapacity?: number | null;
engineFrom?: string | null;
engineTo?: string | null;
yearFrom?: number | null;
yearTo?: number | null;
versionNr?: number;
versionId?: string | null;
versionName?: string | null;
commercialCode?: string | null;
platformCode?: string | null;
constructionCode?: string | null;
level?: number;
partsCount?: number;
fullName?: string | null;
image?: string | null;
sqlId?: number | null;
serieName?: string | null;
doors?: number | null;
seats?: number | null;
body?: string | null;
gearBox?: string | null;
transmissionType?: string | null;
engineCode?: string | null;
cylinders?: number | null;
length?: number | null;
width?: number | null;
height?: number | null;
weight?: number | null;
co2Nedc?: number | null;
co2Wltp?: number | null;
technicarIds?: string[] | null;
tecDoc?: TecDocCarInfo;
gtMotive?: GTMotiveInfo;
inMotive?: InMotiveInfo;
inMotives?: InMotiveInfo[] | null;
lastUpdateBy?: string | null;
popularityIndex?: number;
}

export interface MakeModelTypeModel {
id?: string;
brand?: string | null;
model?: string | null;
type?: string | null;
engine?: string | null;
yearFrom?: number | null;
yearTo?: number | null;
image?: string | null;
children?: any[] | null;
sortIdx?: number;
}

export interface MakeModelTypeModel2 {
id?: string;
brand?: string | null;
model?: string | null;
type?: string | null;
engine?: string | null;
yearFrom?: number | null;
yearTo?: number | null;
image?: string | null;
children?: MakeModelTypeModel[] | null;
sortIdx?: number;
}

export interface MakeModelTypeSearch {
makeModelTypeId?: string | null;
year?: number | null;
name?: string | null;
}

export interface MakeModelTypeTrimModel {
engineSize?: string[];
fuel?: string[];
powerHp?: number[];
body?: string[];
doors?: number[];
seats?: number[];
variant?: string[];
}

export interface ManufacturerModel {
id?: string;
name?: string;
type?: string;
}

export interface OeRefLookup {
id?: string;
text?: string;
name?: string;
title?: { [key: string]: string };
oeRef?: string | null;
brand?: string | null;
}

export interface Order {
id: string;
orderId?: string | null;
partitionKey?: string;
storeId: string;
customerId: string | null;
isGuestOrder?: boolean;
partnerId?: string | null;
createDate?: string;
status?: OrderStatus;
customer?: Customer;
lang?: NullableOfLanguages;
vinNumber?: string | null;
shippingFee?: number | null;
shippingFeeExlTax?: number | null;
shippingMethod?: string | null;
shippingMethodId?: string | null;
trackingIds?: string | null;
tracking?: TrackingInfo[] | null;
invoiceNr?: string | null;
invoiceDate?: string | null;
billing?: CustomerAddress;
shipping?: CustomerAddress;
items?: OrderItem[];
payments?: OrderPayment[];
mailLogs?: MailLog[];
bcOrderId?: string | null;
bcSalesId?: string | null;
heHOrderId?: number | null;
scOrderId?: number | null;
b2bInvoiceId?: number | null;
errors?: OrderError[] | null;
totalPriceExVat?: number;
totalPriceIncVat?: number;
totalDiscount?: number;
totalPaid?: number;
returnReason?: string | null;
returnDate?: string | null;
refund?: OrderPayment;
bcCreditId?: string | null;
}

export interface OrderError {
origin?: string | null;
itemId?: string | null;
errorCode?: string | null;
errorArgs?: string | null;
message?: string | null;
}

export interface OrderItem {
id: string;
type?: ArticleType;
quantity: number;
partnerId?: string | null;
name?: string | null;
description?: string | null;
image?: string | null;
serialNumber?: string | null;
unitPrice?: number | null;
unitPriceIncVat?: number | null;
vatPercentage?: number | null;
discount?: number | null;
discountPercentage?: number | null;
remark?: string | null;
status?: OrderItemStatus;
totalPriceExVat?: number | null;
totalPriceIncVat?: number | null;
}

export type OrderItemStatus = "Processing" | "Picked" | "Backorder" | "NotAvailable" | "Error" | "Delivered" | "Returning" | "Returned" | "Refunded";

export interface OrderModel {
id?: string | null;
customer?: CustomerModel2;
shipping?: CustomerAddress;
billing?: CustomerAddress;
shippingFee?: number | null;
shippingMethod?: string | null;
vinNumber?: string | null;
items?: OrderItem[];
payments?: OrderPayment[];
tracking?: TrackingInfo[] | null;
totalPriceIncVat?: number | null;
totalPriceExVat?: number | null;
totalPaid?: number | null;
errors?: OrderError[] | null;
createDate?: string;
status?: OrderStatus;
metaData?: { [key: string]: string } | null;
}

export interface OrderPayment {
ipAddress?: string | null;
orderId?: string | null;
paymentId?: string | null;
price?: number | null;
currency?: string;
paymentMethod?: string | null;
paymentInfo?: string | null;
paymentMethodId?: number | null;
status?: string | null;
isSuccess?: boolean;
paymentDate?: string | null;
}

export interface OrderPayModel {
id?: string | null;
url?: string | null;
error?: string | null;
}

export type OrderStatus = "New" | "Checkout" | "Paid" | "PaidFailed" | "Processing" | "Backorder" | "WaitForPicking" | "Picking" | "Picked" | "WaitForDelivery" | "WaitForTransport" | "Delivering" | "Delivered" | "Invoiced" | "Returning" | "Returned" | "Refunded" | "PartiallyRefunded" | "Failed" | "Abandoned";

export type OrderStatus2 = "New" | "Checkout" | "Paid" | "PaidFailed" | "Processing" | "Backorder" | "WaitForPicking" | "Picking" | "Picked" | "WaitForDelivery" | "WaitForTransport" | "Delivering" | "Delivered" | "Invoiced" | "Returning" | "Returned" | "Refunded" | "PartiallyRefunded" | "Failed" | "Abandoned";

export type OrderStatus3 = "New" | "Checkout" | "Paid" | "PaidFailed" | "Processing" | "Backorder" | "WaitForPicking" | "Picking" | "Picked" | "WaitForDelivery" | "WaitForTransport" | "Delivering" | "Delivered" | "Invoiced" | "Returning" | "Returned" | "Refunded" | "PartiallyRefunded" | "Failed" | "Abandoned";

export type OrderStatus4 = "New" | "Checkout" | "Paid" | "PaidFailed" | "Processing" | "Backorder" | "WaitForPicking" | "Picking" | "Picked" | "WaitForDelivery" | "WaitForTransport" | "Delivering" | "Delivered" | "Invoiced" | "Returning" | "Returned" | "Refunded" | "PartiallyRefunded" | "Failed" | "Abandoned";

export type OrderStatus5 = "New" | "Checkout" | "Paid" | "PaidFailed" | "Processing" | "Backorder" | "WaitForPicking" | "Picking" | "Picked" | "WaitForDelivery" | "WaitForTransport" | "Delivering" | "Delivered" | "Invoiced" | "Returning" | "Returned" | "Refunded" | "PartiallyRefunded" | "Failed" | "Abandoned";

export type PartAvailability = "OnRequest" | "InStock" | "BackOrder" | "EndOfLife";

export type PartAvailability2 = "OnRequest" | "InStock" | "BackOrder" | "EndOfLife";

export interface PartLink {
id?: string | null;
name?: string | null;
type?: ArticleType;
quantity?: number;
priceExclVat?: number | null;
priceInclVat?: number | null;
pricesInclVat?: { [key: string]: number } | null;
title?: { [key: string]: string };
}

export interface PartModel {
id?: string;
name?: string | null;
title?: string | null;
description?: string | null;
fullDescription?: string | null;
manufacturerId?: string | null;
manufacturer?: string | null;
oeReference?: string | null;
eanCode?: string | null;
seo?: SeoMetaData;
images?: any[] | null;
priceExclVat?: number;
priceInclVat?: number;
recommendedPriceExlVat?: number | null;
recommendedPriceInclVat?: number | null;
linkedItems?: PartLink[] | null;
categories?: any | null;
availability?: PartAvailability;
shippingDelivery?: boolean;
shippingPickup?: boolean;
shippingWarehouse?: boolean;
length?: number | null;
width?: number | null;
height?: number | null;
weight?: number | null;
priority?: number | null;
}

export interface PartModel2 {
id?: string;
name?: string | null;
title?: string | null;
description?: string | null;
fullDescription?: string | null;
manufacturerId?: string | null;
manufacturer?: string | null;
oeReference?: string | null;
eanCode?: string | null;
seo?: SeoMetaData;
images?: any[] | null;
priceExclVat?: number;
priceInclVat?: number;
recommendedPriceExlVat?: number | null;
recommendedPriceInclVat?: number | null;
linkedItems?: PartLink[] | null;
categories?: String[];
availability?: PartAvailability;
shippingDelivery?: boolean;
shippingPickup?: boolean;
shippingWarehouse?: boolean;
length?: number | null;
width?: number | null;
height?: number | null;
weight?: number | null;
priority?: number | null;
}

export interface PartsFilter {
vendorId?: string | null;
country?: string | null;
language?: NullableOfLanguages;
name?: string | null;
oeReference?: string | null;
makeModelTypeId?: string | null;
manufacturerIds?: String[];
categoryIds?: String[];
minPrice?: number | null;
maxPrice?: number | null;
order?: string | null;
type?: NullableOfArticleType;
search?: string | null;
take?: number | null;
continuationToken?: string | null;
}

export interface PartsResultModel {
parts?: PartModel2[];
minPrice?: number | null;
maxPrice?: number | null;
totalCount?: number;
continuationToken?: string | null;
}

export interface PartsSearch {
id?: string;
title?: string;
oeReference?: string | null;
name?: string | null;
search?: string | null;
makeModelTypeId?: string | null;
categoryId?: string | null;
}

export interface ProblemDetails {
type?: string | null;
title?: string | null;
status?: number | null;
detail?: string | null;
instance?: string | null;
}

export interface QueryResultOfOrder {
totalCount?: number | null;
continuationToken?: string | null;
data?: Order[];
}

export interface ReturnItemModel {
id?: string | null;
partId?: string | null;
name?: string | null;
description?: string | null;
image?: string | null;
price?: number | null;
reason?: ReturnReason;
comment?: string | null;
files?: FileData[] | null;
}

export interface ReturnModel {
id?: string | null;
orderId?: string | null;
firstName?: string | null;
lastName?: string | null;
email?: string | null;
message?: string | null;
customerId?: string | null;
accountName?: string | null;
iban?: string | null;
totalPrice?: number | null;
items?: ReturnItemModel[];
}

export type ReturnReason = "DoNotReturn" | "WrongItem" | "Damaged" | "NotCompatible" | "NoLongerNeeded";

export interface ReturnResponseModel {
createDate?: string;
status?: NullableOfReturnStatus;
id?: string | null;
orderId?: string | null;
firstName?: string | null;
lastName?: string | null;
email?: string | null;
message?: string | null;
customerId?: string | null;
accountName?: string | null;
iban?: string | null;
totalPrice?: number | null;
items?: ReturnItemModel[];
}

export interface SeoMetaData {
name?: string | null;
title?: string | null;
description?: string | null;
keywords?: string | null;
schema?: string | null;
}

export interface StockModel {
id?: string;
stock?: number;
availability?: PartAvailability2;
deliveryTime?: string | null;
}

export interface StoreConfigModel {
countries?: { [key: string]: string } | null;
languages?: { [key: string]: string } | null;
defaults?: { [key: string]: string } | null;
supportCategories?: string[] | null;
returnReasons?: string[] | null;
vats?: { [key: string]: number } | null;
numberOfFaq?: number;
}

export type SupportCategory = "Billing" | "PartQuery" | "OrderIssue" | "Account" | "Shipping" | "Return" | "ReturnQuery" | "Complaints" | "Other";

export interface SupportModel {
firstName?: string;
lastName?: string;
email?: string;
category?: SupportCategory;
vin?: string | null;
message?: string | null;
files?: FileData[] | null;
orderId?: string | null;
invoiceNumber?: string | null;
}

export interface TecDocCarInfo {
manuId?: number | null;
modelId?: number | null;
modelIds?: number[] | null;
modelList?: string | null;
carId?: number | null;
autoCreate?: boolean;
}

export interface TrackingInfo {
trackingId?: string;
method?: string | null;
trackUrl?: string | null;
state?: TrackingState;
deliveryDate?: string | null;
info?: string | null;
length?: number | null;
height?: number | null;
width?: number | null;
weight?: number | null;
cost?: number | null;
costByCustomer?: boolean;
}

export type TrackingState = "Announced" | "Delivered";
export enum OrderStatus {
New = "New",
Checkout = "Checkout",
Paid = "Paid",
Cancelled = "Cancelled",
PaidFailed = "PaidFailed",
Processing = "Processing",
Backorder = "Backorder",
WaitForPicking = "WaitForPicking",
Picking = "Picking",
Picked = "Picked",
WaitForDelivery = "WaitForDelivery",
WaitForTransport = "WaitForTransport",
Delivering = "Delivering",
Delivered = "Delivered",
Invoiced = "Invoiced",
Returning = "Returning",
Returned = "Returned",
Refunded = "Refunded",
PartiallyRefunded = "PartiallyRefunded",
Failed = "Failed",
Abandoned = "Abandoned",
}
