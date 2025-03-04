import { ConnectError, type Interceptor } from "@connectrpc/connect";
import { Code } from "@connectrpc/connect";
import { jwtVerify } from "jose";
import { EnvStore, type AuthInfo, AuthStore } from "@/store-context";

const PUBLIC_ROUTES: string[] = [
	"SignUp",
	"VerifyAccount",
	"SignInWithEmailPassword",
	"RefreshToken",
	"GetLoginQrCode",
	"CheckQrCodeLoginStatus",
];

async function verifyToken(token: string, env: Env): Promise<AuthInfo | null> {
	try {
		const secret = new TextEncoder().encode(env.JWT_SECRET);
		const { payload } = await jwtVerify(token, secret);
		return {
			userId: payload.userId as string,
		};
	} catch (error) {
		return null;
	}
}

export const authInterceptor: Interceptor = (next) => async (req) => {
	console.log("[Auth Interceptor] Request:", req.method.name);
	if (PUBLIC_ROUTES.includes(req.method.name)) {
		console.log("[Auth Interceptor] Public route, skipping auth");
		return next(req);
	}
	const token = req.header.get("authorization")?.replace("Bearer ", "");
	if (!token) {
		throw new ConnectError("no authorization token", Code.Unauthenticated);
	}
	const env = req.contextValues.get(EnvStore);
	if (!env) {
		throw new ConnectError("no env", Code.Internal);
	}
	const authInfo = await verifyToken(token, env);
	if (!authInfo) {
		throw new ConnectError("invalid authorization token", Code.Unauthenticated);
	}
	req.contextValues.set(AuthStore, authInfo);
	return next(req);
};
