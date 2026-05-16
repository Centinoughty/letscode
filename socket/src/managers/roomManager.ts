import { MemoryStore } from "../store/memoryStore";
import { Room, User } from "../types/room";

export class RoomManager {
  constructor(private store: MemoryStore) {}

  public createRoom(roomId: string): Room {
    const room: Room = {
      roomId,
      users: new Map(),
      code: null,
    };

    this.store.setRoom(roomId, room);

    return room;
  }

  public getOrCreateRoom(roomId: string): Room {
    let room = this.store.getRoom(roomId);

    if (!room) {
      room = this.createRoom(roomId);
    }

    return room;
  }

  public joinRoom(roomId: string, user: User): Room {
    const room = this.getOrCreateRoom(roomId);

    room.users.set(user.socketId, user);

    return room;
  }

  public leaveRoom(roomId: string, socketId: string): void {
    const room = this.store.getRoom(roomId);

    if (!room) return;

    room.users.delete(socketId);

    if (room.users.size === 0) {
      this.store.deleteRoom(roomId);
    }
  }

  public updateCode(roomId: string, newCode: string): Room | undefined {
    const room = this.store.getRoom(roomId);

    if (!room) return;

    room.code = newCode;

    return room;
  }
}
