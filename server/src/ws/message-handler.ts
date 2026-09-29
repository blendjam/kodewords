import type { ClientMessage } from "@kodewords/shared/messages";
import type { WebSocket } from "ws";
import { roomManager } from "../game/room-manager";
import { serializeRoom } from "@kodewords/shared/room";
import { logger } from "../utils/logger";
import { Connection } from "./connection";
import type { Player } from "@kodewords/shared/types";
import { connections } from "./connections";

function handleJoinRoom(socket: WebSocket, message: Extract<ClientMessage, { type: "join_room" }>) {
  const player = connections.getPlayerFromSocket(socket);
  if (!player) return logger.error("Player not found for socket");
  connections.updatePlayer(message.userId, { ...player, role: message.role });
  const room = roomManager.joinRoom(
    message.roomId,
    {
      id: player.id,
      name: player.name,
      role: message.role,
    },
    message.listType,
  );
  const msg = JSON.stringify({
    type: "room_state",
    payload: serializeRoom(room),
  });
  socket.send(msg);
  logger.info("Join Room", { userId: player.id, roomId: room.id, role: message.role });
}

function handleSelectWord(socket: WebSocket, message: Extract<ClientMessage, { type: "select_word" }>) {
  const player = connections.getPlayerFromSocket(socket);
  if (!player) return logger.error("Player not found for socket");
  console.log("Player role: ", player);
  const room = roomManager.getRoomByPlayerId(player.id);
  if (!room) return logger.error("Room not found for player", { playerId: player.id });
  roomManager.selectWord(room.id, player.id, message.word);
  connections.broadcastToRoom(
    room,
    JSON.stringify({
      type: "room_state",
      payload: serializeRoom(room),
    }),
  );
  logger.info("Toggle Word", { userId: player.id, roomId: room.id, word: message.word });
}

function handleLogin(socket: WebSocket, message: Extract<ClientMessage, { type: "login" }>) {
  if (connections.hasUserId(message.userId)) {
    connections.updateSocket(message.userId, socket);
    logger.warn("User already logged in", { userId: message.userId });
    return;
  }
  const newPlayer: Player = { id: message.userId, name: `Player ${message.userId}`, role: null };
  connections.addConnection(message.userId, new Connection(socket, newPlayer));
  logger.info("Login", { userId: message.userId });
}

function handleLeaveRoom(socket: WebSocket, message: Extract<ClientMessage, { type: "leave_room" }>) {
  const player = connections.getPlayerFromSocket(socket);
  if (!player) return logger.error("Player not found for socket");
  const room = roomManager.getRoomByPlayerId(player.id);
  if (!room || room.roomId !== message.roomId) {
    return logger.error("Room not found for player", { playerId: player.id, roomId: message.roomId });
  }
  roomManager.leaveRoom(room.id, player.id);
  connections.broadcastToRoom(
    room,
    JSON.stringify({
      type: "room_state",
      payload: serializeRoom(room),
    }),
  );
}

export function handleMessage(socket: WebSocket, message: ClientMessage) {
  switch (message.type) {
    case "login":
      handleLogin(socket, message);
      break;
    case "join_room":
      handleJoinRoom(socket, message);
      break;
    case "leave_room":
      handleLeaveRoom(socket, message);
      break;
    case "select_word":
      handleSelectWord(socket, message);
      break;
    default: {
      const _exhaust: never = message;
      throw new Error(`Unhandled message type ${JSON.stringify(_exhaust)}`);
    }
  }
}
