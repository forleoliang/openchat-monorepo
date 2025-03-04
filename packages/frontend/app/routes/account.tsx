import { Button, Heading, Stack } from "@chakra-ui/react";

export default function Account() {
	return (
		<Stack p={4}>
			<Heading>Account</Heading>
			<Button colorPalette="red">Sign Out</Button>
		</Stack>
	);
}
