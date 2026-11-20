import type { Permissions } from "./role";

export type SessionUser = {
  nom: string;
  prenom: string;
  role: string;
  /** Permissions du rôle, renvoyées par `/auth/login` puis relues par `/auth/moi`. */
  permissions?: Permissions;
};

export type LoginResponse = {
  access_token: string;
  user: SessionUser;
};
