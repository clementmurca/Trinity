import path from 'path'
import asyncHandler from 'express-async-handler'
import Invoice from '../models/Invoice.js'
import Order from '../models/Order.js'

export const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments()
  return `IFSB-${count + 1}`
}

export const uploadInvoicePDF = async (req, res) => {
  try {
    const invoiceId = req.params.id
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni.' })
    }

    const filePath = path.join('/invoices', req.file.filename)

    const invoice = await Invoice.findById(invoiceId)
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée.' })
    }
    invoice.pdfPath = filePath
    await invoice.save()

    res.status(200).json({ message: 'Fichier uploadé avec succès.', filePath })
  } catch (error) {
    console.error("Erreur lors de l'upload du fichier :", error)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// @desc Récupérer toutes les factures (admin uniquement)
// @route GET /api/invoices/all
// @access Admin
export const getAllInvoices = asyncHandler(async (req, res) => {
  try {
    const invoices = await Invoice.find().populate({
      path: 'order',
      populate: {
        path: 'products.product',
        select: 'name brand code price',
      },
    })

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: 'Aucune facture trouvée' })
    }

    res.status(200).json(invoices)
  } catch (error) {
    console.error('Erreur lors de la récupération des factures :', error.message)
    res.status(500).json({
      success: false,
      error: {
        status: 500,
        message: 'Une erreur interne est survenue lors de la récupération des factures',
        details: error.message,
      },
    })
  }
})

// @desc Récupérer toutes les factures d'un utilisateur
// @route GET /api/invoices
// @access Private
export const getInvoices = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id

    if (!userId) {
      return res.status(400).json({ error: "L'ID utilisateur est requis" })
    }

    const invoices = await Invoice.find({ user: userId }).populate({
      path: 'order',
      populate: {
        path: 'products.product',
        select: 'image name brand code price',
      },
    })

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: 'Aucune facture trouvée' })
    }

    res.status(200).json(invoices)
  } catch (error) {
    console.error('Erreur lors de la récupération des factures :', error.message)
    res.status(500).json({
      success: false,
      error: {
        status: 500,
        message: 'Une erreur interne est survenue lors de la récupération des factures',
        details: error.message,
      },
    })
  }
})

// @desc Récupérer une facture par ID
// @route GET /api/invoices/:id
// @access Private
export const getInvoiceById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const invoice = await Invoice.findById(id).populate({
      path: 'order',
      populate: {
        path: 'products.product',
        select: 'name brand code price',
      },
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' })
    }

    if (invoice.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Accès interdit à cette facture' })
    }

    res.status(200).json(invoice)
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture :', error.message)
    res.status(500).json({ message: 'Erreur interne', details: error.message })
  }
})

// @desc Créer une facture à partir d'une commande
// @route POST /api/invoices
// @access Private
export const createInvoice = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.body

    const order = await Order.findById(orderId)
      .populate(
        'user',
        'firstName lastName email billing.address billing.zipCode billing.city billing.country'
      )
      .populate('products.product', 'name price')

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' })
    }

    const existingInvoice = await Invoice.findOne({ order: orderId })
    if (existingInvoice) {
      return res.status(400).json({ message: 'Une facture existe déjà pour cette commande' })
    }

    const invoiceNumber = await generateInvoiceNumber()

    const invoice = new Invoice({
      order: order._id,
      user: order.user._id,
      invoiceNumber,
      totalAmount: order.totalAmount,
      issuedAt: Date.now(),
      paymentStatus: 'unpaid',
      customerDetails: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        email: order.user.email,
        address: `${order.user.billing.address}, ${order.user.billing.zipCode}, ${order.user.billing.city}, ${order.user.billing.country}`,
      },
    })

    const createdInvoice = await invoice.save()

    res.status(201).json({
      success: true,
      message: 'Facture créée avec succès',
      invoice: createdInvoice,
    })
  } catch (error) {
    console.error('Erreur lors de la création de la facture :', error.message)
    res.status(500).json({
      success: false,
      message: 'Une erreur interne est survenue lors de la création de la facture',
      details: error.message,
    })
  }
})

// @desc Mettre à jour une facture existante (statut ou autre champ)
// @route PUT /api/invoices/:id
// @access Private
export const updateInvoice = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    const { paymentStatus } = req.body

    const invoice = await Invoice.findById(id)

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' })
    }

    if (paymentStatus) {
      invoice.paymentStatus = paymentStatus
    }

    const updatedInvoice = await invoice.save()
    res.status(200).json(updatedInvoice)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture :', error.message)
    res.status(500).json({
      success: false,
      error: {
        status: 500,
        message: 'Une erreur interne est survenue lors de la mise à jour de la facture',
        details: error.message,
      },
    })
  }
})

// @desc Supprimer une facture
// @route DELETE /api/invoices/:id
// @access Private/Admin
export const deleteInvoice = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const invoice = await Invoice.findByIdAndDelete(id)

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' })
    }

    res.status(200).json({ message: 'Facture supprimée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture :', error.message)
    res.status(500).json({
      success: false,
      error: {
        status: 500,
        message: 'Une erreur interne est survenue lors de la suppression de la facture',
        details: error.message,
      },
    })
  }
})
