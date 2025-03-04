import {
	createClient,
	type Interceptor,
	Code,
	ConnectError,
} from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { ChatService } from "~/gen/chat/v1/chat_pb";
import { AuthService } from "~/gen/auth/v1/auth_pb";
import { useAuthStore } from "~/stores/auth";
import { FileService } from "~/gen/file/v1/file_pb";

// 刷新token相关状态
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// 添加认证头的拦截器
const authInterceptor: Interceptor = (next) => async (req) => {
	const token = useAuthStore.getState().token;
	if (token) {
		req.header.append("Authorization", `Bearer ${token}`);
	}
	return await next(req);
};

// 处理认证失败并自动刷新token的拦截器
const refreshTokenInterceptor: Interceptor = (next) => async (req) => {
	try {
		return await next(req);
	} catch (error) {
		// 只处理认证失败的错误
		if (
			!(error instanceof ConnectError && error.code === Code.Unauthenticated)
		) {
			throw error;
		}

		const authState = useAuthStore.getState();
		const refreshToken = authState.refreshToken;

		// 如果没有刷新token，无法自动刷新，直接抛出错误
		if (!refreshToken) {
			throw error;
		}

		// 如果已经在刷新token，等待刷新完成后重试请求
		if (isRefreshing && refreshPromise) {
			await refreshPromise;
			// 更新请求头中的token
			req.header.set(
				"Authorization",
				`Bearer ${useAuthStore.getState().token}`,
			);
			return await next(req);
		}

		// 开始刷新token
		isRefreshing = true;
		try {
			// 创建一个Promise来处理token刷新
			refreshPromise = new Promise((resolve, reject) => {
				authClient
					.refreshToken({ refreshToken })
					.then((response) => {
						authState.signIn(
							response.accessToken,
							response.refreshToken,
							response.user!,
						);
						resolve();
					})
					.catch((refreshError) => {
						authState.signOut();
						window.location.href = "/signin";
						reject(refreshError);
					})
					.finally(() => {
						isRefreshing = false;
						refreshPromise = null;
					});
			});

			await refreshPromise;

			// 刷新成功后更新当前请求的token并重试
			req.header.set(
				"Authorization",
				`Bearer ${useAuthStore.getState().token}`,
			);
			return await next(req);
		} catch (refreshError) {
			// 刷新失败，抛出原始错误
			throw error;
		}
	}
};

export const transport = createConnectTransport({
	baseUrl: import.meta.env.PROD
		? import.meta.env.VITE_API_URL
		: "http://localhost:8787",
	interceptors: [authInterceptor, refreshTokenInterceptor],
});

export const chatClient = createClient(ChatService, transport);
export const authClient = createClient(AuthService, transport);
export const fileClient = createClient(FileService, transport);
