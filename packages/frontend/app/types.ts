import type { User as UserProto } from "~/gen/auth/v1/auth_pb";
import type {
	StreamChatCompletionRequest as StreamChatCompletionRequestProto,
	Message as MessageProto,
	Conversation as ConversationProto,
	SearchResult as SearchResultProto,
	File as ChatFileProto,
} from "~/gen/chat/v1/chat_pb";
import type { File as FileProto } from "~/gen/file/v1/file_pb";

export type RemoveProtoMetadata<T> = T extends object
	? T extends Array<infer U>
		? Array<RemoveProtoMetadata<U>>
		: {
				[K in keyof T as K extends "$typeName" | "$unknown"
					? never
					: K]: RemoveProtoMetadata<T[K]>;
			}
	: T;

export type User = RemoveProtoMetadata<UserProto>;

export type StreamChatCompletionRequest =
	RemoveProtoMetadata<StreamChatCompletionRequestProto>;

export type Message = RemoveProtoMetadata<MessageProto>;

export type SearchResult = RemoveProtoMetadata<SearchResultProto>;

export type Conversation = RemoveProtoMetadata<ConversationProto>;

export type ChatFile = RemoveProtoMetadata<ChatFileProto>;

export type File = RemoveProtoMetadata<FileProto>;
