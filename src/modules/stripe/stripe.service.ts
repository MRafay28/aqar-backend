import Stripe from 'stripe';
import CustomError from '../../utils/custom-error';
import { ERROR_MESSAGES } from './stripe.messages';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
    throw new CustomError(ERROR_MESSAGES.STRIPE_SECRET_MISSING, 500);
}
export interface CreateProductAndPriceParams {
    name: string;
    description: string;
    price: number;
    image: string;
}

// Initialize Stripe instance
const stripe = new Stripe(stripeSecretKey);

const createCustomer = async (params: { email: string; name: string; userId: string }): Promise<Stripe.Customer> => {
    const customer = await stripe.customers.create({
        email: params.email,
        name: params.name,
        metadata: {
            userId: params.userId
        }
    });

    return customer;
};

const createCheckoutSession = async (params: { customerId: string; userId: string; successUrl: string; cancelUrl: string; stripePriceId: string; stripeCouponId?: string }): Promise<string> => {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
            price: params.stripePriceId,
            quantity: 1
        }
    ];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'subscription',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        client_reference_id: params.userId,
        customer: params.customerId,
        payment_method_collection: 'always',
        subscription_data: {
            metadata: {
                ...(params.stripeCouponId && { stripeCouponId: params.stripeCouponId })
            }
        },
        ...(params.stripeCouponId && {
            discounts: [{ coupon: params.stripeCouponId }]
        })
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
        throw new CustomError(ERROR_MESSAGES.STRIPE_SESSION_URL_NOT_GENERATED, 500);
    }

    return session.url;
};

const retrieveCheckoutSession = async (sessionId: string): Promise<Stripe.Checkout.Session> => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
};

const retrieveSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
};

const retrieveCustomer = async (customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> => {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
};

const constructWebhookEvent = (body: string | Buffer, signature: string): Stripe.Event => {
    if (!stripeWebhookSecret) {
        throw new CustomError(ERROR_MESSAGES.STRIPE_WEBHOOK_SECRET_MISSING, 500);
    }

    const event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    return event;
};
const retrieveInvoice = async (invoiceId: string): Promise<Stripe.Invoice> => {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return invoice;
};

export async function deleteStripeCoupon(stripeCouponId: string) {
    return await stripe.coupons.del(stripeCouponId);
}
export async function createStripeProduct(name: string, description: string, image: string): Promise<Stripe.Product> {
    const product = await stripe.products.create({
        name,
        description,
        images: image ? [image] : undefined,
        active: true
    });
    return product;
}

export async function createStripePrice(productId: string, price: number): Promise<Stripe.Price> {
    const priceObj = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(price * 100),
        currency: 'usd',
        recurring: { interval: 'month' }
    });
    return priceObj;
}

export async function createStripeProductAndPrice(params: CreateProductAndPriceParams): Promise<{ productId: string; priceId: string }> {
    const { name, description, price, image } = params;

    // Check if product already exists in Stripe by listing and filtering by name
    const allProducts = await stripe.products.list({ limit: 100, active: true });
    const existingProduct = allProducts.data.find((p) => p.name === name);

    let product: Stripe.Product;
    if (existingProduct) {
        product = existingProduct;
    } else {
        product = await createStripeProduct(name, description, image);
    }

    // Check if price already exists for this product
    const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true
    });

    let priceObj: Stripe.Price;
    const priceInCents = Math.round(price * 100);

    // Check if a price with the same amount already exists
    const matchingPrice = existingPrices.data.find((p) => p.unit_amount === priceInCents && p.currency === 'usd' && p.recurring?.interval === 'month');

    if (matchingPrice) {
        priceObj = matchingPrice;
    } else {
        priceObj = await createStripePrice(product.id, price);
    }

    return {
        productId: product.id,
        priceId: priceObj.id
    };
}

export async function archiveStripePrice(priceId: string): Promise<Stripe.Price> {
    const price = await stripe.prices.update(priceId, { active: false });
    return price;
}

export async function updateSubscriptionItemPrice(subscriptionItemId: string, newPriceId: string): Promise<Stripe.SubscriptionItem> {
    const subscriptionItem = await stripe.subscriptionItems.update(subscriptionItemId, {
        price: newPriceId,
        proration_behavior: 'none'
    });
    return subscriptionItem;
}

export async function listSubscriptionsByPrice(priceId: string): Promise<Stripe.Subscription[]> {
    // Stripe doesn't support filtering by price directly, so we list all active subscriptions
    // and filter them manually. Handle pagination to get all subscriptions.
    const subscriptionsWithPrice: Stripe.Subscription[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
        const params: Stripe.SubscriptionListParams = {
            status: 'active',
            limit: 100
        };

        if (startingAfter) {
            params.starting_after = startingAfter;
        }

        const allSubscriptions = await stripe.subscriptions.list(params);

        const filtered = allSubscriptions.data.filter((subscription) => {
            return subscription.items.data.some((item) => item.price.id === priceId);
        });

        subscriptionsWithPrice.push(...filtered);

        hasMore = allSubscriptions.has_more;
        if (hasMore && allSubscriptions.data.length > 0) {
            startingAfter = allSubscriptions.data[allSubscriptions.data.length - 1].id;
        } else {
            hasMore = false;
        }
    }

    return subscriptionsWithPrice;
}

const cancelSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
    });
    return subscription;
};

const renewSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
    });
    return subscription;
};

const listPaymentMethods = async (customerId: string): Promise<Stripe.PaymentMethod[]> => {
    const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
    });
    return paymentMethods.data;
};

const createSetupIntent = async (customerId: string): Promise<Stripe.SetupIntent> => {
    const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card']
    });
    return setupIntent;
};

const confirmSetupIntent = async (setupIntentId: string, paymentMethodId: string): Promise<Stripe.SetupIntent> => {
    const setupIntent = await stripe.setupIntents.confirm(setupIntentId, {
        payment_method: paymentMethodId
    });
    return setupIntent;
};

const setDefaultPaymentMethod = async (customerId: string, paymentMethodId: string): Promise<Stripe.Customer> => {
    const customer = await stripe.customers.update(customerId, {
        invoice_settings: {
            default_payment_method: paymentMethodId
        }
    });
    return customer;
};

const retrievePaymentMethod = async (paymentMethodId: string): Promise<Stripe.PaymentMethod> => {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    return paymentMethod;
};

const detachPaymentMethod = async (paymentMethodId: string): Promise<Stripe.PaymentMethod> => {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return paymentMethod;
};

export {
    stripe,
    createCustomer,
    createCheckoutSession,
    retrieveCheckoutSession,
    retrieveSubscription,
    retrieveCustomer,
    constructWebhookEvent,
    retrieveInvoice,
    cancelSubscription,
    renewSubscription,
    listPaymentMethods,
    retrievePaymentMethod,
    createSetupIntent,
    confirmSetupIntent,
    setDefaultPaymentMethod,
    detachPaymentMethod
};
