import {
	Box,
	Text,
	HStack,
	Icon,
	IconButton,
	VStack,
	Code,
	Spacer,
} from "@chakra-ui/react";
import { RiFileCopyLine } from "react-icons/ri";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type CodeProps = ComponentPropsWithoutRef<"code"> & {
	inline?: boolean;
	className?: string;
};

export function CodeBlock({
	inline,
	className,
	children,
	...props
}: CodeProps) {
	const match = /language-(\w+)/.exec(className || "");
	const language = match ? match[1] : "";

	const handleCopyCode = (code: ReactNode) => {
		// 递归处理，将对象转换为字符串
		const processNode = (node: any): string => {
			if (typeof node === "string") return node;
			if (Array.isArray(node)) return node.map(processNode).join("");
			if (node && typeof node === "object" && "props" in node) {
				return processNode(node.props.children);
			}
			return "";
		};
		const processedCode = processNode(code);
		navigator.clipboard.writeText(processedCode);
	};

	if (!inline && match) {
		return (
			<VStack rounded="md" gap={0} borderWidth={1}>
				<HStack w="full" py={0.5} px={4} bg="bg.emphasized">
					<Text fontWeight="medium">{language}</Text>
					<Spacer />
					<IconButton
						size="xs"
						variant="ghost"
						aria-label="Copy code"
						onClick={() => handleCopyCode(children)}
					>
						<Icon as={RiFileCopyLine} />
					</IconButton>
				</HStack>
				<Box
					as="pre"
					className={className}
					w="full"
					roundedTop="none"
					{...props}
				>
					<Box as="code" display="block" px={4} py={3}>
						{children}
					</Box>
				</Box>
			</VStack>
		);
	}
	return (
		<Code as="code" size="xs" className={className} {...props}>
			{children}
		</Code>
	);
}
