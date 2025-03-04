import { LuSettings, LuLogOut, LuMonitor } from "react-icons/lu";
import { Icon, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { useAuthStore } from "~/stores/auth";
import {
	DialogContent,
	DialogHeader,
	DialogRoot,
	DialogTrigger,
	DialogCloseTrigger,
} from "~/components/ui/dialog";
import { Avatar } from "~/components/ui/avatar";

interface ProfileDialogProps {
	children: React.ReactNode;
}

export function ProfileDialog({ children }: ProfileDialogProps) {
	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();

	function signout() {
		useAuthStore.getState().signOut();
		navigate("/signin", {
			viewTransition: true,
		});
	}

	return (
		<DialogRoot placement="center">
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent rounded="2xl" mx={4} maxW="sm">
				<DialogHeader>
					<Avatar name={user?.username} size="md" />
					<Text fontSize="lg" fontWeight="medium">
						{user?.username}
					</Text>
				</DialogHeader>
				<div className="space-y-2 mt-4">
					<Button
						variant="ghost"
						width="full"
						display="flex"
						justifyContent="flex-start"
						gap={3}
						onClick={() => {}}
					>
						<Icon as={LuSettings} />
						设置
					</Button>

					<Button
						variant="ghost"
						width="full"
						display="flex"
						justifyContent="flex-start"
						gap={3}
						onClick={() => {}}
					>
						<Icon as={LuMonitor} />
						下载应用
					</Button>

					<Button
						variant="ghost"
						width="full"
						display="flex"
						justifyContent="flex-start"
						gap={3}
						onClick={signout}
					>
						<Icon as={LuLogOut} />
						退出登录
					</Button>
				</div>
			</DialogContent>
			<DialogCloseTrigger />
		</DialogRoot>
	);
}
