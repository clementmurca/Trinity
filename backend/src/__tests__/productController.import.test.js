import { jest } from '@jest/globals'
import axios from 'axios'
import { importMultipleProducts } from '../controllers/productController.js'
import Product from '../models/Product.js'

jest.mock('axios')
jest.mock('../models/Product')

describe('importMultipleProducts', () => {
  let req, res

  beforeEach(() => {
    req = {}
    res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    }

    axios.get = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('doit importer les produits retournés par OpenFoodFacts', async () => {
    // Simulation de la réponse de l'API OpenFoodFacts
    const fakeProducts = [
      {
        code: '001',
        product_name_fr: 'Produit test',
        brands: 'Marque Test',
        image_url: 'http://image.url',
        quantity: '500g',
        categories: 'cat1, cat2',
        nutriments: {
          energy_100g: 100,
          proteins_100g: 5,
          carbohydrates_100g: 20,
          fat_100g: 2,
          fiber_100g: 3,
          salt_100g: 0.5
        }
      }
    ]

    axios.get.mockResolvedValue({ data: { products: fakeProducts } })
    // Simulation de Product.findOne pour retourner null (produit inexistant)
    jest.spyOn(Product, 'findOne').mockResolvedValue(null)
    // Simulation de la méthode save sur Product
    Product.prototype.save = jest.fn().mockResolvedValue(true)

    await importMultipleProducts(req, res)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/produits importés avec succès/),
        products: expect.any(Array)
      })
    )
  })
})
