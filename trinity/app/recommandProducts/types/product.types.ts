export interface Product {
    _id: string;
    id: string;
    code: string;
    name: string;
    brand: string;
    imageUrl: string;
    price: number;
    category: string;
}

export interface CategoryRecommendation {
    category: string;
    products: Product[];
}