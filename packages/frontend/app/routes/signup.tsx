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
	Link as ChakraLink,
	VStack,
	Text,
	Box,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { PasswordInput } from "~/components/ui/password-input";
import { authClient } from "~/client";
import { toaster } from "~/components/ui/toaster";
import bgImg from "~/assets/signup-bg.png";

export async function clientLoader() {
	return null;
}

export default function SignUp() {
	const navigate = useNavigate();

	const schema = z.object({
		username: z.string().min(1, { message: "用户名不能为空" }),
		email: z.string().email({ message: "邮箱格式不正确" }),
		password: z.string().min(1, { message: "密码不能为空" }),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const onSubmit = (data: z.infer<typeof schema>) => {
		mutation.mutate(data);
	};

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof schema>) => {
			await authClient.signUp({
				username: data.username,
				email: data.email,
				password: data.password,
			});
			return data.email;
		},
		onSuccess: (email) => {
			toaster.success({
				title: "注册成功",
				description: "请查收邮箱验证码",
			});
			navigate(`/account-verify?email=${encodeURIComponent(email)}`, {
				viewTransition: true,
			});
		},
		onError: (error) => {
			toaster.error({
				title: "注册失败",
				description: error.message,
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
						帮助我将繁琐的任务自动化，让我能够专注于真正重要的事情。这是一个改变生活方式的革命性工具。"
					</Text>
					<Text fontSize="md">Alex Chen, 资深工程师</Text>
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
							开启智能之旅
						</Heading>
						<Text color="gray.600" mb={8}>
							加入 OpenChat，让 AI
							成为你的得力助手。通过智能化提升效率，激发无限可能。
						</Text>
						<Field.Root invalid={!!errors.username}>
							<Field.Label>用户名</Field.Label>
							<Input {...register("username")} />
							<Field.ErrorText>{errors.username?.message}</Field.ErrorText>
						</Field.Root>
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
							注册
						</Button>
						<HStack fontSize="sm" fontWeight="medium" asChild>
							<ChakraLink asChild>
								<Link to="/signin" viewTransition>
									已有账号? 登录
								</Link>
							</ChakraLink>
						</HStack>
					</form>
				</Stack>
			</VStack>
		</HStack>
	);
}
