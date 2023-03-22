import * as vscode from 'vscode'

import { fetchDirectoryConnections } from './fetchDirectoryConnections'
import { fetchFiles } from './fetchFiles'
import { fetchInteractionConnections } from './fetchInteractionConnections'
import { processData } from './processData'

const codeGraphyConfiguration = vscode.workspace.getConfiguration().codegraphy
const blacklist = codeGraphyConfiguration.blacklist

let saveNodeSize: string
let saveInteractionConnections: string
let saveNodeDepth: number

export const handleMessages = (webview: vscode.Webview) => {
  receiveMessages(webview)

  sendMessages(webview)
}

const receiveMessages = async (webview: vscode.Webview) => {
  // currentPath = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath
  // currentPath = replaceAll(currentPath, '/', '\\')

  webview.onDidReceiveMessage(async (message) => {
    switch (message.command) {
      case 'openFile':
        await vscode.workspace
          .openTextDocument(vscode.Uri.file(message.text))
          .then(async (doc) => {
            await vscode.window.showTextDocument(doc)
          })

        await getGraphData(webview, {
          nodeSize: saveNodeSize,
          interactionConnections: saveInteractionConnections,
          nodeDepth: saveNodeDepth,
        })

        return
      case 'getGraphData': {
        await getGraphData(webview, message)
      }
    }
  })
}

const getGraphData = async (
  webview: vscode.Webview,
  message: {
    nodeSize: string
    interactionConnections: string
    nodeDepth: number
  },
) => {
  const currentPath = vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders[0].uri.path
    : ''
  const currentOpenFile =
    vscode.window.activeTextEditor?.document.fileName || null
  const { files, dirs } = await fetchFiles(currentPath, blacklist, true)

  saveNodeSize = message.nodeSize
  saveInteractionConnections = message.interactionConnections
  saveNodeDepth = message.nodeDepth

  let processedData
  let connections

  if (message.interactionConnections === 'Interaction') {
    connections = await fetchInteractionConnections(files, currentPath)
    processedData = processData(
      files,
      message.nodeSize,
      connections,
      currentOpenFile,
      message.nodeDepth,
    )
  } else {
    connections = fetchDirectoryConnections(files, dirs)
    processedData = processData(
      files,
      message.nodeSize,
      connections,
      currentOpenFile,
      message.nodeDepth,
      dirs,
    )
  }

  const nodes = processedData.nodes
  connections = processedData.connections

  await webview.postMessage({
    command: 'setGraphData',
    text: {
      connections: connections,
      nodes: nodes,
      currentOpenFile: currentOpenFile,
    },
  })
  return
}

const sendMessages = (webview: vscode.Webview) => {
  vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    if (editor) {
      await webview.postMessage({
        command: 'setCurrentFile',
        text: editor.document.fileName ?? null,
      })
    }
  })
}
