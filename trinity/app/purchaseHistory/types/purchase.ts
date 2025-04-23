export interface Product {
    _id: string;
    product: {
        name: string;
        brand: string;
        price: number;
        imageUrl: string;
    };
    quantity: number;
}

export interface OrderProduct {
    product: Product;
    quantity: number;
    _id: string;
}

export interface PaymentResult {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
}

export interface Order {
    _id: string;
    user: string;
    products: OrderProduct[];
    totalAmount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    __v: number;
}

export interface CustomerDetails {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
}

export interface Purchase {
    _id: string;
    order: Order;
    user: string;
    products: Product[];
    customerDetails: CustomerDetails;
    invoiceNumber: string;
    issuedAt: string;
    totalAmount: number;
    Status: string;
    paymentResult?: PaymentResult;
    __v: number;
    pdfPath?: string;
}