import { createCrudStore } from "./createCrudStore";
import type { User } from "@/types";

export const useUsersStore = createCrudStore<User>("/users");
