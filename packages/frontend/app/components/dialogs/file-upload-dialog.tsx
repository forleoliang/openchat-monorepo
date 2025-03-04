import {
	Icon,
	Text,
	HStack,
	IconButton,
	Spinner,
	VStack,
	Avatar,
	FormatByte,
} from "@chakra-ui/react";
import {
	DialogContent,
	DialogHeader,
	DialogRoot,
	DialogTrigger,
	DialogCloseTrigger,
} from "~/components/ui/dialog";
import {
	FileUploadDropzone,
	FileUploadRoot,
} from "~/components/ui/file-upload";
import { RiAttachmentLine } from "react-icons/ri";
import { useFilesStore } from "~/stores/files";
import { useQuery } from "@tanstack/react-query";
import { fileClient } from "~/client";

interface UploadFileDialogProps {
	onFileSelect: (file: File) => void;
}

export function UploadFileDialog({ onFileSelect }: UploadFileDialogProps) {
	const { files, setFiles } = useFilesStore();

	const { isLoading } = useQuery({
		queryKey: ["files"],
		queryFn: async () => {
			const response = await fileClient.listFiles({});
			setFiles(response.files);
			return response.files;
		},
	});

	return (
		<DialogRoot placement="center">
			<DialogTrigger asChild>
				<IconButton variant="ghost" rounded="full">
					<Icon as={RiAttachmentLine} />
				</IconButton>
			</DialogTrigger>
			<DialogContent mx={4} px={4}>
				<DialogHeader px={0}>
					<Text fontWeight="medium">上传附件</Text>
					<DialogCloseTrigger />
				</DialogHeader>
				<HStack>
					<FileUploadRoot
						maxW="xl"
						alignItems="stretch"
						accept={["image/png", "image/jpeg", "image/gif", "image/webp"]}
						maxFiles={1}
						onFileAccept={(e) => {
							const file = e.files[0];
							onFileSelect(file);
						}}
					>
						<FileUploadDropzone
							label="点击或拖拽文件到此处上传"
							description="支持图片格式，大小不超过5MB"
						/>
					</FileUploadRoot>
				</HStack>
				<VStack p={2}>
					<Text w="full" textAlign="left">
						最近上传
					</Text>
					{files.map((file) => (
						<HStack key={file.url} w="full">
							<Avatar.Root size="sm" rounded="sm" bg="transparent">
								<Avatar.Image src={file.url} rounded="sm" />
								<Avatar.Fallback>{file.fileName.slice(0, 2)}</Avatar.Fallback>
							</Avatar.Root>
							<VStack>
								<Text
									lineHeight="1"
									textOverflow="ellipsis"
									overflow="hidden"
									whiteSpace="nowrap"
									textAlign="left"
								>
									{file.fileName}
								</Text>
							</VStack>
						</HStack>
					))}
				</VStack>
			</DialogContent>
		</DialogRoot>
	);
}
