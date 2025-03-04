import { LuSettings, LuLogOut, LuDownload, LuScanLine } from "react-icons/lu";
import { Button, Icon, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { useRef } from "react";
import {
	scan,
	Format,
	checkPermissions,
	requestPermissions,
} from "@tauri-apps/plugin-barcode-scanner";
import {
	MenuItem,
	MenuContent,
	MenuRoot,
	MenuTrigger,
} from "~/components/ui/menu";
import { Avatar } from "~/components/ui/avatar";
import { useAuthStore } from "~/stores/auth";
import { toaster } from "~/components/ui/toaster";
import { authClient } from "~/client";
import {
	ConfirmLoginDialog,
	type ConfirmLoginDialogRef,
} from "~/components/dialogs/confirm-login-dialog";

export function ProfileMenu() {
	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();
	const confirmLoginDialogRef = useRef<ConfirmLoginDialogRef>(null);

	function signout() {
		useAuthStore.getState().signOut();
		navigate("/signin", {
			viewTransition: true,
		});
	}

	async function scanBarcode() {
		try {
			const permission = await checkPermissions();
			if (permission !== "granted") {
				const newPermission = await requestPermissions();
				if (newPermission !== "granted") {
					toaster.error({
						title: "权限错误",
						description: "需要相机权限才能进行扫码",
					});
					return;
				}
			}
			const result = await scan({
				windowed: false,
				formats: [Format.QRCode],
			});
			if (result?.content) {
				toaster.success({
					title: "扫描成功",
					description: result.content,
				});
				await authClient.scanQrCode({
					qrCodeId: result.content,
				});
				confirmLoginDialogRef.current?.open(result.content);
			} else {
				toaster.error({
					title: "扫描失败",
					description: "未能识别二维码",
				});
			}
		} catch (error: any) {
			toaster.error({
				title: "扫描失败",
				description: error.message || "未知错误",
			});
		}
	}

	return (
		<>
			<MenuRoot>
				<MenuTrigger asChild>
					<Button variant="ghost" w="full" justifyContent="start" size="md">
						<Avatar name={user?.username} src={user?.avatar} size="xs" />
						<Text fontSize="sm">{user?.username}</Text>
					</Button>
				</MenuTrigger>
				<MenuContent w={60} rounded="2xl" zIndex={10000}>
					<MenuItem value="settings" rounded="xl">
						<Icon as={LuSettings} />
						<Text>设置</Text>
					</MenuItem>
					<MenuItem value="scan" onClick={scanBarcode} rounded="xl">
						<Icon as={LuScanLine} />
						<Text>扫描</Text>
					</MenuItem>
					<MenuItem value="download" rounded="xl">
						<Icon as={LuDownload} />
						<Text>下载客户端</Text>
					</MenuItem>
					<MenuItem value="signout" onClick={signout} rounded="xl">
						<Icon as={LuLogOut} />
						<Text>退出登录</Text>
					</MenuItem>
				</MenuContent>
			</MenuRoot>
			<ConfirmLoginDialog
				ref={confirmLoginDialogRef}
				onConfirmed={() => {
					navigate("/", {
						viewTransition: true,
					});
				}}
				onCanceled={() => {
					navigate("/", {
						viewTransition: true,
					});
				}}
			/>
		</>
	);
}
