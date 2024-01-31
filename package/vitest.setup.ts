import { vi } from "vitest";

vi.mock("msw/browser", () => ({
	setupWorker: () => ({ start: vi.fn(), stop: vi.fn() }),
}));
