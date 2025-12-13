/* eslint-disable prettier/prettier */
// src/socket/socket.gateway.ts

import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Flash } from 'src/core/entities/flash/flash.entity';
import axios from 'axios';
import { io, Socket as ClientSocket } from 'socket.io-client';
import { Logger4jsService } from '@app/nestjs';
import { Inject } from '@nestjs/common';

@WebSocketGateway({ namespace: '/ws', cors: { origin: '*' } })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private erpSocket: ClientSocket | null = null;
  private erpToken: string | null = null;

  private  ERP_AUTH_URL: string='http://localhost:3335/posgpt-backend/api/v1/auth/login';
  private  ERP_WS_URL: string='http://localhost:3335/ws'
  private  ERP_LOGIN: string='admin';
  private  ERP_PASSWORD: string='admin';

  private readonly JWT_SECRET = process.env.JWT_SECRET; // remplace par ton secret en prod
 
  @Inject(Logger4jsService)
  private logger: Logger4jsService;



  afterInit(server: Server) {
      console.log('zzvvvvvv56565', process.env.ERP_AUTH_URL);
      
    // Middleware handshake: validate token existance & optionally JWT
    server.use((socket: any, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) {
          return next(new Error('Auth token missing'));
        }

        // Exemple de validation JWT : décommenter si tu utilises JWT
        try {
          //const payload = jwt.verify(token, this.JWT_SECRET);
         

          //socket.data.user = payload; // stocker l'info utilisateur sur le socket
          socket.data.token = token;
          return next();
        } catch (jwtErr) {
          //console.error('Token invalide au handshake: ' + jwtErr.message);
          return next(new Error('Invalid token'));
        }

      } catch (err) {
        console.error('Handshake error: ' + err.message);
        //console.error('Handshake error: ' + err.message);
        return next(new Error('Handshake error'));
      }
    });
  }

  handleConnection(client: Socket) {
    //console.log(`Client connected: ${client.id} (ns=${client.nsp.name})`);
    //console.debug(`Client handshake data: ${JSON.stringify(client.handshake.auth)}`);
    console.log(`Client connected: ${client.id} `);
    console.debug(`Client handshake data: ${JSON.stringify(client.handshake.auth)}`);

    // Optionnel : initialiser connexion ERP la première fois (non bloquant)
    // on démarre une tentative de connexion au ERP si nécessaire (async fire-and-forget)
    if (!this.erpSocket || !this.erpSocket.connected) {
      this.connectToErp().catch((e) => {
          console.error('Impossible de se connecter immédiatement à l’ERP: ' + e.message);
      });
    }
  }
  

  handleDisconnect(client: Socket) {
    console.info(`Client disconnected: ${client.id}`);
  }

  // ---------- MAIN EVENT: receive weight ----------
  @SubscribeMessage('sendWeight')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    try {
      //console.log(`Received sendWeight from ${client.id} — raw: ${typeof data === 'string' ? 'string' : 'object'}`);
      console.log(`Received sendWeight from ${client.id} — raw: ${typeof data === 'string' ? 'string' : 'object'}`);

      // Supporter les 2 cas : string JSON ou objet
      let pload = data;
      console.log('payload5545454', pload);
      if (typeof data === 'string') {
        try {
          pload = JSON.parse(data);
        } catch (e) {
          console.warn('Payload non JSON reçu');
        }
      }
      // vérification optionnelle du token message (si client envoie token dans data)
      const token = (pload && pload.auth_token) ? pload.auth_token : client.data?.token;

      // 1) sauvegarde et forwarding
      const saved = await this.saveAndForward(pload.payload, token, client);

      if(saved && pload.payload.station){
        this.purgeOld(pload.payload.station, 1);
      }
      // 2) informer l'émetteur (ack) — la valeur retournée sert d'ACK au client
      //    En plus : on envoie un événement asynchrone 'sentWeightData' au client pour info.
      client.emit('sentWeightData', { status: 'success', data: saved });

      return { status: 'ok', savedId: saved?.id ?? null };
    } catch (err) {
      console.error('Erreur interne handleMessage: ' + (err?.message ?? err));
      // En cas d'erreur, on notifie le client et on retourne l'erreur comme ACK.
      client.emit('sentWeightData', { status: 'error', message: err?.message ?? 'unknown error' });
      return { status: 'error', message: err?.message ?? 'unknown error' };
    }
  }

  // ---------- Exemple de sauvegarde + forward (adapter selon ta DB/service) ----------
