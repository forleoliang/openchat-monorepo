import { Button, Text, VStack } from "@chakra-ui/react";
import { forwardRef, useImperativeHandle, useState } from "react";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "~/components/ui/dialog";
import { authClient } from "~/client";
import { toaster } from "~/components/ui/toaster";

export interface ConfirmLoginDialogRef {
	open: (qrCodeId: string) => void;
}

export interface ConfirmLoginDialogProps {
	onConfirmed?: () => void;
	onCanceled?: () => void;
}

export const ConfirmLoginDialog = forwardRef<
	ConfirmLoginDialogRef,
	ConfirmLoginDialogProps
>(({ onConfirmed, onCanceled }, ref) => {
	const [open, setOpen] = useState(false);
	const [qrCodeId, setQrCodeId] = useState<string | null>(null);
	const [isConfirming, setIsConfirming] = useState(false);

	useImperativeHandle(ref, () => ({
		open: (id: string) => {
			setQrCodeId(id);
			setOpen(true);
		},
	}));

	const onClose = () => {
		setQrCodeId(null);
		setOpen(false);
		onCanceled?.();
	};

	async function handleConfirm() {
		if (!qrCodeId) return;

		try {
			setIsConfirming(true);
			await authClient.confirmQrCodeLogin({
				qrCodeId,
			});
			onConfirmed?.();
			onClose();
			toaster.success({
				title: "确认成功",
				description: "已确认登录",
			});
		} catch (error: any) {
			toaster.error({
				title: "确认失败",
				description: error.message || "未知错误",
			});
		} finally {
			setIsConfirming(false);
		}
	}

	return (
		<DialogRoot
			open={open}
			onOpenChange={(e) => {
				if (!e) {
					onClose();
				}
			}}
		>
			<DialogContent mx={4}>
				<DialogCloseTrigger onClick={onClose} />
				<DialogHeader>
					<DialogTitle>确认登录</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<VStack gap={4}>
						<Text>是否确认在其他设备上登录？</Text>
						<Text fontSize="sm" color="gray.500">
							请确保是您本人的操作，否则请点击取消
						</Text>
					</VStack>
				</DialogBody>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						取消
					</Button>
					<Button
						colorPalette="blue"
						loading={isConfirming}
						onClick={handleConfirm}
					>
						确认登录
					</Button>
				</DialogFooter>
			</DialogContent>
		</DialogRoot>
	);
});

ConfirmLoginDialog.displayName = "ConfirmLoginDialog";
