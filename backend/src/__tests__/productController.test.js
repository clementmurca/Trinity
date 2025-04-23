import { jest } from '@jest/globals'
import { getProducts, getProductByCode, getProductByCategory } from '../controllers/productController.js'
import Product from '../models/Product.js'

describe('productController - getProducts', () => {
  let req, res

  beforeEach(() => {
    req = { query: {} }
    res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('doit renvoyer une liste vide si aucun produit n’est trouvé', async () => {
    jest.spyOn(Product, 'find').mockResolvedValue([])
    await getProducts(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ message: 'Aucun produit trouvé', products: [] })
  })

  it('doit renvoyer la liste des produits', async () => {
    const produitsFictifs = [
      { code: '123', name: 'Produit A' },
      { code: '456', name: 'Produit B' }
    ]
    jest.spyOn(Product, 'find').mockResolvedValue(produitsFictifs)
    await getProducts(req, res)
    expect(res.json).toHaveBeenCalledWith(produitsFictifs)
  })
})

describe('productController - getProductByCode', () => {
  let req, res

  beforeEach(() => {
    req = { params: {} }
    res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('doit renvoyer un produit si celui-ci est trouvé', async () => {
    const produitFictif = { code: 'ABC123', name: 'Produit Test' }
    req.params.code = 'ABC123'
    jest.spyOn(Product, 'findOne').mockResolvedValue(produitFictif)

    await getProductByCode(req, res)

    expect(Product.findOne).toHaveBeenCalledWith({ code: 'ABC123' })
    expect(res.json).toHaveBeenCalledWith(produitFictif)
  })

  it('doit lancer une erreur avec un status 404 si le produit n’est pas trouvé', async () => {
    req.params.code = 'NONEXISTANT'
    jest.spyOn(Product, 'findOne').mockResolvedValue(null)

    await expect(getProductByCode(req, res)).rejects.toThrow('Produit non trouvé')
    expect(res.status).toHaveBeenCalledWith(404)
  })
})

describe('productController - getProductByCategory', () => {
  let req, res

  beforeEach(() => {
    req = { params: {} }
    res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('doit renvoyer la liste des produits correspondant aux catégories', async () => {
    const fakeProducts = [
      { id: 1, category: 'cat1', name: 'Produit 1' },
      { id: 2, category: 'cat2', name: 'Produit 2' }
    ]
    req.params.category = 'cat1, cat2'
    jest.spyOn(Product, 'find').mockResolvedValue(fakeProducts)

    await getProductByCategory(req, res)

    expect(Product.find).toHaveBeenCalledWith({ category: { $in: ['cat1', 'cat2'] } })
    expect(res.json).toHaveBeenCalledWith(fakeProducts)
  })
})
