import pipe from "ramda/es/pipe";
import create from "zustand";
import { zustandImmerMiddleware } from "./zustandImmerMiddleware";

export const createStoreWithImmerMiddleware = pipe(
  zustandImmerMiddleware,
  create
);
