import { jest } from '@jest/globals'
import mockingoose from 'mockingoose'
import { createInvoice } from '../controllers/invoiceController.js'
import Order from '../models/Order.js'

describe('invoiceController - createInvoice', () => {
  let req, res

  beforeEach(() => {
    req = { body: { orderId: 'order123' } }
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    }
  })

  it('doit renvoyer une erreur si la commande n’est pas trouvée', async () => {
    mockingoose(Order).toReturn(null, 'findOne')

    await createInvoice(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ message: 'Commande non trouvée' })
  })
})
