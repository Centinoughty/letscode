import { Room } from "../types/room";

export class MemoryStore {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public setRoom(roomId: string, room: Room): void {
    this.rooms.set(roomId, room);
  }

  public deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  public hasRoom(roomId: string): boolean {
    return this.rooms.has(roomId);
  }
}
