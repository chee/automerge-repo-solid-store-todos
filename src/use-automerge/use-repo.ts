import type {Repo} from "@automerge/automerge-repo/slim"
import {createContext, useContext} from "solid-js"
export const RepoContext = createContext<Repo | null>(null)

export function useRepo(): Repo {
	let repo = useContext(RepoContext)
	if (!repo) throw new Error("Repo was not found on RepoContext.")
	return repo
}
