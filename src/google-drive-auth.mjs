import { google } from 'googleapis';
import readline from 'node:readline';

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const redirectUri = 'http://localhost';

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
const scopes = ['https://www.googleapis.com/auth/drive.file'];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent',
});

console.log('Abre esta URL en el navegador y autoriza el acceso:');
console.log(url);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('\nCopia aquí el código que te devolvió Google: ', async code => {
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log('\nTokens obtenidos:');
    console.log(JSON.stringify(tokens, null, 2));
  } catch (error) {
    console.error('Error obteniendo tokens:', error.message);
  } finally {
    rl.close();
  }
});