import env from '#start/env'

export default {
  connect: {
    clientId: env.get('STRIPE_CONNECT_CLIENT_ID'),
    clientSecret: env.get('STRIPE_CONNECT_CLIENT_SECRET'),
    redirectUri: env.get('STRIPE_CONNECT_REDIRECT_URI'),
  },
}
