import { BraveSearch } from "brave-search-sdk";
import { zodFunction } from "openai/helpers/zod";
import { z } from "zod";

export const searchWebTool = zodFunction({
	name: "search_web",
	parameters: z.object({
		query: z.string().describe("The query to search the web for"),
	}),
	description: "Search the web for information",
});

export async function searchWeb(query: string) {
	const braveSearch = new BraveSearch({
		apiKey: process.env.BRAVE_API_KEY!,
	});
	const results = await braveSearch.web.search({
		q: query,
		count: 5,
	});
	const data = [];
	for (const result of results.web?.results ?? []) {
		data.push({
			title: result.title,
			description: result.description,
			url: result.url,
			metaUrl: result.meta_url,
		});
	}
	return data;
}
