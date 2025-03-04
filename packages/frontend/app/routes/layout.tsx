import {
	HStack,
	VStack,
	IconButton,
	Icon,
	Spacer,
	Button,
	Text,
	Center,
	Spinner,
	Box,
} from "@chakra-ui/react";
import { useRef, useState, memo } from "react";
import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	LuEllipsis,
	LuMenu,
	LuMessageSquarePlus,
	LuPencil,
	LuRefreshCcw,
	LuTrash,
} from "react-icons/lu";
import {
	Link,
	Outlet,
	redirect,
	useNavigate,
	type ClientLoaderFunctionArgs,
} from "react-router";
import {
	DrawerBackdrop,
	DrawerCloseTrigger,
	DrawerContent,
	DrawerHeader,
	DrawerRoot,
	DrawerTrigger,
} from "~/components/ui/drawer";
import { SearchDialog } from "~/components/dialogs/search-dialog";
import { chatClient } from "~/client";
import {
	DeleteConversationDialog,
	type DeleteConversationDialogRef,
} from "~/components/dialogs/delete-conversation-dialog";
import {
	RenameConversationDialog,
	type RenameConversationDialogRef,
} from "~/components/dialogs/rename-conversation-dialog";
import { ProfileMenu } from "~/components/profile-menu";
import { MenuContent, MenuItem, MenuRoot } from "~/components/ui/menu";
import { DEFAULT_CONVERSATION_ID, useChatStore } from "~/stores/chat";
import { useConversationsStore } from "~/stores/conversations";
import { useAuthStore } from "~/stores/auth";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
	try {
		const token = useAuthStore.getState().token;
		if (!token) {
			return redirect("/signin");
		}
		useChatStore
			.getState()
			.setActiveConversationId(params.id ?? DEFAULT_CONVERSATION_ID);
	} catch (error) {
		console.error(error);
		return redirect("/signin");
	}
}

export default function Layout() {
	const navigate = useNavigate();
	const { setActiveConversationId } = useChatStore();

	const queryClient = useQueryClient();

	const isLoading = useIsFetching({
		queryKey: ["conversations"],
	});

	return (
		<HStack h="dvh" w="full" overflow="hidden" gap={0}>
			<VStack
				w={64}
				display={{ base: "none", md: "flex" }}
				p={2}
				flexShrink={0}
				h="full"
				borderRightWidth={1}
				borderColor="border.muted"
				bg="bg.pannel"
				gap={2}
			>
				<HStack w="full">
					<SearchDialog placement="center" />
					<Spacer />
					<IconButton
						variant="ghost"
						rounded="md"
						loading={isLoading > 0}
						onClick={() => {
							queryClient.invalidateQueries({
								queryKey: ["conversations"],
							});
						}}
					>
						<Icon as={LuRefreshCcw} />
					</IconButton>
				</HStack>
				<Button
					variant="ghost"
					rounded="md"
					justifyContent="start"
					w="full"
					onClick={() => {
						setActiveConversationId(DEFAULT_CONVERSATION_ID);
						navigate("/", {
							viewTransition: true,
						});
					}}
				>
					<Icon as={LuMessageSquarePlus} />
					<Text>开启新对话</Text>
				</Button>
				<Box flex={1} w="full" overflowY="hidden">
					<ConversationList />
				</Box>
				<ProfileMenu />
			</VStack>
			<Box flex={1} h="full" overflow="hidden" bg="bg.subtle">
				<Outlet />
			</Box>
		</HStack>
	);
}

const ConversationItem = memo(
	({
		conversation,
		isActive,
		onMenuTriggerClick,
		onNavigate,
	}: {
		conversation: { id: string; title: string };
		isActive: boolean;
		onMenuTriggerClick: (
			conversationId: string,
			buttonElement: HTMLButtonElement,
		) => void;
		onNavigate?: () => void;
	}) => {
		const navigate = useNavigate();
		const { setActiveConversationId } = useChatStore();
		return (
			<HStack w="full">
				<Button
					position="relative"
					variant={isActive ? "subtle" : "ghost"}
					size="sm"
					w="full"
					justifyContent="start"
					rounded="md"
					onClick={() => {
						onNavigate?.();
						setActiveConversationId(conversation.id);
						navigate(`/chat/${conversation.id}`, {
							replace: true,
							viewTransition: true,
						});
					}}
				>
					<Text truncate maxW="calc(100% - 32px)">
						{conversation.title}
					</Text>
				</Button>
				<IconButton
					position="relative"
					left={-12}
					size="xs"
					variant="plain"
					data-menu-trigger="true"
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						onMenuTriggerClick(conversation.id, e.currentTarget);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.stopPropagation();
							e.preventDefault();
							onMenuTriggerClick(conversation.id, e.currentTarget);
						}
					}}
				>
					<Icon as={LuEllipsis} />
				</IconButton>
			</HStack>
		);
	},
);

