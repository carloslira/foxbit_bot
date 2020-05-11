/* eslint-disable no-console */

import WebSocket from 'ws';
import readlineSync from 'readline-sync';

import logger from './logger';

const baseURL = 'wss://api.foxbitapi.com.br/WSGateway/';

export const GetUserInfo = 'GetUserInfo';
export const Authenticate2FA = 'Authenticate2FA';
export const WebAuthenticateUser = 'WebAuthenticateUser';

export class API {
    constructor() {
        this.userID = '';
        this.username = '';
        this.sessionToken = '';
        this.isAuthenticated = false;

        this.messageFrame = {
            m: 0, // MessageType (0_Request / 1_Reply / 2_Subscribe / 3_Event / 4_Unsubscribe / Error)
            i: 0, // Sequence Number
            n: '', // Function Name
            o: '', // Payload
        };

        const messageListener = (data) => { this.handleMessage(data); };
        messageListener.bind(this);

        this.ws = new WebSocket(baseURL);
        this.ws.on('message', messageListener);
    }

    authenticate() {
        console.log('\r\n');

        this.username = readlineSync.question('Username: ');

        this.send(WebAuthenticateUser, {
            UserName: this.username,
            Password: readlineSync.question('Password: ', { hideEchoBack: true }),
        });

        console.log('\r\n');
    }

    authenticate2FA() {
        if (this.sessionToken === '') {
            console.log('\r\n');

            this.send(Authenticate2FA, {
                Code: readlineSync.question('Code: '),
            });

            console.log('\r\n');
        } else {
            this.send(WebAuthenticateUser, {
                UserId: this.userID,
                SessionToken: JSON.parse(this.sessionToken),
            });

            this.getUserInfo();
        }
    }

    getUserInfo() {
        this.send(GetUserInfo, {});
    }

    handleMessage(data) {
        const messageFrame = JSON.parse(data);
        const payload = JSON.parse(messageFrame.o);

        logger.info(`Receiving <- (${messageFrame.n}) : ${JSON.stringify(payload, null, 2)}`);

        switch (messageFrame.n) {
        case WebAuthenticateUser:
            if (!this.isAuthenticated) {
                if (payload.errormsg) {
                    this.authenticate();
                } else {
                    this.authenticate2FA();
                }
            }

            break;

        case Authenticate2FA:
            this.isAuthenticated = payload.Authenticated;
            if (this.isAuthenticated) {
                this.userID = JSON.stringify(payload.UserId);
                this.sessionToken = JSON.stringify(payload.SessionToken);

                logger.info(`Access granted for ${this.username}`);
            }

            break;

        default:
            break;
        }
    }

    send(action, payload) {
        this.messageFrame.n = action;
        this.messageFrame.o = JSON.stringify(payload);

        this.ws.send(JSON.stringify(this.messageFrame), (err) => {
            if (err) {
                logger.error(err);
            }
        });
    }
}
