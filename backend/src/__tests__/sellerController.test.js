import { jest } from '@jest/globals'
import { createSeller, addProductToStock, getProductSellers, removeProductFromShop } from '../controllers/sellerController.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

describe('sellerController - createSeller', () => {
  let req, res

  beforeEach(() => {
    req = { body: { userId: 'user123' } }
    res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('doit créer un vendeur si l’utilisateur est trouvé', async () => {
    const userFictif = {
      _id: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: 'client',
      role: 'user',
      save: jest.fn().mockResolvedValue(true)
    }
    // Simulation de User.findById pour retourner un utilisateur trouvé
    jest.spyOn(User, 'findById').mockResolvedValue(userFictif)

    await createSeller(req, res)

    // On s'attend à ce que le statut de l'utilisateur soit mis à jour en 'seller'
    expect(userFictif.status).toBe('seller')
    expect(userFictif.save).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        id: userFictif._id,
        firstName: userFictif.firstName,
        lastName: userFictif.lastName,
        email: userFictif.email,
        status: 'seller',
        role: userFictif.role
      }
    })
  })

  it('doit renvoyer une erreur si l’utilisateur n’est pas trouvé', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(null)

    await expect(createSeller(req, res)).rejects.toThrow('User not found')
    expect(res.status).toHaveBeenCalledWith(404)
  })
})

describe('addProductToStock', () => {
  let req, res

  beforeEach(() => {
    req = {
      body: { productId: 'prod123', stock: '10', price: '99.99' },
      params: { sellerId: 'seller123' },
      headers: {}
    }
    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('doit lancer une erreur si sellerId ou productId sont manquants', async () => {
    req.params.sellerId = undefined

    await expect(addProductToStock(req, res)).rejects.toThrow('ID du vendeur et ID du produit sont requis')
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('doit lancer une erreur si le stock ou le prix ne sont pas des nombres valides', async () => {
    req.body.stock = 'invalide'
    req.body.price = 'abc'

    await expect(addProductToStock(req, res)).rejects.toThrow('Le stock et le prix doivent être des nombres valides')
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('doit lancer une erreur si le vendeur n’est pas trouvé', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(null)
    await expect(addProductToStock(req, res)).rejects.toThrow('Seller not found')
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('doit lancer une erreur si le produit n’est pas trouvé', async () => {
    // Vendeur valide
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: 'seller123', status: 'seller' })
    // Produit inexistant
    jest.spyOn(Product, 'findById').mockResolvedValue(null)

    await expect(addProductToStock(req, res)).rejects.toThrow('Product not found')
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('doit ajouter un nouveau vendeur dans le tableau sellers si non présent', async () => {
    const fakeSeller = { _id: 'seller123', status: 'seller' }
    jest.spyOn(User, 'findById').mockResolvedValue(fakeSeller)

    // Produit existant sans vendeur associé
    const fakeProduct = {
      _id: 'prod123',
      sellers: [],
      save: jest.fn().mockResolvedValue(true)
    }
    jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct)

    await addProductToStock(req, res)

    // Vérification : un vendeur doit être ajouté avec stock et prix convertis en nombres
    expect(fakeProduct.sellers.length).toBe(1)
    expect(fakeProduct.sellers[0]).toEqual({
      sellerId: 'seller123',
      stock: 10,
      price: 99.99
    })
    expect(fakeProduct.save).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: fakeProduct
    })
  })

  it('doit mettre à jour les informations du vendeur si déjà présent dans le tableau sellers', async () => {
    const fakeSeller = { _id: 'seller123', status: 'seller' }
    jest.spyOn(User, 'findById').mockResolvedValue(fakeSeller)

    // Produit existant avec le vendeur déjà présent
    const fakeProduct = {
      _id: 'prod123',
      sellers: [{ sellerId: 'seller123', stock: 5, price: 50.0 }],
      save: jest.fn().mockResolvedValue(true)
    }
    jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct)

    // Mise à jour des valeurs
    req.body.stock = '20'
    req.body.price = '150.50'

    await addProductToStock(req, res)

    // Dans ce cas, les valeurs sont mises à jour directement avec les valeurs de req.body (de type string)
    expect(fakeProduct.sellers.length).toBe(1)
    expect(fakeProduct.sellers[0]).toEqual({
      sellerId: 'seller123',
      stock: '20',
      price: '150.50'
    })
    expect(fakeProduct.save).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: fakeProduct
    })
  })
})

describe('getProductSellers', () => {
  let req, res

  beforeEach(() => {
    req = { params: { productId: 'prod123' } }
    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('doit lancer une erreur si le produit n’est pas trouvé', async () => {
    jest.spyOn(Product, 'findById').mockResolvedValue(null)

    await expect(getProductSellers(req, res)).rejects.toThrow('Product not found')
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('doit renvoyer la liste des vendeurs avec les informations de stock associées', async () => {
    const fakeProduct = {
      _id: 'prod123',
      sellers: [{ sellerId: 'seller123', stock: 10, price: 99.99 }]
    }
    jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct)

    const fakeSeller = {
      _id: 'seller123',
      name: 'Seller A',
      toObject() {
        return { _id: this._id, name: this.name }
      }
    }
    // Pour simuler la chaîne User.find(...).select('-password -refreshToken')
    const selectMock = jest.fn().mockResolvedValue([fakeSeller])
    jest.spyOn(User, 'find').mockReturnValue({ select: selectMock })

    await getProductSellers(req, res)

    expect(Product.findById).toHaveBeenCalledWith('prod123')
    expect(User.find).toHaveBeenCalledWith({ _id: { $in: ['seller123'] } })
    expect(selectMock).toHaveBeenCalledWith('-password -refreshToken')
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [
        {
          _id: 'seller123',
          name: 'Seller A',
          stockInfo: { sellerId: 'seller123', stock: 10, price: 99.99 }
        }
      ]
    })
  })
})

describe('removeProductFromShop', () => {
  let req, res

  beforeEach(() => {
    req = { params: { sellerId: 'seller123', productId: 'prod123' } }
    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('doit lancer une erreur si le vendeur n’est pas trouvé ou n’a pas le statut "seller"', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(null)

    await expect(removeProductFromShop(req, res)).rejects.toThrow('Vendeur non trouvé')
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('doit lancer une erreur si le produit n’est pas trouvé', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: 'seller123', status: 'seller' })
    jest.spyOn(Product, 'findById').mockResolvedValue(null)

    await expect(removeProductFromShop(req, res)).rejects.toThrow('Produit non trouvé')
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('doit lancer une erreur si le produit n’appartient pas à la boutique du vendeur', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: 'seller123', status: 'seller' })
    const fakeProduct = {
      _id: 'prod123',
      sellers: [{ sellerId: 'otherSeller' }],
      save: jest.fn()
    }
    jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct)

    await expect(removeProductFromShop(req, res)).rejects.toThrow('Produit non trouvé dans la boutique du vendeur')
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('doit retirer le vendeur du produit et renvoyer un message de succès', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: 'seller123', status: 'seller' })
    const fakeProduct = {
      _id: 'prod123',
      sellers: [
        { sellerId: 'seller123', stock: 10, price: 99.99 },
        { sellerId: 'otherSeller', stock: 5, price: 50 }
      ],
      save: jest.fn().mockResolvedValue(true)
    }
    jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct)

    await removeProductFromShop(req, res)

    // Après suppression, seul le vendeur "otherSeller" doit rester
    expect(fakeProduct.sellers.length).toBe(1)
    expect(fakeProduct.sellers[0].sellerId).toBe('otherSeller')
    expect(fakeProduct.save).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Produit retiré de la boutique avec succès'
    })
  })
})
