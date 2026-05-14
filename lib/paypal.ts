import paypal from '@paypal/payouts-sdk'

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID || 'PAYPAL-SANDBOX-CLIENT-ID'
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'PAYPAL-SANDBOX-CLIENT-SECRET'
  
  if (process.env.NODE_ENV === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret)
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

const client = new paypal.core.PayPalHttpClient(environment())

export async function sendPayout(email: string, amount: number, referenceId: string) {
  const request = new paypal.payouts.PayoutsPostRequest()
  request.requestBody({
    sender_batch_header: {
      sender_batch_id: `Payouts_${referenceId}_${Date.now()}`,
      email_subject: 'You have a payout from Linksite!',
      email_message: 'You have received a payout from Linksite! Thank you for using our service.'
    },
    items: [
      {
        recipient_type: 'EMAIL',
        amount: {
          value: amount.toFixed(2),
          currency: 'USD'
        },
        receiver: email,
        note: 'Thank you for using Linksite!',
        sender_item_id: referenceId
      }
    ]
  })

  try {
    const response = await client.execute(request)
    return { success: true, data: response.result }
  } catch (error) {
    console.error('PayPal Payout Error:', error)
    return { success: false, error }
  }
}
