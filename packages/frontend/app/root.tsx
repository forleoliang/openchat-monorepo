import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Center, EmptyState, Image, VStack } from "@chakra-ui/react";
import { Toaster } from "~/components/ui/toaster";
import { Provider } from "~/components/ui/provider";
import logoImg from "~/assets/logo.png";

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
				<script
					defer
					src="https://assets.onedollarstats.com/stonks.js"
					id="stonks"
				/>
			</body>
		</html>
	);
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 30, // 30 minutes
		},
	},
});

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Provider enableSystem>
				<Outlet />
				<Toaster />
			</Provider>
		</QueryClientProvider>
	);
}

export function HydrateFallback() {
	return (
		<Provider enableSystem>
			<Center h="dvh" w="full">
				<EmptyState.Root>
					<EmptyState.Content>
						<EmptyState.Indicator>
							<Image src={logoImg} alt="logo" w="100px" h="100px" />
						</EmptyState.Indicator>
						<VStack textAlign="center">
							<EmptyState.Title>应用加载中</EmptyState.Title>
							<EmptyState.Description>请稍后...</EmptyState.Description>
						</VStack>
					</EmptyState.Content>
				</EmptyState.Root>
			</Center>
		</Provider>
	);
}
