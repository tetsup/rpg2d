export type User = {
  id: string;
  email?: string;
  name?: string;
  roles: string[];
};

export type Variables = {
  user?: User;
};

export type Auth0TokenResponse = {
  access_token: string;
  id_token: string;
  expires_in: number;
};

export type Auth0User = {
  sub: string;
  email?: string;
  name?: string;
};
