import Agenda from 'agenda';
import config from '../config/default';
import logger from '../utils/logger';

// Use the same MongoDB URI as your main app, or a dedicated one for jobs
const agenda = new Agenda({ db: { address: config.db.uri, collection: 'agendaJobs' } });

// Example: Define a job that runs every 5 minutes
agenda.define('log heartbeat', () => {
    logger.info('Agenda heartbeat job: runs every 5 minutes');
});

// Example: Define a job that could send emails (placeholder)
agenda.define('send daily summary email', () => {
    logger.info('Agenda job: send daily summary email');
});

export async function setupAgendaJobs() {
    await agenda.start();
    await agenda.every('5 minutes', 'log heartbeat');
    await agenda.every('0 0 * * *', 'send daily summary email'); // At midnight every day
    await agenda.every('1 hour', 'expire premium ads'); // Check every hour for expired premium ads
}

// Export agenda for custom job registration
export default agenda;
