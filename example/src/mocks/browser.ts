// src/mocks/browser.js
import { setupWorker } from "msw/browser";
import { mappedHandlers } from "./handlers";

export const worker = setupWorker(...mappedHandlers);
