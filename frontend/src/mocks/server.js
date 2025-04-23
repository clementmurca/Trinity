import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// ✅ Define the mock server at the top level
export const server = setupServer(
  http.post('http://localhost:5001/api/auth/login', async ({ request }) => {
    const { identifier, password } = await request.json()

    if (identifier === 'test@example.com' && password === 'password123') {
      return new HttpResponse(
        JSON.stringify({
          user: { id: 1, email: 'test@example.com', name: 'Test User' },
          token: 'fake-jwt-token',
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    return new HttpResponse(JSON.stringify({ message: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  })
)

if (process.env.NODE_ENV !== 'test') {
  server.listen({ onUnhandledRequest: 'bypass' })
}
