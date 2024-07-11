import {makePersisted} from "@solid-primitives/storage"
import {createSignal, For, Match, Switch} from "solid-js"
import useDocument from "./use-automerge/use-document.ts"
import type {DocumentId} from "@automerge/automerge-repo"
import {useRepo} from "./use-automerge/use-repo.ts"

type Project = {
	name: string
	items: {
		title: string
		complete: boolean
	}[]
}

export default function Todos() {
	let repo = useRepo()
	let [projectId, setProjectId] = makePersisted(
		createSignal("" as DocumentId),
		{
			name: "project-id",
		},
	)
	let [state, setState] = createSignal<"fresh" | "creating" | "joining">(
		"fresh",
	)

	let [project, change] = useDocument<Project>(projectId)

	let input: HTMLInputElement | undefined

	return (
		<div class="section is-align-items-center is-justify-content-center is-flex is-flex-grow-1">
			<div class="box">
				<Switch>
					<Match when={projectId()}>
						<h1 class="is-size-3 has-text-weight-medium">{project()?.name}</h1>
						<form
							onsubmit={event => {
								event.preventDefault()
								if (!input || !input.value) return

								change(project => {
									project.items.push({
										title: input.value,
										complete: false,
									})
								})
								input.value = ""
							}}>
							<label class="label">
								<div class="field has-addons">
									<div class="control">
										<input
											ref={input}
											class="input"
											type="text"
											placeholder="pick up milk"
										/>
									</div>
									<div class="control">
										<button type="submit" class="button is-info">
											add
										</button>
									</div>
								</div>
							</label>
						</form>
						<ul class="is-size-5">
							<For each={project()?.items}>
								{(item, index) => (
									<li>
										{" "}
										<label class="checkbox">
											<input
												type="checkbox"
												checked={item.complete}
												onchange={event => {
													change(project => {
														project.items[index()].complete =
															event.target.checked
													})
												}}
											/>
											<span> {item.title}</span>
										</label>
									</li>
								)}
							</For>
						</ul>
					</Match>
					<Match when={!projectId()}>
						<Switch>
							<Match when={state() == "fresh"}>
								<div class="buttons is-justify-content-center">
									<button
										type="button"
										class="button is-primary"
										onclick={() => setState("creating")}>
										create a new project
									</button>
									<button
										type="button"
										class="button"
										onclick={() => setState("joining")}>
										join a friend's project
									</button>
								</div>
							</Match>
							<Match when={state() == "creating"}>
								<form
									onsubmit={event => {
										event.preventDefault()
										if (!input || !input.value) return
										let p = repo.create<Project>({
											name: input?.value,
											items: [
												{
													title: "my first item",
													complete: false,
												},
											],
										})
										setProjectId(p.documentId)
									}}>
									<label class="label">
										<span> project name</span>
										<div class="field has-addons">
											<div class="control">
												<input
													ref={input}
													class="input"
													type="text"
													placeholder="my project"
												/>
											</div>
											<div class="control">
												<button type="submit" class="button is-info">
													create
												</button>
											</div>
										</div>
									</label>
								</form>
							</Match>
							<Match when={state() == "joining"}>
								<form
									onsubmit={event => {
										event.preventDefault()
										if (!input || !input.value) return
										setProjectId(input.value as DocumentId)
									}}>
									<label class="label">
										<span>project id</span>
										<div class="field has-addons">
											<div class="control">
												<input
													ref={input}
													class="input"
													type="text"
													placeholder="3RPg2aNXM8nRpT...."
												/>
											</div>
											<div class="control">
												<button type="submit" class="button is-info">
													join
												</button>
											</div>
										</div>
									</label>
								</form>
							</Match>
						</Switch>
					</Match>
				</Switch>
			</div>
		</div>
	)
}
