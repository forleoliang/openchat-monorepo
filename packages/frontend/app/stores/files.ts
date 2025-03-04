import { create } from "zustand";
import type { File } from "~/types";

interface FilesState {
	files: File[];
	setFiles: (files: File[]) => void;
	addFile: (file: File) => void;
}

export const useFilesStore = create<FilesState>()((set) => ({
	files: [],
	setFiles: (files: File[]) => set({ files }),
	addFile: (file: File) => set((state) => ({ files: [...state.files, file] })),
}));
