import { UserDocument } from '@database/types/collection';

export type Auth0UserInfo = {
  sub: string;
  name: string;
  email: string;
  email_verified: boolean;
};

export type Variables = {
  user?: UserDocument;
};

export type SessionTokenResponse = {
  access_token: string;
  id_token: string;
  expires_in: number;
};

export type SessionUser = {
  sub: string;
};
