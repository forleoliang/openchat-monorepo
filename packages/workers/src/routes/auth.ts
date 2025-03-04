import { type ConnectRouter, Code, ConnectError } from "@connectrpc/connect";
import { SignJWT } from "jose";
import { customAlphabet } from "nanoid";
import { compareSync, hashSync } from "bcrypt-edge";
import { AuthService } from "@/gen/auth/v1/auth_pb";
import { QrCodeLoginStatus } from "@/gen/auth/v1/auth_pb";
import { getAuthInfo, getEnv } from "@/store-context";
import { sendSigninOtpEmail, sendSignupEmail } from "@/lib/email";
import service from "@/services";

function signJWT(userId: string, expiresTime: string) {
	return new SignJWT({
		userId,
	})
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime(expiresTime)
		.sign(new TextEncoder().encode(process.env.JWT_SECRET));
}

export function getAuthRoutes(router: ConnectRouter) {
	return router.service(AuthService, {
		signUp: async (req, ctx) => {
			const { email, username, password } = req;
			const env = getEnv(ctx);
			await service.users.createUser(env, {
				email,
				username,
				password: hashSync(password),
			});
			const code = customAlphabet("1234567890", 6)();
			await service.verificationCodes.createVerificationCode(env, {
				code,
				type: "signup",
				email,
				expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
			});
			await sendSignupEmail(email, username, code);
			return {};
		},
		verifyAccount: async (req, ctx) => {
			const { email, code } = req;
			const env = getEnv(ctx);
			const verificationCode =
				await service.verificationCodes.getActiveVerificationCode(
					env,
					email,
					code,
					"signup",
				);
			if (!verificationCode) {
				throw new ConnectError(
					"invalid verification code",
					Code.InvalidArgument,
				);
			}
			const user = await service.users.getUserByEmail(env, email);
			if (!user) {
				throw new ConnectError("user not found", Code.NotFound);
			}
			await service.users.updateUser(env, user.id, {
				emailVerifiedAt: new Date().toISOString(),
			});
			await service.verificationCodes.markVerificationCodeAsUsed(
				env,
				verificationCode.id,
			);
			const token = await signJWT(user.id, "1h");
			const userId = user.id;
			const expiresAt = new Date(
				Date.now() + 30 * 24 * 60 * 60 * 1000,
			).toISOString();
			const refreshToken = await service.refreshTokens.createRefreshToken(env, {
				userId,
				expiresAt,
				token: crypto.randomUUID(),
			});
			return { user, accessToken: token, refreshToken: refreshToken.token };
		},
		signInWithEmailPassword: async (req, ctx) => {
			const { email, password } = req;
			const env = getEnv(ctx);
			const user = await service.users.getUserWithPasswordByEmail(env, email);
			if (!user) {
				throw new ConnectError("user not found", Code.NotFound);
			}
			if (!compareSync(password, user.password)) {
				throw new ConnectError("invalid password", Code.InvalidArgument);
			}
			const token = await new SignJWT({
				userId: user.id,
			})
				.setProtectedHeader({ alg: "HS256" })
				.setExpirationTime("1h")
				.sign(new TextEncoder().encode(process.env.JWT_SECRET));
			const refreshToken = await service.refreshTokens.createRefreshToken(env, {
				userId: user.id,
				expiresAt: new Date(
					Date.now() + 30 * 24 * 60 * 60 * 1000,
				).toISOString(),
				token: crypto.randomUUID(),
			});
			return { user, accessToken: token, refreshToken: refreshToken.token };
		},
		sendSignInOtpEmail: async (req, ctx) => {
			const { email } = req;
			const env = getEnv(ctx);
			const code = customAlphabet("1234567890", 6)();
			await service.verificationCodes.createVerificationCode(env, {
				code,
				type: "signin",
				email,
				expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
			});
			await sendSigninOtpEmail(email, code);
			return {};
		},
		signInWithEmailCode: async (req, ctx) => {
			const { email, code } = req;
			const env = getEnv(ctx);
			const verificationCode =
				await service.verificationCodes.getActiveVerificationCode(
					env,
					email,
					code,
					"signin",
				);
			if (!verificationCode) {
				throw new ConnectError(
					"invalid verification code",
					Code.InvalidArgument,
				);
			}
			const user = await service.users.getUserByEmail(env, email);
			if (!user) {
				throw new ConnectError("user not found", Code.NotFound);
			}
			await service.verificationCodes.markVerificationCodeAsUsed(
				env,
				verificationCode.id,
			);
			const token = await signJWT(user.id, "1h");
			const refreshToken = await service.refreshTokens.createRefreshToken(env, {
				userId: user.id,
				expiresAt: new Date(
					Date.now() + 30 * 24 * 60 * 60 * 1000,
				).toISOString(),
				token: crypto.randomUUID(),
			});
			return { user, accessToken: token, refreshToken: refreshToken.token };
		},
		whoAmI: async (req, ctx) => {
			const { userId } = getAuthInfo(ctx);
			const env = getEnv(ctx);
			const user = await service.users.getUser(env, userId);
			if (!user) {
				throw new ConnectError("user not found", Code.NotFound);
			}
			return { user };
		},
		refreshToken: async (req, ctx) => {
			const env = getEnv(ctx);
			const refreshToken = await service.refreshTokens.getRefreshTokenByToken(
				env,
				req.refreshToken,
			);
			if (!refreshToken) {
				throw new ConnectError("invalid refresh token", Code.InvalidArgument);
			}
			const token = await signJWT(refreshToken.userId, "1h");
			const user = await service.users.getUser(env, refreshToken.userId);
			if (!user) {
				throw new ConnectError("user not found", Code.NotFound);
			}
			return { user, accessToken: token, refreshToken: refreshToken.token };
		},
		getLoginQrCode: async (req, ctx) => {
			const env = getEnv(ctx);
			const { qrCodeId, content, expiresIn } =
				await service.qrCodeLogins.createQrCodeLogin(env);
			return {
				qrCodeId,
				content,
				expiresIn: BigInt(expiresIn),
			};
		},
		scanQrCode: async (req, ctx) => {
			const { qrCodeId } = req;
			const { userId } = getAuthInfo(ctx);
			const env = getEnv(ctx);

			const qrCodeLogin = await service.qrCodeLogins.getQrCodeLoginById(
				env,
				qrCodeId,
			);
			if (!qrCodeLogin) {
				throw new ConnectError("QR code not found", Code.NotFound);
			}

			// 检查是否过期
			if (new Date(qrCodeLogin.expiresAt) < new Date()) {
				await service.qrCodeLogins.updateQrCodeLoginStatus(
					env,
					qrCodeId,
					"EXPIRED",
					userId,
				);
				throw new ConnectError("QR code has expired", Code.FailedPrecondition);
			}

			// 只有在待扫码状态才能扫码
			if (qrCodeLogin.status !== "PENDING") {
				throw new ConnectError(
					"QR code status is not valid for scanning",
					Code.FailedPrecondition,
				);
			}

			await service.qrCodeLogins.updateQrCodeLoginStatus(
				env,
				qrCodeId,
				"SCANNED",
				userId,
			);
			return {};
		},
		confirmQrCodeLogin: async (req, ctx) => {
			const { qrCodeId } = req;
			const { userId } = getAuthInfo(ctx);
			const env = getEnv(ctx);

			const qrCodeLogin = await service.qrCodeLogins.getQrCodeLoginById(
				env,
				qrCodeId,
			);
			if (!qrCodeLogin) {
				throw new ConnectError("QR code not found", Code.NotFound);
			}

			// 检查是否过期
			if (new Date(qrCodeLogin.expiresAt) < new Date()) {
				await service.qrCodeLogins.updateQrCodeLoginStatus(
					env,
					qrCodeId,
					"EXPIRED",
					userId,
				);
				throw new ConnectError("QR code has expired", Code.FailedPrecondition);
			}

			// 只有在已扫码状态才能确认
			if (qrCodeLogin.status !== "SCANNED") {
				throw new ConnectError(
					"QR code status is not valid for confirmation",
					Code.FailedPrecondition,
				);
			}

			// 确保是同一个用户在操作
			if (qrCodeLogin.userId !== userId) {
				throw new ConnectError(
					"Only the user who scanned the QR code can confirm it",
					Code.PermissionDenied,
				);
			}

			await service.qrCodeLogins.updateQrCodeLoginStatus(
				env,
				qrCodeId,
				"CONFIRMED",
				userId,
			);
			return {};
		},
		checkQrCodeLoginStatus: async (req, ctx) => {
			const { qrCodeId } = req;
			const env = getEnv(ctx);

			const qrCodeLogin = await service.qrCodeLogins.getQrCodeLoginById(
				env,
				qrCodeId,
			);
			if (!qrCodeLogin) {
				throw new ConnectError("QR code not found", Code.NotFound);
			}

			// 检查是否过期
			if (
				qrCodeLogin.status === "PENDING" &&
				new Date(qrCodeLogin.expiresAt) < new Date()
			) {
				await service.qrCodeLogins.updateQrCodeLoginStatus(
					env,
					qrCodeId,
					"EXPIRED",
				);
				return { status: QrCodeLoginStatus.EXPIRED };
			}

			let status = QrCodeLoginStatus.UNSPECIFIED;
			switch (qrCodeLogin.status) {
				case "PENDING":
					status = QrCodeLoginStatus.PENDING;
					break;
				case "SCANNED":
					status = QrCodeLoginStatus.SCANNED;
					break;
				case "CONFIRMED":
					status = QrCodeLoginStatus.CONFIRMED;
					break;
				case "EXPIRED":
					status = QrCodeLoginStatus.EXPIRED;
					break;
				case "CANCELLED":
					status = QrCodeLoginStatus.CANCELLED;
					break;
			}

			// 如果已确认登录，返回用户信息和令牌
			if (qrCodeLogin.status === "CONFIRMED" && qrCodeLogin.userId) {
				const user = await service.users.getUser(env, qrCodeLogin.userId);
				if (!user) {
					throw new ConnectError("User not found", Code.NotFound);
				}

				const token = await signJWT(user.id, "1h");
				const refreshToken = await service.refreshTokens.createRefreshToken(
					env,
					{
						userId: user.id,
						expiresAt: new Date(
							Date.now() + 30 * 24 * 60 * 60 * 1000,
						).toISOString(),
						token: crypto.randomUUID(),
					},
				);

				return {
					status,
					user,
					accessToken: token,
					refreshToken: refreshToken.token,
				};
			}

			return { status };
		},
	});
}
