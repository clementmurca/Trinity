import dotenv from 'dotenv'
dotenv.config()

const config = {
  mongodb: {
    url: process.env.MONGODB_URI
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false
}

export default config
