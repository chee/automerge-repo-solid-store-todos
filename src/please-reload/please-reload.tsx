import {Show} from "solid-js"
import {useRegisterSW} from "virtual:pwa-register/solid"
import {Portal} from "solid-js/web"
import "./please-reload.css"

export default function Reload() {
	let {
		offlineReady: [offlineReady, setOfflineReady],
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegistered(r) {
			// eslint-disable-next-line prefer-template
			console.log("sw registered: " + r)
		},
		onRegisterError(error) {
			console.log("sw registration error", error)
		},
	})

	function close() {
		setOfflineReady(false)
		setNeedRefresh(false)
	}

	return (
		<Portal>
			<Show when={offlineReady() || needRefresh()}>
				<dialog class="sw-please-reload" open>
					<p>
						<Show
							fallback={<span>refresh for the latest littlebook</span>}
							when={offlineReady()}>
							<span>littlebook ready for offline :)</span>
						</Show>
					</p>
					<Show when={needRefresh()}>
						<button
							type="button"
							class="button"
							onclick={() => updateServiceWorker(true)}>
							Reload
						</button>
					</Show>
					<button type="button" class="primary button" onclick={() => close()}>
						close
					</button>
				</dialog>
			</Show>
		</Portal>
	)
}
