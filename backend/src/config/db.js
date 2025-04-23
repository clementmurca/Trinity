import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const dbName = process.env.MONGODB_URI.split('/').pop() || 'your_database_name'

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: dbName
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
