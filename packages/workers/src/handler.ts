import { createContextValues } from "@connectrpc/connect";
import { createWorkerHandler } from "@/worker-handler";
import { EnvStore, cfCtxStore } from "@/store-context";
import { authInterceptor } from "@/middleware/auth";
import { logInterceptor } from "@/middleware/log";
import { getAuthRoutes } from "@/routes/auth";
import { getChatRoutes } from "@/routes/chat";
import { getFileRoutes } from "@/routes/file";

export const handler = createWorkerHandler({
	contextValues(req, env, ctx) {
		return createContextValues().set(EnvStore, env).set(cfCtxStore, ctx);
	},
	interceptors: [authInterceptor, logInterceptor],
	routes: (router) => {
		getAuthRoutes(router);
		getChatRoutes(router);
		getFileRoutes(router);
	},
});
