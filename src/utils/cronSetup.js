import cron from 'node-cron';
import axios from 'axios';

/**
 * Setup cron job for weekly payouts
 * This should be called when the server starts
 */
export function setupPayoutCronJob() {
  // Schedule job to run every Friday at 2:00 AM
  cron.schedule('0 2 * * 5', async () => {
    console.log('Running weekly payout cron job:', new Date().toISOString());

    try {
      // Make an API call to our own endpoint to process payouts
      const response = await axios.post(
        `${process.env.API_BASE_URL}/api/payouts/weekly`,
        {},
        {
          headers: {
            'x-api-key': process.env.CRON_API_KEY,
            'Authorization': `Bearer ${process.env.ADMIN_JWT_TOKEN}`
          }
        }
      );

      console.log('Weekly payout process completed:', response.data);
    } catch (error) {
      console.error('Error processing weekly payouts:', error.message);
    }
  }, {
    scheduled: true,
    timezone: "UTC" // Adjust to your preferred timezone
  });

  console.log('Weekly payout cron job scheduled');
}        
