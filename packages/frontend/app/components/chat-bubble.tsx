import {
	Box,
	Text,
	HStack,
	Image,
	Spinner,
	VStack,
	Icon,
	IconButton,
	Clipboard,
	AvatarGroup,
	Avatar,
	Link,
	Button,
} from "@chakra-ui/react";
import Markdown from "react-markdown";
import { memo } from "react";
import { RiCheckLine, RiFileCopyLine, RiResetRightLine } from "react-icons/ri";
import rehypeHighlight from "rehype-highlight";
import lightStyles from "highlight.js/styles/github.css?inline";
import darkStyles from "highlight.js/styles/github-dark.css?inline";
import remarkGfm from "remark-gfm";
import { Prose } from "~/components/ui/prose";
import type { Message } from "~/types";
import { useColorMode } from "~/components/ui/color-mode";
import { CodeBlock } from "~/components/code";
import {
	DrawerBody,
	DrawerCloseTrigger,
	DrawerContent,
	DrawerHeader,
	DrawerRoot,
	DrawerTitle,
	DrawerTrigger,
} from "~/components/ui/drawer";
import { Feature } from "~/gen/chat/v1/chat_pb";
import CustomImage from "./custom-image";

interface ChatBubbleProps {
	message: Message;
	showOptions?: boolean;
	runningFeature?: Feature;
	onReComplete?: () => void;
}

export function ChatBubble({
	message,
	showOptions = false,
	runningFeature = Feature.UNSPECIFIED,
	onReComplete,
}: ChatBubbleProps) {
	if (message.role === "user") {
		return <UserBubble message={message} />;
	}
	return (
		<AssistantBubble
			message={message}
			showOptions={showOptions}
			runningFeature={runningFeature}
			onReComplete={onReComplete}
		/>
	);
}

interface UserBubbleProps {
	message: Message;
}

export function UserBubble({ message }: UserBubbleProps) {
	return (
		<HStack w="full" flexDir="row-reverse">
			<VStack w="full" alignItems="end">
				<Text
					fontSize="sm"
					px={3}
					py={2}
					rounded="2xl"
					bg="bg.emphasized"
					roundedBottomRight="sm"
				>
					{message.message}
				</Text>
				{message?.files?.map((file) => (
					<Image
						key={file.url}
						src={file.url}
						maxW="2xs"
						maxH="2xs"
						rounded="md"
						alt={file.fileName}
					/>
				))}
			</VStack>
		</HStack>
	);
}

interface AssistantBubbleProps {
	message: Message;
	pending?: boolean;
	runningFeature?: Feature;
	showOptions?: boolean;
	onReComplete?: () => void;
}

export function AssistantBubble({
	message,
	pending,
	runningFeature = Feature.UNSPECIFIED,
	showOptions = false,
	onReComplete,
}: AssistantBubbleProps) {
	const { colorMode } = useColorMode();

	return (
		<HStack w="full" alignItems="start">
			{pending ? (
				<Spinner size="sm" mt={2} mx={2} />
			) : (
				<Box w="full" overflow="hidden" pt={1} gap={0}>
					<style>{colorMode === "dark" ? darkStyles : lightStyles}</style>
					<HStack hidden={message.searchResults.length === 0}>
						<SearchResultDrawer message={message} />
					</HStack>
					<HStack w="full" hidden={runningFeature !== Feature.SEARCH_WEB}>
						<Spinner size="xs" />
						<Text fontSize="sm" color="fg.muted">
							正在搜索网页...
						</Text>
					</HStack>
					<HStack w="full" hidden={runningFeature !== Feature.GENERATE_IMAGE}>
						<Spinner size="xs" />
						<Text fontSize="sm" color="fg.muted">
							正在生成图片...
						</Text>
					</HStack>
					<HStack w="full" hidden={runningFeature !== Feature.BROWSER_URL}>
						<Spinner size="xs" />
						<Text fontSize="sm" color="fg.muted">
							正在访问网页...
						</Text>
					</HStack>
					<HStack>
						{message.generatedImageUrls.map((url) => (
							<CustomImage
								key={url}
								src={url}
								maxW="2xs"
								maxH="2xs"
								rounded="md"
								alt="Generated image"
							/>
						))}
					</HStack>
					<Prose w="full" maxW="full">
						<Box overflowX="auto" w="full">
							<Markdown
								rehypePlugins={[rehypeHighlight]}
								remarkPlugins={[remarkGfm]}
								components={{
									code: CodeBlock,
								}}
							>
								{message.message}
							</Markdown>
						</Box>
					</Prose>

					<HStack gap={1} hidden={!showOptions}>
						<Clipboard.Root value={message.message} timeout={1000}>
							<Clipboard.Trigger asChild>
								<IconButton
									aria-label="Copy"
									variant="ghost"
									size="xs"
									rounded="full"
								>
									<Clipboard.Indicator
										copied={<Icon as={RiCheckLine} color="fg.success" />}
									>
										<Icon as={RiFileCopyLine} color="fg.muted" />
									</Clipboard.Indicator>
								</IconButton>
							</Clipboard.Trigger>
						</Clipboard.Root>
						<IconButton
							variant="ghost"
							size="xs"
							rounded="full"
							onClick={onReComplete}
						>
							<Icon as={RiResetRightLine} color="fg.muted" />
						</IconButton>
					</HStack>
				</Box>
			)}
		</HStack>
	);
}

export const ChatBubbleMemoized = memo(ChatBubble);

export function SearchResultDrawer({ message }: { message: Message }) {
	return (
		<DrawerRoot>
			<DrawerTrigger asChild>
				<AvatarGroup size="xs" stacking="last-on-top">
					{message.searchResults.slice(0, 3).map((item) => (
						<Avatar.Root key={item.url}>
							<Avatar.Fallback name={item.title} />
							{item.metaUrl?.favicon && (
								<Avatar.Image src={item.metaUrl.favicon} />
							)}
						</Avatar.Root>
					))}
					<Avatar.Root>
						<Avatar.Fallback>
							+{message.searchResults.length - 3}
						</Avatar.Fallback>
					</Avatar.Root>
				</AvatarGroup>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>搜索结果</DrawerTitle>
					<DrawerCloseTrigger />
				</DrawerHeader>
				<DrawerBody as={VStack}>
					{message.searchResults.map((item) => (
						<VStack key={item.url} w="full" borderBottomWidth={1}>
							<HStack w="full">
								<Avatar.Root size="xs">
									<Avatar.Fallback>{item.title.slice(0, 2)}</Avatar.Fallback>
									{item.metaUrl?.favicon && (
										<Avatar.Image src={item.metaUrl.favicon} />
									)}
								</Avatar.Root>
								<Text fontSize="xs">{item.title}</Text>
							</HStack>
							<Button
								variant="ghost"
								size="xs"
								w="full"
								justifyContent="start"
								asChild
							>
								<Link href={item.url} target="_blank">
									<Text fontSize="xs" truncate>
										{item.url}
									</Text>
								</Link>
							</Button>
						</VStack>
					))}
				</DrawerBody>
			</DrawerContent>
		</DrawerRoot>
	);
}
