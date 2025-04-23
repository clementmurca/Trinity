export interface Product {
  id: string
  _id?: string
  code: string
  name: string
  brand: string
  price: number
  imageUrl: string
  quantity: string
  category: string[]
  nutritionFacts: {
    energy_100g: number
    proteins_100g: number
    carbohydrates_100g: number
    fat_100g: number
    fiber_100g: number
    salt_100g: number
  }
  stock?: number
  sellers?: Array<{
    sellerId: string
    stock: number
    price: number
    _id: string
  }>
  sellerInfo?: {
    sellerId: string
    stock: number
    price: number
    _id: string
  }
}
export interface CartItem {
  product: Product
  quantity: number
  _id?: string
}

export interface Seller {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  billing?: {
    address: string
    zipCode: string
    city: string
    country: string
    _id: string
  }
  role?: string
  status?: string
  products: Product[]
}