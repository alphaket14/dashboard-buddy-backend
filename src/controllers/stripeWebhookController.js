import Stripe from "stripe";
import Payout from "../models/payout.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature and extract the event
    event = stripe.webhooks.constructEvent(
      req.rawBody, // raw request body (must be captured before parsing)rs
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event based on its type
    switch (event.type) {
      case 'transfer.created':
        await handleTransferCreated(event.data.object);
        break;

      case 'transfer.updated':
        await handleTransferUpdated(event.data.object);
        break;

      case 'transfer.failed':
        await handleTransferFailed(event.data.object);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;

      // Add more cases for other event types you're interested in

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    // Still return a 200 to acknowledge receipt (don't want Stripe to retry)
    res.status(200).json({
      received: true,
      error: err.message
    });
  }
};

/**
 * Handle transfer.created events
 * @param {Object} transfer The Stripe transfer object
 */
async function handleTransferCreated(transfer) {
  console.log('Transfer created:', transfer.id);

  try {
    // Find the payout in our database using the transfer ID
    const payout = await Payout.findOne({
      where: { stripePayoutId: transfer.id }
    });

    if (!payout) {
      console.log(`No matching payout found for transfer ${transfer.id}`);
      return;
    }

    // Update the status if needed
    if (payout.status !== transfer.status) {
      payout.status = transfer.status;
      await payout.save();
    }

    // Notify the user about the transfer creation
    // Implement notification logic here
  } catch (error) {
    console.error('Error handling transfer.created event:', error);
  }
}

/**
 * Handle transfer.updated events
 * @param {Object} transfer The Stripe transfer object
 */
async function handleTransferUpdated(transfer) {
  console.log('Transfer updated:', transfer.id);

  try {
    // Find the payout in our database using the transfer ID
    const payout = await Payout.findOne({
      where: { stripePayoutId: transfer.id }
    });

    if (!payout) {
      console.log(`No matching payout found for transfer ${transfer.id}`);
      return;
    }

    // Update the status
    payout.status = transfer.status;
    await payout.save();

    // Implement notification logic if needed
  } catch (error) {
    console.error('Error handling transfer.updated event:', error);
  }
}

/**
 * Handle transfer.failed events
 * @param {Object} transfer The Stripe transfer object
 */
async function handleTransferFailed(transfer) {
  console.log('Transfer failed:', transfer.id);

  try {
    const transaction = await db.sequelize.transaction();

    // Find the payout in our database using the transfer ID
    const payout = await Payout.findOne({
      where: { stripePayoutId: transfer.id },
      transaction
    });

    if (!payout) {
      await transaction.rollback();
      console.log(`No matching payout found for transfer ${transfer.id}`);
      return;
    }

    // Update the status
    payout.status = 'failed';
    await payout.save({ transaction });

    // Credit the amount back to the user's wallet since the payout failed
    const user = await db.User.findByPk(payout.userId, { transaction });
    if (user) {
      user.walletBalance = parseFloat(user.walletBalance) + parseFloat(payout.amount);
      await user.save({ transaction });

      // Record the failed payout reversal in earnings history
      await db.EarningHistory.create({
        userId: payout.userId,
        amount: payout.amount,
        type: 'refund',
        reference: payout.id,
        description: `Failed payout refund - ${transfer.id}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { transaction });
    }

    await transaction.commit();

    // Implement notification logic here
  } catch (error) {
    console.error('Error handling transfer.failed event:', error);
  }
}

/**
 * Handle account.updated events
 * @param {Object} account The Stripe account object
 */
async function handleAccountUpdated(account) {
  console.log('Account updated:', account.id);

  try {
    // Find the account in our database
    const stripeAccount = await db.StripeAccount.findOne({
      where: { accountId: account.id }
    });

    if (!stripeAccount) {
      console.log(`No matching Stripe account found for ${account.id}`);
      return;
    }

    // Update capabilities and requirements status if needed
    if (account.capabilities) {
      stripeAccount.capabilities = JSON.stringify(account.capabilities);
    }

    if (account.requirements) {
      stripeAccount.requirementsStatus = account.requirements.currently_due.length === 0 ? 'complete' : 'incomplete';
    }

    await stripeAccount.save();

    // Implement notification logic for users if needed
  } catch (error) {
    console.error('Error handling account.updated event:', error);
  }
}