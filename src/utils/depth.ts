import { Connection } from './types'

export const findMaxDepth = (connections: Connection[] | undefined) => {
  if (!connections) return 0

  let maxDepth = 0

  // loop over each connection to find depth at each node
  connections.forEach((connection) => {
    const source = connection.source
    const target = connection.target

    // setup initial values for the current connection we are finding the depth for
    let count = 0
    const touchedNodes: { [key: number]: boolean } = {}
    const queue: Array<{ node: number; depth: number }> = [
      { node: source, depth: 0 },
      { node: target, depth: 0 },
    ]

    while (queue.length > 0) {
      const { node, depth } = queue.shift()!

      // if the node has not been touched, add it to the touched nodes and increase the depth count
      if (!touchedNodes[node]) {
        touchedNodes[node] = true
        count = Math.max(count, depth)

        // loop over all connections to find the next node to add to the queue
        // nodes at this level are all part of the same depth level
        connections.forEach((connection) => {
          if (connection.source === node && !touchedNodes[connection.target]) {
            queue.push({ node: connection.target, depth: depth + 1 })
          } else if (
            connection.target === node &&
            !touchedNodes[connection.source]
          ) {
            queue.push({ node: connection.source, depth: depth + 1 })
          }
        })
      }
    }

    // update the max depth if the current connection has a higher depth
    maxDepth = Math.max(maxDepth, count)
  })

  return maxDepth
}
