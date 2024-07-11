import {RepoContext} from "./use-automerge/use-repo.ts"
import {Repo} from "@automerge/automerge-repo"
import {IndexedDBStorageAdapter} from "@automerge/automerge-repo-storage-indexeddb"
import {BrowserWebSocketClientAdapter} from "@automerge/automerge-repo-network-websocket"
import {BroadcastChannelNetworkAdapter} from "@automerge/automerge-repo-network-broadcastchannel"
import {createResource, Show} from "solid-js"
import Todos from "./todos.tsx"

export default function App() {
	let [repo] = createResource(() => {
		let repo = new Repo({
			storage: new IndexedDBStorageAdapter(),
			network: [
				new BrowserWebSocketClientAdapter(
					import.meta.env.DEV
						? "ws://localhost:3030"
						: "wss://star.littlebook.app",
				),
				new BroadcastChannelNetworkAdapter(),
			],
		})
		return repo.networkSubsystem.whenReady().then(() => repo)
	})

	return (
		<Show when={repo.latest}>
			<RepoContext.Provider value={repo.latest!}>
				<Todos />
			</RepoContext.Provider>
		</Show>
	)
}
