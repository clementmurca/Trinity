import { jest } from '@jest/globals'
import mockingoose from 'mockingoose'
import { getCart } from '../controllers/cartController.js'
import User from '../models/User.js'

describe('cartController - getCart', () => {
  let req, res

  beforeEach(() => {
    req = { user: { _id: 'user123' } }
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    }
  })

  it('doit renvoyer une erreur si l’utilisateur n’est pas trouvé', async () => {
    mockingoose(User).toReturn(null, 'findOne')

    await getCart(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur non trouvé' })
  })
})
