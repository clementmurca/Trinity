import { Product } from './product.types';

export interface OrderProduct {
    product: Product;
    code: string;
    quantity: number;
    _id: string;
}

export interface ShippingAddress {
    address: string;
    city: string;
    postalCode: string;
    country: string;
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
    shippingAddress?: ShippingAddress;
    paymentResult?: PaymentResult;
    createdAt: string;
    __v: number;
}
