import { setupServer } from "msw/node";
import { staticHandlers } from "./handlers";

export const server = setupServer(...staticHandlers.handlers);
