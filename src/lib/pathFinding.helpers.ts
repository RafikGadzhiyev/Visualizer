import { Position } from "./types"

export function getKeyForPosition(position: Position): string {
  return position.row + '__' + position.col
}

export function getPositionFromKey(key: string): Position {
  const keyParts = key
    .split('__')
    .map(
      stringifiedKeyPart => +stringifiedKeyPart
    )

  return {
    row: keyParts[0],
    col: keyParts[1],
  }
}