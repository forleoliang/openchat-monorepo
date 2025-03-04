import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Stack,
	HStack,
	Heading,
	VStack,
	Field,
	Input,
	Button,
	Link as ChakraLink,
	AbsoluteCenter,
	Spinner,
	Text,
	Box,
	Tabs,
	QrCode,
} from "@chakra-ui/react";
import { platform } from "@tauri-apps/plugin-os";
import { Link, useNavigate } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authClient } from "~/client";
import { useAuthStore } from "~/stores/auth";
import { toaster } from "~/components/ui/toaster";
import { PasswordInput } from "~/components/ui/password-input";
import bgImg from "~/assets/login-bg.png";
import { LuMail, LuQrCode } from "react-icons/lu";
import { QrCodeLoginStatus } from "~/gen/auth/v1/auth_pb";
import { useEffect } from "react";

export default function SignIn() {
	const navigate = useNavigate();

	const schema = z.object({
		email: z.string().min(1, { message: "邮箱不能为空" }),
		password: z.string().min(1, { message: "密码不能为空" }),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const defaultTab = (() => {
		try {
			const p = platform();
			return p === "android" || p === "ios" ? "email_password" : "qr_code";
		} catch (error) {
			return "email_password";
		}
	})();

	const onSubmit = (data: z.infer<typeof schema>) => {
		mutation.mutate(data);
	};

	const { data: qrCodeData, isLoading: isQrCodeLoading } = useQuery({
		queryKey: ["qrcode"],
		queryFn: async () => {
			return await authClient.getLoginQrCode({});
		},
	});

	const { data: qrCodeStatus } = useQuery({
		queryKey: ["check-qrcode-status"],
		queryFn: async () => {
			return await authClient.checkQrCodeLoginStatus({
				qrCodeId: qrCodeData?.qrCodeId,
			});
		},
		enabled: !!qrCodeData?.qrCodeId,
		refetchInterval: 1000,
	});

	useEffect(() => {
		if (qrCodeStatus?.status === QrCodeLoginStatus.SCANNED) {
			toaster.success({
				title: "扫码成功",
				description: "请在手机上确认登录",
			});
		}
		if (qrCodeStatus?.status === QrCodeLoginStatus.CONFIRMED) {
			if (
				!qrCodeStatus.accessToken ||
				!qrCodeStatus.refreshToken ||
				!qrCodeStatus.user
			) {
				throw new Error("accessToken or refreshToken or user not defined");
			}
			toaster.success({
				title: "登录成功",
			});
			useAuthStore
				.getState()
				.signIn(
					qrCodeStatus.accessToken,
					qrCodeStatus.refreshToken,
					qrCodeStatus.user,
				);
			navigate("/", {
				viewTransition: true,
			});
		}
	}, [qrCodeStatus, navigate]);

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof schema>) => {
			const res = await authClient.signInWithEmailPassword({
				email: data.email,
				password: data.password,
			});
			const user = res.user;
			if (!user) {
				throw new Error("user not defined");
			}
			return {
				accessToken: res.accessToken,
				refreshToken: res.refreshToken,
				user,
			};
		},
		onSuccess: (data) => {
			toaster.success({
				title: "登录成功",
			});
			useAuthStore
				.getState()
				.signIn(data.accessToken, data.refreshToken, data.user);
			navigate("/", {
				viewTransition: true,
			});
		},
		onError: (error) => {
			toaster.error({
				title: "登录失败",
				description: "用户名或密码错误",
			});
		},
	});

	return (
		<HStack h="dvh">
			<Stack
				display={{ base: "none", lg: "flex" }}
				w="full"
				h="full"
				position="relative"
				style={{
					backgroundImage: `url(${bgImg})`,
					backgroundSize: "cover",
				}}
			>
				<Box
					position="absolute"
					bottom="10%"
					left="10%"
					color="white"
					maxW="500px"
					textShadow="0 2px 4px rgba(0,0,0,0.3)"
				>
					<Heading size="2xl" mb={4}>
						OpenChat
					</Heading>
					<Text fontSize="xl" fontWeight="medium" mb={2}>
						"OpenChat
						让我的日常交流变得更加智能和高效，这是一个真正懂得人类需求的 AI
						助手。"
					</Text>
					<Text fontSize="md">Sarah Zhang, 产品设计师</Text>
				</Box>
			</Stack>
			<VStack
				p={4}
				w="full"
				h="full"
				maxW="4xl"
				mx="auto"
				justify="center"
				align="center"
			>
				<Heading size="2xl" mb={2}>
					欢迎回来
				</Heading>
				<Text color="gray.600" mb={8}>
					登录 OpenChat，继续探索 AI 带来的无限可能。
				</Text>
				<Tabs.Root
					defaultValue={defaultTab}
					variant="enclosed"
					w="full"
					maxW="md"
				>
					<Tabs.List w="full">
						<Tabs.Trigger w="full" value="email_password">
							<LuMail />
							邮箱登录
						</Tabs.Trigger>
						<Tabs.Trigger w="full" value="qr_code">
							<LuQrCode />
							扫码登录
						</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="email_password">
						<Stack gap="4" p={2} asChild align="flex-start" maxW="md" mx="auto">
							<form
								method="post"
								onSubmit={handleSubmit(onSubmit)}
								style={{
									width: "100%",
								}}
							>
								<Field.Root invalid={!!errors.email}>
									<Field.Label>邮箱</Field.Label>
									<Input {...register("email")} />
									<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
								</Field.Root>
								<Field.Root invalid={!!errors.password}>
									<Field.Label>密码</Field.Label>
									<PasswordInput {...register("password")} />
									<Field.ErrorText>{errors.password?.message}</Field.ErrorText>
								</Field.Root>
								<Button type="submit" w="full" loading={mutation.isPending}>
									登录
								</Button>
								<HStack
									fontSize="sm"
									fontWeight="medium"
									justify="space-between"
									w="full"
								>
									<ChakraLink asChild>
										<Link to="/signup" viewTransition>
											没有账号? 注册
										</Link>
									</ChakraLink>
									<ChakraLink asChild>
										<Link to="/reset-password" viewTransition>
											忘记密码?
										</Link>
									</ChakraLink>
								</HStack>
							</form>
						</Stack>
					</Tabs.Content>
					<Tabs.Content value="qr_code">
						<Stack gap="4" p={2} asChild align="flex-start" maxW="md" mx="auto">
							<Box
								w="fit"
								h="fit"
								borderWidth={2}
								borderColor="border,info"
								borderRadius="2xl"
								p={2}
							>
								<QrCode.Root
									mx="auto"
									value={qrCodeData?.qrCodeId || "loading..."}
									size="xl"
								>
									<QrCode.Frame>
										<QrCode.Pattern />
									</QrCode.Frame>
									<AbsoluteCenter
										bg="bg/80"
										boxSize="100%"
										hidden={!isQrCodeLoading}
									>
										<Spinner color="red" />
									</AbsoluteCenter>
								</QrCode.Root>
							</Box>
						</Stack>
					</Tabs.Content>
				</Tabs.Root>
			</VStack>
		</HStack>
	);
}
