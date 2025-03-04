import type {
	SearchResult as SearchResultProto,
	File as FileProto,
} from "@/gen/chat/v1/chat_pb";

export type RemoveProtoMetadata<T> = T extends object
	? T extends Array<infer U>
		? Array<RemoveProtoMetadata<U>>
		: {
				[K in keyof T as K extends "$typeName" | "$unknown"
					? never
					: K]: RemoveProtoMetadata<T[K]>;
			}
	: T;

export type SearchResult = RemoveProtoMetadata<SearchResultProto>;

export type File = RemoveProtoMetadata<FileProto>;
