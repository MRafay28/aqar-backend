import mongoose from 'mongoose';
import config from '../config/default';
import { PlanType, SubscriptionPlanModel } from '../modules/subscription-plan/models/subscription-plan.model';
import { UserSubscriptionModel } from '../modules/subscription/models/user-subscription.model';

async function main() {
    await mongoose.connect(config.db.uri);
    const retiredAt = new Date();

    const plans = await SubscriptionPlanModel.updateMany(
        { planType: PlanType.MONTH_PLAN, isActive: { $ne: false } },
        { $set: { isActive: false } }
    );
    const activeSubscriptions = await UserSubscriptionModel.updateMany(
        { planType: PlanType.MONTH_PLAN, isActive: true },
        {
            $set: {
                isActive: false,
                credits: 0,
                premiumCredits: 0,
                purchaseCount: 0,
                endDate: retiredAt
            }
        }
    );
    const creditedSubscriptions = await UserSubscriptionModel.updateMany(
        {
            planType: PlanType.MONTH_PLAN,
            $or: [{ credits: { $ne: 0 } }, { premiumCredits: { $ne: 0 } }, { purchaseCount: { $ne: 0 } }]
        },
        {
            $set: {
                isActive: false,
                credits: 0,
                premiumCredits: 0,
                purchaseCount: 0
            }
        }
    );

    const [activePlans, usableSubscriptions] = await Promise.all([
        SubscriptionPlanModel.countDocuments({ planType: PlanType.MONTH_PLAN, isActive: true }),
        UserSubscriptionModel.countDocuments({
            planType: PlanType.MONTH_PLAN,
            $or: [{ isActive: true }, { credits: { $gt: 0 } }, { premiumCredits: { $gt: 0 } }]
        })
    ]);

    console.log(`Monthly plans deactivated: ${plans.modifiedCount}`);
    console.log(`Active monthly subscriptions retired: ${activeSubscriptions.modifiedCount}`);
    console.log(`Other monthly credit records cleared: ${creditedSubscriptions.modifiedCount}`);
    console.log(`Verification: active plans=${activePlans}, usable subscriptions=${usableSubscriptions}`);
    if (activePlans || usableSubscriptions) throw new Error('Monthly plan retirement verification failed');
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
