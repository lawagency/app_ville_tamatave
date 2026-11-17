import type { Permissions } from "./role";

export type SessionUser = {
  nom: string;
  prenom: string;
  role: string;
  /** Permissions du rôle, renvoyées par `/auth/login`. */
  permissions?: Permissions;
};

export type LoginResponse = {
  access_token: string;
  user: SessionUser;
};
