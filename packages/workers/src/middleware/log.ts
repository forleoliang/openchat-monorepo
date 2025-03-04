import { ConnectError, type Interceptor } from "@connectrpc/connect";

export const logInterceptor: Interceptor = (next) => async (req) => {
	try {
		console.log("[Log Interceptor] Request:", req.method.name);
		const res = await next(req);
		return res;
	} catch (error) {
		if (error instanceof ConnectError) {
			console.error("[Log Interceptor] ConnectError:", {
				code: error.code,
				message: error.message,
				details: error.details,
				metadata: error.metadata,
			});
		} else {
			console.error("[Log Interceptor] Unexpected Error:", error);
		}
		throw error;
	}
};
