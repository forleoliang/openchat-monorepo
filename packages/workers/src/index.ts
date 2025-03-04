import { handler } from "@/handler";

export default {
	async fetch(request, env, ctx): Promise<Response> {
		Object.assign(process.env, env);
		const origin = request.headers.get("Origin");
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: {
					"Access-Control-Allow-Origin": origin ?? "*",
					"Access-Control-Allow-Methods": "POST",
					"Access-Control-Allow-Headers": "*",
					"Access-Control-Max-Age": "86400",
				},
			});
		}
		if (request.method === "GET") {
			return env.ASSETS.fetch(request);
		}
		const response = await handler.fetch(request, env, ctx);
		const corsHeaders = new Headers(response.headers);
		corsHeaders.set("Access-Control-Allow-Origin", origin ?? "*");
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: corsHeaders,
		});
	},
} satisfies ExportedHandler<Env>;
