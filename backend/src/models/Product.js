import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  code: String,
  name: String,
  brand: String,
  imageUrl: String,
  price: Number,
  quantity: String,
  category: [String],
  nutritionFacts: {
    energy_100g: Number,
    proteins_100g: Number,
    carbohydrates_100g: Number,
    fat_100g: Number,
    fiber_100g: Number,
    salt_100g: Number
  },
  stock: { type: Number, default: 0 },
  sellers: [
    {
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      stock: {
        type: Number,
        default: 0
      },
      price: {
        type: Number,
        required: true
      }
    }
  ]
})
const Product = mongoose.model('Product', productSchema)
export default Product
