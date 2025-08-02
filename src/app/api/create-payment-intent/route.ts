import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("STRIPE_SECRET_KEY ENV:", process.env.STRIPE_SECRET_KEY);
  if (req.method === 'POST') {
    const { amount } = req.body;
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'aud',
        payment_method_types: ['card'],
      });
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err: any) {
  res.status(500).json({ error: err.message });
  }
  } else {
    res.status(405).end();
  }
}