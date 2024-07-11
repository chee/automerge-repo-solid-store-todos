import type {
	AnyDocumentId,
	ChangeFn,
	DocHandleChangePayload,
} from "@automerge/automerge-repo"
import {useRepo} from "./use-repo.ts"
import type {AutomergeValue} from "@automerge/automerge/next"
import {createStore, produce, type SetStoreFunction} from "solid-js/store"
import {createEffect, createResource, createSignal, onCleanup} from "solid-js"

export default function useDocument<T extends Record<string, AutomergeValue>>(
	id: () => AnyDocumentId | undefined,
): [() => Readonly<T> | undefined, (fn: ChangeFn<T>) => void] {
	let repo = useRepo()
	let [handle] = createResource(async () => {
		if (!id()) return
		let handle = repo.find<T>(id()!)
		await handle.whenReady()
		return handle
	})
	let applying = false

	let [docSig, setDocSig] = createSignal<[T, SetStoreFunction<T>]>()

	createEffect(() => {
		if (!handle()) return
		let [doc, updateDoc] = createStore<T>(handle()!.docSync()!)
		setDocSig(() => [doc, updateDoc])
		function patch(payload: DocHandleChangePayload<T>) {
			if (applying) {
				return
			}
			for (const patch of payload.patches) {
				switch (patch.action) {
					case "insert": {
						// todo handle multiple values via splice
						// @ts-expect-error
						updateDoc(...patch.path, patch.values[0])
						continue
					}
					case "inc": {
						let cur = doc
						let path = [...patch.path]
						while (path.length) {
							// @ts-expect-error
							cur = cur[path.shift()!]
						}
						// @ts-expect-error
						updateDoc(...patch.path, cur + patch.value)
						continue
					}
					case "put":
						// @ts-expect-error
						updateDoc(...patch.path, patch.value)
						continue
					case "del":
					case "splice": {
						let target = patch.path[patch.path.length - 2]
						let point = patch.path[patch.path.length - 1]
						let path = patch.path.slice(0, -2)

						updateDoc(
							produce(doc => {
								let cur: any = doc
								let p = [...path]

								while (p.length) {
									let key = p.shift()!
									cur = cur[key]
								}
								if (patch.action == "del") {
									if (typeof cur[target] == "string") {
										cur[target].slice(0, point as number) +
											cur[target].slice(+point + (patch.length || 0))
									} else if (Array.isArray(cur[target])) {
										cur[target].splice(point as number, patch.length || 1)
									} else {
										throw new Error(
											`unexpected splice target ${target} ${cur[target]}`,
										)
									}
								} else {
									if (typeof cur[target] == "string") {
										cur[target] =
											cur[target].slice(0, point as number) +
											patch.value +
											cur[target].slice(point as number)
									} else if (Array.isArray(cur[target])) {
										cur[target].splice(point as number, 0, patch.value)
									} else {
										throw new Error(
											`unexpected splice target ${target} ${cur[target]}`,
										)
									}
								}
							}),
						)
						continue
					}
				}
			}
		}
		handle()?.on("change", patch)
		onCleanup(() => {
			handle()?.off("change", patch)
		})
	})

	return [
		() => docSig()?.[0],
		(fn: ChangeFn<T>) => {
			applying = true
			handle.latest?.change(fn)
			docSig()?.[1](produce(doc => fn(doc)))
			applying = false
		},
	]
}
