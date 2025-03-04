import {
	ConnectError,
	Code,
	createContextKey,
	type HandlerContext,
} from "@connectrpc/connect";

export const EnvStore = createContextKey<Env | undefined>(undefined);

export const cfCtxStore = createContextKey<ExecutionContext | undefined>(
	undefined,
);

export function getEnv(ctx: HandlerContext) {
	const env = ctx.values.get(EnvStore);
	if (!env) {
		throw new ConnectError("Env is not set", Code.Internal);
	}
	return env;
}

export function getCfCtx(ctx: HandlerContext) {
	const cf = ctx.values.get(cfCtxStore);
	if (!cf) {
		throw new ConnectError("Ctx is not set", Code.Internal);
	}
	return cf;
}

export interface AuthInfo {
	userId: string;
}

export const AuthStore = createContextKey<AuthInfo | undefined>(undefined);

export function getAuthInfo(ctx: HandlerContext) {
	const authInfo = ctx.values.get(AuthStore);
	if (!authInfo) {
		throw new ConnectError("AuthInfo is not set", Code.Internal);
	}
	return authInfo;
}
