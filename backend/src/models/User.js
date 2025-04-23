import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phoneNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      validate: {
        validator: function () {
          // Make phoneNumber required only if googleId is not present
          return this.googleId || this.phoneNumber
        },
        message: 'Phone number is required'
      }
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        validator: function () {
          // Make password required only if googleId is not present
          return this.googleId || this.password
        },
        message: 'Password is required'
      }
    },
    billing: {
      type: {
        address: {
          type: String,
          required: [true, 'Address is required']
        },
        zipCode: {
          type: String,
          required: [true, 'Zip code is required']
        },
        city: {
          type: String,
          required: [true, 'City is required']
        },
        country: {
          type: String,
          required: [true, 'Country is required']
        }
      },
      required: false // Billing is optional
    },
    googleId: {
      type: String, // Unique identifier for Google OAuth
      unique: true,
      sparse: true // Allows for both Google and non-Google users
    },
    avatar: {
      type: String // URL of the user's avatar (optional)
    },
    status: {
      type: String,
      enum: ['seller', 'customer'],
      default: 'customer'
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: function () {
        return this.status === 'seller' ? 'admin' : 'user'
      }
    },
    refreshToken: String,
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.googleId) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)
export default User