private async saveAndForward(payload: any, token: string , client: Socket) {
  console.log('saveAndForward démarré');

  // 1) Sauvegarde locale via ton entity (Flash.save attend un objet JS)
  //    Ton code original faisait: const saved = await Flash.save(JSON.parse(data));
  //    Ici on s'attend à recevoir un objet
  let saved;
  try {
    // Si tu utilises ton service: await this.flashService.createRecord(payload);

    if (typeof payload === 'string') {
      payload = JSON.parse(payload);
    }
    

    saved = await Flash.save(payload); // garde ton usage existant
    console.log('Enregistrement Flash OK id=' + saved?.id);
  } catch (dbErr) {
    //console.error('Erreur sauvegarde Flash: ' + dbErr.message);
    console.error('Erreur sauvegarde Flash: ' + dbErr.message);
    throw dbErr;
  }

  // 2) Forward vers ERP (si nécessaire) — non bloquant mais on peut tenter
  try {
    // Si tu as besoin du token ERP, vérifie s'il est disponible, sinon tente une auth
    if (!this.erpToken) {
      await this.obtainErpTokenIfNeeded();
    }
    /*if (this.erpToken) {
      // Ex: POST vers API ERP
      console.log('Forward22',this.erpToken);
      try {
        await axios.post(`${process.env.ERP_API_URL ?? 'http://localhost:3335'}/api/receive`, saved, {
          headers: { Authorization: `Bearer ${this.erpToken}` },
          timeout: 5000,
        });
        console.log('Forward vers ERP réussi (HTTP).');
      } catch (httpErr) {
        console.warn('Forward vers ERP échoué (HTTP): ' + (httpErr?.message ?? httpErr));
        // Ne throw pas — on continue
      }
    }*/
    // Optionnel: forward via socket à un namespace ERP
    if (this.erpSocket && this.erpSocket.connected) {
      console.log('azazazazaza',this.erpSocket)
      this.erpSocket.emit('new_Item_to_erp', saved);
    }
  } catch (forwardErr) {
    console.log('Erreur forward: ' + forwardErr?.message ?? forwardErr);
  }

  // NE PAS déconnecter le client ici ! On laisse la connexion ouverte pour de futurs envois.
  return saved;
}

async purgeExceptLast(station: string, keep = 1) {
  await Flash.getRepository()
    .createQueryBuilder()
    .delete()
    .from(Flash)
    .where(`station = :station`)
    .andWhere(
      `id NOT IN (
        SELECT id FROM (
          SELECT id
          FROM flash
          WHERE station = :station
          ORDER BY created_at DESC
          LIMIT :keep
        ) AS t
      )`
    )
    .setParameters({ station, keep })
    .execute();
}


async purgeOld(station: string, keep = 1) {
  await Flash.getRepository().query(
    `
    DELETE FROM flash
    WHERE station = ?
    AND id NOT IN (
        SELECT id FROM (
            SELECT id
            FROM flash
            WHERE station = ?
            ORDER BY created_at DESC
            LIMIT ?
        ) AS t
    )
    `,
    [station, station, keep]
  );
}
 
  // ---------- Helpers pour ERP ----------
private async obtainErpTokenIfNeeded() {

  if (this.erpToken) {
    return this.erpToken;
  }
  if (!this.ERP_LOGIN || !this.ERP_PASSWORD) {
   this.erpToken= await axios.post('http://localhost:3335/posgpt-backend/api/v1/auth/login', {
      username:  'admin',
      password:  'admin',
    }, { timeout: 5000 }).then(resp=>resp?.data?.token ?? null).catch(err=>{
      console.warn('Erreur auth ERP: ' + (err?.message ?? err));
      return null;
    });
  }
   
  try {
    const resp = await axios.post('http://localhost:3335/posgpt-backend/api/v1/auth/login', {
     username:  'admin',
      password: 'admin',
    }, { timeout: 5000 });
    this.erpToken = resp?.data?.token ?? null;
    return this.erpToken;
  } catch (err) {
    console.warn('Erreur auth ERP: ' + (err?.message ?? err));
    return null;
  }
}

private async connectToErp() {
  try {
    // si on a pas de token, tente d'en obtenir un (mais ne bloque pas le gateway)
    await this.obtainErpTokenIfNeeded();
    if (!this.erpToken) {
      console.warn('Pas de token ERP — connexion socket ERP non tentée.');
      return;
    }

    if (this.erpSocket && this.erpSocket.connected) {
      console.log('ERP socket déjà connecté');
      return;
    }
    console.log('Token ERP pour socket:', this.erpToken);
    this.erpSocket = io('http://localhost:3335/ws', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 0,
      auth: { token: this.erpToken },
    });

    this.erpSocket.on('connect', () => {
      console.log('Connecté au WS ERP');
    });

    this.erpSocket.on('connect_error', (err: any) => {
      console.warn('Erreur connexion ERP Socket: ' + (err?.message ?? err));
    });

    this.erpSocket.on('disconnect', (reason: any) => {
      console.warn('Déconnecté du ERP Socket: ' + reason);
      // la lib gère la reconnexion
    });

  } catch (err) {
    console.error('connectToErp exception: ' + (err?.message ?? err));
  }
}

  // ---------- events utilitaires ----------
  @SubscribeMessage('closesession')
  handleCloseSession(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('closesession request from ' + client.id);
    // si on veut forcer la déconnexion d'un client qui le demande:
    try {
      client.emit('closesession', { response: 'Session fermée par requête client', data });
      // Si tu veux déconnecter proprement:
      client.disconnect(true);
      console.log(`Client ${client.id} déconnecté à la demande.`);
      return { status: 'ok' };
    } catch (e) {
      console.warn('Erreur closesession: ' + e.message);
      return { status: 'error', message: e.message };
    }
  }

  // autres handlers simples
  @SubscribeMessage('create_action')
  handleStartShelling(@MessageBody() data: any) {
    this.server.emit('create_action', { response: 'create_action', data });
  }

  @SubscribeMessage('new_Item')
  handleCreate(@MessageBody() data: any) {
    this.server.emit('create_action', { response: 'create_action', data });
  }
}
