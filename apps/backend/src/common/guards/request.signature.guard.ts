// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import * as crypto from 'crypto';
// import { Request } from 'express';
// import { MessageParams } from '../types/global.types';
// import { AppHelperService } from '../helpers/app.helper';
// import { Config } from '../routes/v1/config/entities/config.entity';
// import { ConfigService } from '../routes/v1/config/config.service';
// import { ConfigEnum } from '../enums/config.enum';
// import { RequestNonceService } from '../routes/v1/request-nonce/request-nonce.service';
// import { RequestNonce } from '../routes/v1/request-nonce/entities/request-nonce.entity';
// import { CreateRequestNonceDto } from '../routes/v1/request-nonce/dto/create-request-nonce.dto';

// @Injectable()
// export class RequestSignatureGuard implements CanActivate {
//   private readonly encryptionAlgorithm: string;

//   constructor(
//     private readonly configService: ConfigService,
//     private readonly requestNonceService: RequestNonceService,
//   ) {
//     this.encryptionAlgorithm = await this.configService.get<string>('enc_alg');
//   }
//   // private readonly encryptionAlgorithm: string = process.env.ENCRYPTION_ALGORITHM;
//   private readonly encryptionAlgorithm: string = await this.configService.get<string>('enc_alg');

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request: Request = context.switchToHttp().getRequest();

//     const signatureBasedAuth: boolean = await this.configService.validateConfigValue({
//       key: ConfigEnum.SIGNATURE_BASED_AUTH,
//     } as Partial<Config>);

//     if (!signatureBasedAuth) {
//       return true;
//     }

//     const timestamp: number = +request?.headers?.['x-timestamp'];
//     const signature: string | undefined = request?.headers?.['x-signature'] as string;
//     const nonce: string = request?.headers?.['x-request-nonce'] as string;
//     const clientId: string = request?.headers?.['x-client-id'] as string;

//     if (!signature || !clientId || !nonce || !timestamp) {
//       return false;
//     }

//     const isValidTimestamp: boolean = await this.validateTimestamp(timestamp);

//     if (!isValidTimestamp) {
//       return false;
//     }

//     const validNonce: boolean = await this.verifyNonce(nonce, request);

//     if (!validNonce) {
//       return false;
//     }

//     const messageParams: MessageParams = {
//       url: request?.originalUrl,
//       body: request?.body,
//       nonce,
//       timestamp,
//     } as MessageParams;

//     const message: string = JSON.stringify(messageParams);

//     const clientKey: string = await this.getClientKey(clientId);

//     return this.validateSignature(message, signature, clientKey);
//   }

//   private async getClientKey(clientId: string): Promise<string> {
//     const clientInfo: Config = await this.configService.findOneByProp({ key: clientId } as Partial<Config>);

//     if (!clientInfo) return '';

//     const keyInformation = JSON.parse(clientInfo?.value);

//     return AppHelperService.decrypt(keyInformation?.clientKey);
//   }

//   private async validateTimestamp(timestamp: number): Promise<boolean> {
//     if (!timestamp) {
//       return false;
//     }

//     const config: Config = await this.configService.findOneByProp({ key: ConfigEnum.REQUEST_SIGNATURE_EXPIRY } as Partial<Config>);

//     return AppHelperService.isWithinMinutesAfter(timestamp, parseInt(config.value, 10));
//   }

//   private async verifyNonce(nonce: string, req: Request): Promise<boolean> {
//     const prevReqWithSameNonce: RequestNonce = await this.requestNonceService.findOneByProp({
//       nonce,
//       requestMethod: req?.method,
//       requestUrl: req?.originalUrl,
//     } as Partial<RequestNonce>);

//     if (!prevReqWithSameNonce) {
//       await this.requestNonceService.create({
//         nonce,
//         requestMethod: req?.method,
//         requestUrl: req?.originalUrl,
//       } as CreateRequestNonceDto);
//     }

//     return !prevReqWithSameNonce;
//   }

//   private validateSignature(message: string, clientSignature: string, secret: string): boolean {
//     const signature: string = crypto.createHmac(this.encryptionAlgorithm, secret).update(message).digest('hex');

//     return signature === clientSignature;
//   }
// }
