import { useNavigate } from "react-router";
import { useState, useRef } from "react";
import { LuSearch } from "react-icons/lu";
import {
	IconButton,
	Icon,
	VStack,
	Input,
	Button,
	type DialogRootProps,
} from "@chakra-ui/react";
import {
	DialogRoot,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogCloseTrigger,
	DialogTitle,
} from "~/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { chatClient } from "~/client";

type SearchDialogProps = Partial<DialogRootProps>;

export function SearchDialog({ size, placement, ...props }: SearchDialogProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const navigate = useNavigate();

	const { data: conversations, isLoading } = useQuery({
		queryKey: ["conversations"],
		queryFn: async () => {
			const resp = await chatClient.listConversations({});
			return resp.conversations;
		},
	});

	const closeTriggerRef = useRef<HTMLButtonElement>(null);

	const filteredConversations = conversations?.filter((conv) =>
		conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<DialogRoot size={size} scrollBehavior="inside">
			<DialogTrigger asChild>
				<IconButton variant="ghost" aria-label="搜索对话">
					<Icon as={LuSearch} />
				</IconButton>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>搜索对话</DialogTitle>
					<Input
						placeholder="输入关键词搜索..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						autoFocus
						my={2}
					/>
				</DialogHeader>
				<DialogBody>
					<VStack gap={4}>
						<VStack
							w="full"
							align="stretch"
							gap={2}
							overflowY="auto"
							maxH={{
								base: "",
								md: "sm",
							}}
						>
							{filteredConversations?.map((conversation) => (
								<Button
									key={conversation.id}
									variant="ghost"
									justifyContent="start"
									onClick={() => {
										navigate(`/chat/${conversation.id}`);
										closeTriggerRef.current?.click();
									}}
								>
									{conversation.title}
								</Button>
							))}
						</VStack>
					</VStack>
				</DialogBody>
				<DialogCloseTrigger ref={closeTriggerRef} />
			</DialogContent>
		</DialogRoot>
	);
}
