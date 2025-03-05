import { Code, ConnectError, type ConnectRouter } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { load } from "cheerio";
import type {
	ChatCompletionContentPart,
	ChatCompletionMessageParam,
} from "openai/resources";
import OpenAI from "openai";
import { getAuthInfo, getEnv } from "@/store-context";
import { ChatService, Feature } from "@/gen/chat/v1/chat_pb";
import conversationService from "@/services/conversations";
import messagesService from "@/services/messages";
import { searchWebTool, searchWeb } from "@/ai/tools/search-web";
import { generateImageTool, generateImage } from "@/ai/tools/generate-image";
import { browserUrlTool, browseUrl } from "@/ai/tools/browser-url";
import { ListMessagesResponseSchema } from "@/gen/chat/v1/chat_pb";
import type { Message } from "@/models/messages";

export function getChatRoutes(router: ConnectRouter) {
	return router.service(ChatService, {
		streamChatCompletion: async function* (req, ctx) {
			try {
				const env = getEnv(ctx);
				const { userId } = getAuthInfo(ctx);
				const { conversationId, message } = req;
				const messagesFromDB = await messagesService.listMessages(
					env,
					userId,
					conversationId,
				);
				const messages = getOpenaiMessagesFromDBMessages(messagesFromDB);
				if (req.files.length > 0) {
					const content: ChatCompletionContentPart[] = [];
					content.push({
						type: "text",
						text: req.message,
					});
					for (const file of req.files) {
						content.push({
							type: "image_url",
							image_url: {
								url: file.url,
							},
						});
					}
					messages.push({
						role: "user",
						content,
					});
				} else {
					messages.push({
						role: "user",
						content: req.message,
					});
				}
				const tools: any[] = [];
				for (const feature of req.features) {
					if (feature === Feature.GENERATE_IMAGE) {
						tools.push(generateImageTool);
					}
					if (feature === Feature.SEARCH_WEB) {
						tools.push(searchWebTool);
					}
					if (feature === Feature.BROWSER_URL) {
						tools.push(browserUrlTool);
					}
				}
				const openai = new OpenAI({
					baseURL: env.OPENROUTER_BASE_URL,
					apiKey: env.OPENROUTER_API_KEY,
				});
				const completion = await openai.chat.completions.create({
					model: "openai/gpt-4o-mini",
					messages,
					tools,
					stream: true,
				});
				let responseMessage = "";
				const toolCallMap = new Map<
					number,
					OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall
				>();
				for await (const chunk of completion) {
					const delta = chunk.choices[0].delta;
					if (delta.content) {
						responseMessage += delta.content;
						yield { message: delta.content };
					}
					for (const toolCall of delta.tool_calls ?? []) {
						const existingCall = toolCallMap.get(toolCall.index);
						if (existingCall) {
							if (toolCall.function?.name) {
								existingCall.function = existingCall.function || {};
								existingCall.function.name = toolCall.function.name;
							}
							if (toolCall.function?.arguments) {
								existingCall.function = existingCall.function || {};
								existingCall.function.arguments =
									(existingCall.function.arguments || "") +
									toolCall.function.arguments;
							}
							if (toolCall.id) {
								existingCall.id = toolCall.id;
							}
							if (toolCall.type) {
								existingCall.type = toolCall.type;
							}
						} else {
							toolCallMap.set(toolCall.index, {
								index: toolCall.index,
								id: toolCall.id,
								type: toolCall.type,
								function: {
									name: toolCall.function?.name,
									arguments: toolCall.function?.arguments || "",
								},
							});
						}
					}
				}
				const toolCalls = Array.from(toolCallMap.values());
				const generatedImageUrls: string[] = [];
				const searchResults: any[] = [];
				for (const toolCall of toolCalls) {
					const id = toolCall.id;
					const name = toolCall.function?.name;
					const functionArguments = toolCall.function?.arguments;
					if (!id || !name || !functionArguments) {
						continue;
					}
					const args = JSON.parse(functionArguments);
					if (name === "generate_image") {
						yield {
							runningFeature: Feature.GENERATE_IMAGE,
						};
						const imageUrl = await generateImage(env, args.prompt as string);
						yield {
							generatedImageUrls: [imageUrl],
						};
						generatedImageUrls.push(imageUrl);
						messages.push({
							role: "assistant",
							content: null,
							tool_calls: [
								{
									id,
									type: "function",
									function: {
										name: "generate_image",
										arguments: functionArguments,
									},
								},
							],
						});
						messages.push({
							role: "tool",
							tool_call_id: id,
							content: "images has been generated successfully",
						});
					}
					if (name === "search_web") {
						yield {
							runningFeature: Feature.SEARCH_WEB,
						};
						const results = await searchWeb(args.query as string);
						searchResults.push(...results);
						yield {
							searchResults: results,
						};
						messages.push({
							role: "assistant",
							content: null,
							tool_calls: [
								{
									id,
									type: "function",
									function: {
										name: "search_web",
										arguments: functionArguments,
									},
								},
							],
						});
						const resultsWithContent: any[] = [];
						// Only fetch content for the first 3 results
						const resultsToFetch = results.slice(0, 3);
						
						// First, add all results to resultsWithContent with empty content
						for (const result of results) {
							resultsWithContent.push({
								...result,
								content: "",
							});
						}
						
						// Then fetch and update content only for the first 3 results
						for (let i = 0; i < resultsToFetch.length; i++) {
							const result = resultsToFetch[i];
							try {
								const controller = new AbortController();
								const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout
								const response = await fetch(result.url, {
									signal: controller.signal,
								});
								clearTimeout(timeoutId);
								const $ = load(await response.text());
								// Update the content in the corresponding result
								resultsWithContent[i].content = $("body").text();
							} catch (error) {
								console.error("error: ", error);
							}
						}
						messages.push({
							role: "tool",
							tool_call_id: id,
							content: JSON.stringify(resultsWithContent),
						});
					}
					if (name === "browser_url") {
						yield {
							runningFeature: Feature.BROWSER_URL,
						};
						const result = await browseUrl(env, args.url as string);
						yield {
							browserUrlResult: result,
						};
						messages.push({
							role: "assistant",
							content: null,
							tool_calls: [
								{
									id,
									type: "function",
									function: {
										name: "browser_url",
										arguments: functionArguments,
									},
								},
							],
						});
					}
				}
				if (toolCalls.length > 0) {
					const completion2 = await openai.chat.completions.create({
						model: "google/gemini-2.0-flash-001",
						messages,
						tools,
						stream: true,
					});
					for await (const chunk of completion2) {
						const delta = chunk.choices[0].delta;
						if (delta.content) {
							responseMessage += delta.content;
							yield { message: delta.content };
						}
					}
				}
				await messagesService.createMessage(env, {
					userId,
					conversationId,
					role: "user",
					message,
					files: req.files,
				});
				await messagesService.createMessage(env, {
					userId,
					conversationId,
					role: "assistant",
					message: responseMessage,
					searchResults,
					generatedImageUrls,
				});
			} catch (error) {
				console.error("error: ", error);
				throw new ConnectError("failed to stream chat", Code.Internal);
			}
		},
		createConversation: async (req, ctx) => {
			try {
				const env = getEnv(ctx);
				const { userId } = getAuthInfo(ctx);
				const title = req.initialMessage.slice(0, 20);
				const conversation = await conversationService.createConversation(env, {
					userId,
					title,
				});
				return {
					conversation,
				};
			} catch (error) {
				console.error("error: ", error);
				throw new ConnectError("failed to create conversation", Code.Internal);
			}
		},
		listConversations: async (req, ctx) => {
			const env = getEnv(ctx);
			const { userId } = getAuthInfo(ctx);
			const conversations = await conversationService.listConversations(
				env,
				userId,
			);
			return {
				conversations,
			};
		},
		listMessages: async (req, ctx) => {
			const env = getEnv(ctx);
			const { userId } = getAuthInfo(ctx);
			const dbMessages = await messagesService.listMessages(
				env,
				userId,
				req.conversationId,
			);
			return create(ListMessagesResponseSchema, {
				messages: dbMessages.map((msg) => ({
					id: msg.id,
					userId: msg.userId,
					conversationId: msg.conversationId,
					role: msg.role,
					message: msg.message,
					files: msg.files || [],
					generatedImageUrls: msg.generatedImageUrls || [],
					searchResults: msg.searchResults || [],
					createdAt: msg.createdAt,
					updatedAt: msg.updatedAt,
				})),
			});
		},
		updateConversation: async (req, ctx) => {
			const env = getEnv(ctx);
			const { userId } = getAuthInfo(ctx);
			const { conversationId, conversation } = req;
			const resp = await conversationService.updateConversation(
				env,
				userId,
				conversationId,
				conversation!,
			);
			return {
				conversation: resp,
			};
		},
		deleteConversation: async (req, ctx) => {
			const env = getEnv(ctx);
			const { userId } = getAuthInfo(ctx);
			await conversationService.deleteConversation(
				env,
				userId,
				req.conversationId,
			);
			return {};
		},
	});
}

function getOpenaiMessagesFromDBMessages(messagesFromDB: Message[]) {
	const messages: ChatCompletionMessageParam[] = [];
	for (const m of messagesFromDB) {
		const content: string | Array<ChatCompletionContentPart> = [];
		content.push({
			type: "text",
			text: m.message,
		});
		for (const c of m.files ?? []) {
			if (c.mimeType.startsWith("image/")) {
				content.push({
					type: "image_url",
					image_url: {
						url: c.url,
					},
				});
			}
		}
		messages.push({
			role: m.role as any,
			content,
		});
	}
	return messages;
}
