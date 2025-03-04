import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Stack,
	HStack,
	Heading,
	Field,
	Input,
	Button,
	Text,
	VStack,
	Link as ChakraLink,
	Box,
} from "@chakra-ui/react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "~/client";
import { toaster } from "~/components/ui/toaster";
import bgImg from "~/assets/verify-email-bg.png";
import { useAuthStore } from "~/stores/auth";

export default function VerifyEmail() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const email = searchParams.get("email");

	const schema = z.object({
		code: z.string().length(6, { message: "验证码长度必须为6位" }),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			code: "",
		},
	});

	const onSubmit = (data: z.infer<typeof schema>) => {
		mutation.mutate(data);
	};

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof schema>) => {
			if (!email) {
				throw new Error("邮箱不能为空");
			}
			const res = await authClient.verifyAccount({
				email,
				code: data.code,
			});
			return res;
		},
		onSuccess: (data) => {
			if (!data.user) {
				throw new Error("用户不存在");
			}
			useAuthStore
				.getState()
				.signIn(data.accessToken, data.refreshToken, data.user);
			toaster.success({
				title: "验证成功",
				description: "邮箱验证成功",
			});
			navigate("/", {
				viewTransition: true,
			});
		},
		onError: (error) => {
			toaster.error({
				title: "验证失败",
				description: error.message,
			});
		},
	});

	if (!email) {
		return (
			<VStack h="dvh" justify="center">
				<Text>无效的验证链接</Text>
			</VStack>
		);
	}

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
						为我打开了一扇通向未来的窗口，每一次对话都充满惊喜与启发。"
					</Text>
					<Text fontSize="md">David Li, 教育工作者</Text>
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
				<Stack gap="4" p={2} asChild align="flex-start" maxW="md" mx="auto">
					<form
						method="post"
						onSubmit={handleSubmit(onSubmit)}
						style={{
							width: "100%",
						}}
					>
						<Heading size="2xl" mb={2}>
							验证邮箱
						</Heading>
						<Text color="gray.600" mb={4}>
							完成邮箱验证，开启你的 AI 智能助手之旅。
						</Text>
						<Stack color="fg.muted" gap={1} mb={6}>
							<Text>我们已经向 {email} 发送了验证码，请查收</Text>
							<Text fontSize="sm">
								验证码 10 分钟内有效，如未收到请检查垃圾邮件
							</Text>
						</Stack>
						<Field.Root invalid={!!errors.code}>
							<Field.Label>验证码</Field.Label>
							<Input {...register("code")} placeholder="请输入6位验证码" />
							<Field.ErrorText>{errors.code?.message}</Field.ErrorText>
						</Field.Root>
						<Button type="submit" w="full" loading={mutation.isPending}>
							验证
						</Button>
						<HStack fontSize="sm" fontWeight="medium" justify="center" w="full">
							<ChakraLink asChild>
								<Link to="/signup" viewTransition>
									返回注册
								</Link>
							</ChakraLink>
						</HStack>
					</form>
				</Stack>
			</VStack>
		</HStack>
	);
}
