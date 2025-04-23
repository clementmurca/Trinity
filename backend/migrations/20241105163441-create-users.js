export const up = async db => {
  await db.createCollection('users', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['firstName', 'lastName', 'email', 'phoneNumber', 'password', 'billing'],
        properties: {
          firstName: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          lastName: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          email: {
            bsonType: 'string',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            description: 'must be a valid email and is required'
          },
          phoneNumber: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          password: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          billing: {
            bsonType: 'object',
            required: ['address', 'zipCode', 'city', 'country'],
            properties: {
              address: {
                bsonType: 'string'
              },
              zipCode: {
                bsonType: 'string'
              },
              city: {
                bsonType: 'string'
              },
              country: {
                bsonType: 'string'
              }
            }
          },
          refreshToken: {
            bsonType: 'string'
          }
        }
      }
    }
  })

  // Create indexes for unique fields
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('users').createIndex({ phoneNumber: 1 }, { unique: true })
}

export const down = async db => {
  await db.collection('users').drop()
}