export function ConversationList({ onNavigate }: { onNavigate?: () => void }) {
	const { activeConversationId } = useChatStore();
	const {
		conversations,
		setConversations,
		removeConversation,
		renameConversation,
	} = useConversationsStore();

	const [menuConversationId, setMenuConversationId] = useState<string | null>(
		null,
	);
	const [anchorPoint, setAnchorPoint] = useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});

	function handleMenuTriggerClick(
		conversationId: string,
		buttonElement: HTMLButtonElement,
	) {
		if (menuConversationId === conversationId) {
			setMenuConversationId(null);
			setTimeout(() => {
				setAnchorPoint({
					x: 0,
					y: 0,
				});
			}, 100);
		} else {
			const rect = buttonElement.getBoundingClientRect();
			setAnchorPoint({
				x: rect.right,
				y: rect.top + rect.height / 2,
			});
			setMenuConversationId(conversationId);
		}
	}

	const deleteDialogRef = useRef<DeleteConversationDialogRef>(null);
	const renameDialogRef = useRef<RenameConversationDialogRef>(null);

	const { isLoading } = useQuery({
		queryKey: ["conversations", "good"],
		queryFn: async () => {
			const { conversations } = await chatClient.listConversations({});
			setConversations(conversations);
			return conversations;
		},
	});

	return (
		<VStack w="full" h="full" gap={0.5} overflowY="auto">
			{isLoading && (
				<Center w="full" flex={1} minH={0}>
					<Spinner />
				</Center>
			)}
			{conversations?.map((conversation) => (
				<ConversationItem
					key={conversation.id}
					conversation={conversation}
					isActive={activeConversationId === conversation.id}
					onMenuTriggerClick={handleMenuTriggerClick}
					onNavigate={onNavigate}
				/>
			))}
			<DeleteConversationDialog
				ref={deleteDialogRef}
				onDeleted={removeConversation}
			/>
			<RenameConversationDialog
				ref={renameDialogRef}
				onRenamed={renameConversation}
			/>
			<MenuRoot
				composite
				open={menuConversationId !== null}
				anchorPoint={anchorPoint}
				onSelect={(e) => {
					const value = e.value;
					console.log(`${value}: ${menuConversationId}`);
					if (!menuConversationId) return;
					if (value === "rename") {
						const title = conversations?.find(
							(c) => c.id === menuConversationId,
						)?.title;
						if (!title) return;
						renameDialogRef.current?.open(menuConversationId, title);
					} else if (value === "delete") {
						deleteDialogRef.current?.open(menuConversationId);
					}
					setMenuConversationId(null);
					setTimeout(() => {
						setAnchorPoint({
							x: 0,
							y: 0,
						});
					}, 100);
				}}
			>
				<MenuContent zIndex={10000}>
					<MenuItem value="rename">
						<Icon as={LuPencil} />
						<Text>重命名</Text>
					</MenuItem>
					<MenuItem
						value="delete"
						color="fg.error"
						_hover={{ bg: "bg.error", color: "fg.error" }}
					>
						<Icon as={LuTrash} />
						<Text>删除</Text>
					</MenuItem>
				</MenuContent>
			</MenuRoot>
		</VStack>
	);
}

export function MobileDrawer() {
	const [open, setOpen] = useState(false);

	return (
		<DrawerRoot
			placement="start"
			open={open}
			size="xs"
			onOpenChange={(e) => setOpen(e.open)}
		>
			<DrawerBackdrop />
			<DrawerTrigger asChild>
				<IconButton variant="ghost">
					<Icon as={LuMenu} />
				</IconButton>
			</DrawerTrigger>
			<DrawerContent maxW={64} p={1}>
				<DrawerHeader p={2}>
					<SearchDialog size="full" />
					<DrawerCloseTrigger />
				</DrawerHeader>
				<VStack h="full" gap={0} overflowY="auto">
					<Button
						asChild
						variant="ghost"
						rounded="md"
						justifyContent="start"
						w="full"
						onClick={() => setOpen(false)}
					>
						<Link to="/" viewTransition>
							<Icon as={LuMessageSquarePlus} />
							<Text>开启新对话</Text>
						</Link>
					</Button>
					<ConversationList onNavigate={() => setOpen(false)} />
					<Spacer />
					<ProfileMenu />
				</VStack>
			</DrawerContent>
		</DrawerRoot>
	);
}
