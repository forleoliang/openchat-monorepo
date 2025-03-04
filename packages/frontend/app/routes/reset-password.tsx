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
	Text,
} from "@chakra-ui/react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { toaster } from "~/components/ui/toaster";
import bgImg from "~/assets/reset-password-bg.png";

export default function ResetPassword() {
	const schema = z.object({
		email: z.string().email({ message: "请输入有效的邮箱地址" }),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = (data: z.infer<typeof schema>) => {
		mutation.mutate(data);
	};

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof schema>) => {
			// TODO: 实现重置密码的API调用
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return data;
		},
		onSuccess: () => {
			toaster.success({
				title: "重置密码邮件已发送",
				description: "请检查您的邮箱，按照邮件中的指引重置密码",
			});
		},
		onError: (error) => {
			toaster.error({
				title: "发送失败",
				description: error.message,
			});
		},
	});

	return (
		<HStack h="dvh">
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
						<Heading size="2xl">重置密码</Heading>
						<Text color="fg.muted">
							请输入您的注册邮箱，我们将向您发送重置密码的链接。
						</Text>
						<Field.Root invalid={!!errors.email}>
							<Field.Label>邮箱</Field.Label>
							<Input {...register("email")} type="email" />
							<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
						</Field.Root>
						<Button type="submit" w="full" loading={mutation.isPending}>
							发送重置链接
						</Button>
						<HStack fontSize="sm" fontWeight="medium" justify="center" w="full">
							<ChakraLink asChild>
								<Link to="/signin" viewTransition>
									返回登录
								</Link>
							</ChakraLink>
						</HStack>
					</form>
				</Stack>
			</VStack>
			<Stack
				display={{ base: "none", lg: "flex" }}
				w="full"
				h="full"
				style={{
					backgroundImage: `url(${bgImg})`,
					backgroundSize: "cover",
				}}
			/>
		</HStack>
	);
}
