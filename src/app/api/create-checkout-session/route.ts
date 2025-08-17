import { NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
});

export async function POST(req: NextRequest) {
    try {
        const {priceId, uid, coinAmount} = await req.json() as {
        priceId: string;
        uid: string;
        coinAmount: number;
    };

    console.log('Received request with:', {priceId, uid, coinAmount});

        if (!priceId || !uid || !coinAmount) {
            console.error('Missing parameters:', {priceId, uid, coinAmount});
            return Response.json({error: 'Missing required parameters'}, {status: 400});
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
            metadata: {
                uid,
                coinAmount: coinAmount.toString()
            },
            payment_intent_data: {
                metadata: {
                    uid,
                    coinAmount: coinAmount.toString()
                }
            }
        });

        console.log('Created checkout session:', {
            id: session.id,
            payment_intent: session.payment_intent,
            metadata: session.metadata,
        });

        if (!session.url) {
            throw new Error('No session URL returned');
        }
        return Response.json({url: session.url});
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return Response.json({error: errorMessage}, {status: 500});
    }
} 