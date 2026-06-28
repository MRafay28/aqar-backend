import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT);

server.on('listening', () => {
    console.log(`Server is running on port ${PORT}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
        console.error(
            `Port ${PORT} is already in use. Each PM2 app needs a unique PORT in its .env (staging vs prod).`
        );
    } else {
        console.error(`Failed to start server: ${error.message}`);
    }
    process.exit(1);
});
