import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// 환경변수에서 Stripe 시크릿 키 읽어옴 (.env.local에 넣었죠!)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  // 실제 결제 금액(센트 단위!)과 통화(AUD)로 수정 가능
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 5700,    // 57.00 AUD → Stripe에서는 '5700'(센트)으로 입력!
    currency: "aud", // 호주는 AUD
  });
  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}