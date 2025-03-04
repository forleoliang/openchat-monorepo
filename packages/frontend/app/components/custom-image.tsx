import { Image } from "@chakra-ui/react";
import type { ImageProps } from "@chakra-ui/react";
import { useState } from "react";
import { Skeleton } from "~/components/ui/skeleton";

export interface CustomImageProps extends ImageProps {}

export default function CustomImage(props: CustomImageProps) {
	const [isLoading, setIsLoading] = useState(true);

	return (
		<div style={{ position: "relative" }}>
			{isLoading && <Skeleton w="full" h="full" />}
			<Image
				{...props}
				onLoad={() => setIsLoading(false)}
				onError={() => setIsLoading(true)}
			/>
		</div>
	);
}
