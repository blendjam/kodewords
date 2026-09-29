import type { ListType, Player, Room } from "@kodewords/shared/types";
import { logger } from "../utils/logger";

// id -> is unique number-string combo of the room 123-classic
// roomId -> is just the number part of the room

const ROOM_EMPTY_TIMEOUT = 5 * 60 * 1000;

export class RoomManager {
  private rooms = new Map<string, Room>();
  private emptyRoomTimers = new Map<string, NodeJS.Timeout>();

  joinRoom(id: string, player: Player, listType: ListType): Room {
    const randomRoomid = Math.floor(100 + Math.random() * 9000).toString();
    const roomId = id === "" ? randomRoomid : id;
    const uniqueId = `${roomId}-${listType}`;
    let room = this.rooms.get(uniqueId);

    if (!room) {
      room = {
        id: uniqueId,
        roomId,
        players: new Map(),
        words: [],
        guessedWords: [],
        listType,
      };
      this.rooms.set(uniqueId, room);
    }

    const timer = this.emptyRoomTimers.get(uniqueId);
    if (timer) {
      logger.info("Clear Timer", { roomId });
      clearTimeout(timer);
      this.emptyRoomTimers.delete(roomId);
    }

    for (const [existingRoomId, existingRoom] of this.rooms) {
      if (existingRoomId !== uniqueId) {
        existingRoom.players.delete(player.id);
      }
    }

    const alreadyInRoom = room.players.has(player.id);

    if (!alreadyInRoom) {
      room.players.set(player.id, player);
    }

    return room;
  }

  getRoom(id: string) {
    return this.rooms.get(id);
  }

  getRoomByRoomId(roomId: string, listType: ListType): Room | undefined {
    return this.rooms.get(`${roomId}-${listType}`);
  }

  leaveRoom(id: string, playerId: string): Room | undefined {
    const room = this.rooms.get(id);
    if (!room) {
      throw new Error(`Room with id ${id} not found`);
    }

    room.players.delete(playerId);

    logger.info("Leave Room", { userId: playerId, roomId: room.id, roomSize: room.players.size });

    if (room.players.size === 0) {
      this.scheduleRoomDeletion(id);
    }
    return room;
  }

  removePlayer(playerId: string) {
    const room = this.getRoomByPlayerId(playerId);
    if (!room) return;
    this.leaveRoom(room.id, playerId);
  }

  private scheduleRoomDeletion(id: string) {
    if (this.emptyRoomTimers.has(id)) {
      logger.info("Already Scheduled for Deletion", { roomId: id });
      return;
    }
    const timer = setTimeout(() => {
      const room = this.rooms.get(id);

      if (room && room.players.size === 0) {
        this.rooms.delete(id);
        logger.info("Room Expired", {
          id,
        });
      }
      this.emptyRoomTimers.delete(id);
    }, ROOM_EMPTY_TIMEOUT);

    logger.info("Schedule Room Delete", { roomId: id });
    this.emptyRoomTimers.set(id, timer);
  }

  selectWord(id: string, playerId: string, word: string) {
    const room = this.rooms.get(id);
    if (!room) {
      throw new Error(`Room with id ${id} not found`);
    }

    const player = room.players.get(playerId);
    if (!player) {
      throw new Error(`Player with id ${playerId} not found in room ${id}`);
    }

    const index = room.guessedWords.findIndex(guessedWord => guessedWord.word === word);
    if (index === -1) {
      room.guessedWords.push({ word, playerId });
    }
  }

  toggleWord(id: string, playerId: string, word: string) {
    const room = this.rooms.get(id);
    if (!room) {
      throw new Error(`Room with id ${id} not found`);
    }

    const player = room.players.get(playerId);
    if (!player) {
      throw new Error(`Player with id ${playerId} not found in room ${id}`);
    }

    const index = room.guessedWords.findIndex(guessedWord => guessedWord.word === word);
    if (index === -1) {
      room.guessedWords.push({ word, playerId });
    } else {
      room.guessedWords.splice(index, 1);
    }
  }

  getRoomByPlayerId(playerId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.has(playerId)) {
        return room;
      }
    }
    return undefined;
  }
}

export const roomManager = new RoomManager();
