import { zodFunction } from "openai/helpers/zod";
import { z } from "zod";

export const generateImageTool = zodFunction({
	name: "generate_image",
	parameters: z.object({
		prompt: z.string().describe("The prompt to generate an image for"),
	}),
	description: "Generate an image",
});

export async function generateImage(env: Env, prompt: string) {
	const response = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
		prompt,
		steps: 8,
	});
	const binaryString = atob(response.image!);
	const img = Uint8Array.from(binaryString, (m) => m.codePointAt(0)!);
	const key = `imgaes/${crypto.randomUUID()}.png`;
	await env.BUCKET.put(key, new Blob([img], { type: "image/png" }));
	return `${env.BUCKET_CDN}/${key}`;
}
