import { Connection, Node } from './types'

export const collapseNodes = ({
	activeId,
	collapseIds,
	nodes,
	connections,
}: {
  activeId: number
  collapseIds: number[]
  nodes: Node[]
  connections: Connection[]
}) => {
	if (activeId === -1) return nodes

	const activeNode = nodes.find((node) => node.id === activeId)
	if (!activeNode) return nodes

	collapseIds.forEach((collapseId) => {
		const collapsedNode = nodes.find((node) => node.id === collapseId)
		if (!collapsedNode) return nodes

		const queue: Node[] = []
		let visited: Node[] = []
		let potentialToggle: Node[] = []

		collapsedNode.collapsed = !collapsedNode.collapsed
		queue.push(collapsedNode)
		visited.push(collapsedNode)

		// set the collapsed node as the first node in the queue
		// set this node to collapsed but not hidden
		// loop over each connections looking for the collapsed node as source or target
		// if found, find corresponding nodes to those connections
		// if the node is not the active node, add it to the queue
		// add node to potentialHidden node list
		while (queue.length > 0) {
			const currentNode = queue.shift() as Node
			connections.forEach((connection) => {
				const regex = /(\d+)-(\d+)/
				const match = connection.id.match(regex)

				if (match) {
					const sourceId = Number.parseInt(match[1])
					const targetId = Number.parseInt(match[2])
					let foundConnectionId = -1

					if (sourceId === currentNode.id) {
						foundConnectionId = targetId
					} else if (targetId === currentNode.id) {
						foundConnectionId = sourceId
					}

					if (foundConnectionId !== -1 && foundConnectionId !== activeId) {
						const foundNode = nodes.find(
							(node) => node.id === foundConnectionId,
						)
						if (
							foundNode &&
              !visited.find((visit) => visit.fullPath === foundNode.fullPath)
						) {
							queue.push(foundNode)
							visited.push(foundNode)
							potentialToggle.push(foundNode)
						}
					}
				}
			})
		}

		// set the active node as the first node in the queue
		// loop over each connections looking for the active node as source or target
		// break if any connection contains the collapsed id
		// if found, remove the corresponding node from the potentialHidden node list
		if (collapseId !== activeId) {
			visited = []

			queue.push(activeNode)
			visited.push(activeNode)

			while (queue.length > 0) {
				const currentNode = queue.shift() as Node
				connections.forEach((connection) => {
					const regex = /(\d+)-(\d+)/
					const match = connection.id.match(regex)

					if (match) {
						const sourceId = Number.parseInt(match[1])
						const targetId = Number.parseInt(match[2])
						let foundConnectionId = -1

						if (sourceId === currentNode.id) {
							foundConnectionId = targetId
						} else if (targetId === currentNode.id) {
							foundConnectionId = sourceId
						}

						if (foundConnectionId !== -1 && foundConnectionId !== collapseId) {
							const foundNode = nodes.find(
								(node) => node.id === foundConnectionId,
							)
							if (
								foundNode &&
                !visited.find((visit) => visit.fullPath === foundNode.fullPath)
							) {
								queue.push(foundNode)
								visited.push(foundNode)
								potentialToggle = potentialToggle.filter(
									(node) => node.id !== foundNode.id,
								)
							}
						}
					}
				})
			}
		}

		// remaining nodes in the potentialHidden node list are hidden
		potentialToggle.forEach((hiddenNode) => {
			const foundNode = nodes.find((node) => node.id === hiddenNode.id)

			if (foundNode) {
				foundNode.hidden = !foundNode.hidden
			}
		})
	})

	return nodes
}
