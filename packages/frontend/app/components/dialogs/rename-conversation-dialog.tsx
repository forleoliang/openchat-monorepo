import { Button, Input, VStack } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "~/components/ui/dialog";
import { chatClient } from "~/client";
import type { Conversation } from "~/types";
const formSchema = z.object({
	title: z.string().min(1),
});

type FormData = z.infer<typeof formSchema>;

export interface RenameConversationDialogRef {
	open: (conversationId: string, currentTitle: string) => void;
}

export interface RenameConversationDialogProps {
	onRenamed?: (conversationId: string, newTitle: string) => void;
}

export const RenameConversationDialog = forwardRef<
	RenameConversationDialogRef,
	RenameConversationDialogProps
>(({ onRenamed }, ref) => {
	const [open, setOpen] = useState(false);
	const [conversationId, setConversationId] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	useImperativeHandle(ref, () => ({
		open: (id: string, currentTitle: string) => {
			setConversationId(id);
			reset({ title: currentTitle });
			setOpen(true);
		},
	}));

	const { mutate: renameMutate, isPending } = useMutation({
		mutationFn: async (data: FormData) => {
			if (!conversationId) return;
			await chatClient.updateConversation({
				conversationId,
				conversation: {
					title: data.title,
				},
			});
		},
		onSuccess: (_, data) => {
			if (conversationId) {
				onRenamed?.(conversationId, data.title);
				setConversationId(null);
				setOpen(false);
			}
		},
	});

	const onClose = () => {
		setConversationId(null);
		setOpen(false);
	};

	return (
		<DialogRoot
			open={open}
			onOpenChange={(e) => {
				if (!e) {
					onClose();
				}
			}}
		>
			<DialogContent asChild mx={4}>
				<form
					method="post"
					onSubmit={handleSubmit((data) => renameMutate(data))}
				>
					<DialogHeader>
						<DialogTitle>重命名对话</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<VStack>
							<Input {...register("title")} autoFocus />
						</VStack>
					</DialogBody>
					<DialogFooter>
						<Button variant="outline" onClick={onClose}>
							取消
						</Button>
						<Button type="submit" loading={isPending}>
							确认
						</Button>
					</DialogFooter>
					<DialogCloseTrigger type="button" onClick={onClose} />
				</form>
			</DialogContent>
		</DialogRoot>
	);
});

RenameConversationDialog.displayName = "RenameConversationDialog";
