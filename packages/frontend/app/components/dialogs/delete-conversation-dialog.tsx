import { Button, Text } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useNavigate } from "react-router";
import { chatClient } from "~/client";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "~/components/ui/dialog";

export interface DeleteConversationDialogRef {
	open: (conversationId: string) => void;
}

export interface DeleteConversationDialogProps {
	onDeleted?: (conversationId: string) => void;
}

export const DeleteConversationDialog = forwardRef<
	DeleteConversationDialogRef,
	DeleteConversationDialogProps
>(({ onDeleted }, ref) => {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [conversationId, setConversationId] = useState<string | null>(null);

	useImperativeHandle(ref, () => ({
		open: (id: string) => {
			setConversationId(id);
			setOpen(true);
		},
	}));

	function onClose() {
		setConversationId(null);
		setOpen(false);
	}

	const { mutate: deleteConversationMutate, isPending } = useMutation({
		mutationFn: async () => {
			if (!conversationId) return;
			await chatClient.deleteConversation({ conversationId });
		},
		onSuccess: () => {
			if (conversationId) {
				navigate("/", { viewTransition: true });
				onDeleted?.(conversationId);
				onClose();
			}
		},
	});

	return (
		<DialogRoot
			open={open}
			onOpenChange={(e) => {
				if (!e) {
					setConversationId(null);
					setOpen(false);
				}
			}}
		>
			<DialogContent mx={4}>
				<DialogCloseTrigger onClick={onClose} />
				<DialogHeader>
					<DialogTitle>永久删除对话</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<Text>删除后，该对话将不可恢复。确认删除吗？</Text>
				</DialogBody>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						取消
					</Button>
					<Button
						colorPalette="red"
						loading={isPending}
						onClick={() => deleteConversationMutate()}
					>
						删除
					</Button>
				</DialogFooter>
			</DialogContent>
		</DialogRoot>
	);
});

DeleteConversationDialog.displayName = "DeleteConversationDialog";
