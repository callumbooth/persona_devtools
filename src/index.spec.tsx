/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from "@testing-library/react";

import DexoryDevTools from "./";
import { DexoryDevToolsProps } from "./types";
import { withOption } from "./utils";

vi.mock("msw", () => ({
	setupWorker: () => ({ start: vi.fn(), stop: vi.fn() }),
}));

const RenderComponent = (
	props?: Partial<
		DexoryDevToolsProps<
			["requestA", "requestB"],
			any,
			{
				readonly [key: string]: {
					label: string;
					user: Record<string, any>;
					options: {
						requestA: string;
						requestB: string;
					};
				};
			}
		>
	>,
) => {
	return render(
		<DexoryDevTools
			onPersonaUpdate={vi.fn()}
			personas={{
				personaA: {
					label: "Persona A",
					user: {},
					options: {
						requestA: "mockA",
						requestB: "mockB",
					},
				},
				custom: {
					label: "custom",
					user: {},
					options: {
						requestA: "mockA",
						requestB: "mockB",
					},
				},
			}}
			defaultPersona={"custom"}
			handlers={{
				requestA: withOption({ mockA: true, mockB: false }, () => vi.fn()),
				requestB: withOption({ mockA: true, mockB: false }, () => vi.fn()),
			}}
			onHandlerUpdate={vi.fn()}
			initialIsEnabled={true}
			{...props}
		/>,
	);
};

describe("Devtools", () => {
	it("should set session storage on initialisation", () => {
		const storage = window.sessionStorage.getItem("dvdt");

		expect(storage).toBeNull();

		RenderComponent({ initialIsEnabled: false });

		expect(
			JSON.parse(window.sessionStorage.getItem("dvdt") as string),
		).toStrictEqual({
			enabled: false,
			persona: { persona: "custom" },
			handlers: {
				requestA: "mockA",
				requestB: "mockB",
			},
		});
	});

	it.todo(
		"should set enabled to true if the url contains a devtools query param",
	);

	it.todo("should show an select to change personas with the correct options");

	it.todo("should call the onPersonaUpdate when the persona changes");

	it.todo("should update the session storage when the persona changes");

	it.todo(
		"should update the session storage when the tools are enabled/disabled",
	);

	it.todo(
		"should update the session storage when the tools are enabled/disabled",
	);

	it.todo("should show a range of handler selects with the correct options");

	it.todo("should update the session storage when a handler option is changed");

	it.todo("should only show the handler options when persona is set to custom");

	it.todo("should only show the handler options when persona is set to custom");

	it.todo("should show a range of additional options");

	it.todo(
		"should copy the config to the clipboard when the share url is pressed",
	);

	it.todo("should update the selected persona if the url contains a persona");

	it.todo(
		"should update the selected persona if session storage has a persona",
	);

	it.todo(
		"should update the selected persona to the correct persona if the url and session storage contains a persona",
	);

	it.todo("should update the handlers if the url contains handlers");

	it.todo("should update the handlers if session storage has handlers");

	it.todo(
		"should update the handlers to the correct persona if the url and session storage contains hanlders",
	);

	it.todo("should not update the handlers if the persona is not custom");

	it.todo("should update the additional if the url contains additional");

	it.todo("should update the additional if session storage has additional");

	it.todo(
		"should update the additional to the correct persona if the url and session storage contains hanlders",
	);

	it.todo("should not update the additional if the persona is not custom");

	it.todo(
		"should call onAdditionalUpdate callback when additionalData changes",
	);

	it.todo(
		"should call onHandlerUpdate callback when handler changes and devtools is enabled",
	);

	it.todo(
		"should not call onHandlerUpdate callback when handler changes and devtools is enabled",
	);

	it.todo(
		"should start the worker and call onHandlerUpdate when the devtools are enabled",
	);

	it.todo(
		"should stop the worker and call onHandlerUpdate when the devtools are disabled",
	);
});
