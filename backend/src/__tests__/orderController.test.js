import { jest } from '@jest/globals'
import mockingoose from 'mockingoose'
import { createOrder } from '../controllers/orderController.js'
import User from '../models/User.js'

describe('orderController - createOrder', () => {
  let req, res

  beforeEach(() => {
    req = { user: { _id: 'user123' }, body: {} }
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    }
  })

  it('doit renvoyer une erreur si le panier est vide', async () => {
    const fakeUser = { _id: 'user123', cart: [] }

    mockingoose(User).toReturn(fakeUser, 'findOne')

    await createOrder(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Votre panier est vide' })
  })
})
