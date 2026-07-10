import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { MemoryStore } from "../store/memoryStore";
import { Language, Room, User } from "../types/room";
import { Operation } from "../types/operation";
import { transform } from "../ot/transform";
import { applyOp } from "../ot/apply";

const uploadsDir = "/shared/code";

const languageExtensions: Record<Language, string> = {
  CPP: "cpp",
  JAVASCRIPT: "js",
  PYTHON: "py",
  TYPESCRIPT: "ts",
};

export class RoomManager {
  constructor(private store: MemoryStore) {}

  public getRoom(roomId: string): Room | undefined {
    return this.store.getRoom(roomId);
  }

  public createRoom(roomId: string, language: Language): Room {
    const room: Room = {
      roomId,
      users: new Map(),
      language,
      document: {
        content: "",
        revision: 0,
        history: [],
        hydrated: false,
      },
    };

    this.store.setRoom(roomId, room);

    return room;
  }

  private resolveCodeFilePath(roomId: string, language: Language): string {
    const fileExtension = languageExtensions[language];

    return path.join(uploadsDir, `${roomId}.${fileExtension}`);
  }

  private async ensureCodeFile(
    roomId: string,
    language: Language,
    seedCode: string,
  ): Promise<string> {
    const filePath = this.resolveCodeFilePath(roomId, language);

    await mkdir(path.dirname(filePath), { recursive: true });

    try {
      return await readFile(filePath, "utf8");
    } catch {
      await writeFile(filePath, seedCode, "utf8");
      return seedCode;
    }
  }

  public getOrCreateRoom(roomId: string, langauge: Language): Room {
    let room = this.getRoom(roomId);

    if (!room) {
      room = this.createRoom(roomId, langauge);
    }

    return room;
  }

  public async joinRoom(
    roomId: string,
    langauge: Language,
    user: User,
  ): Promise<Room> {
    const room = this.getOrCreateRoom(roomId, langauge);

    room.users.set(user.socketId, user);

    if (!room.document.hydrated) {
      room.document.content = await this.ensureCodeFile(
        roomId,
        room.language,
        room.document.content,
      );

      room.document.hydrated = true;
    } else {
      await this.ensureCodeFile(roomId, room.language, room.document.content);
    }

    return room;
  }

  public async leaveRoom(roomId: string, socketId: string): Promise<void> {
    const room = this.store.getRoom(roomId);

    if (!room) return;

    room.users.delete(socketId);

    if (room.users.size === 0) {
      await writeFile(
        this.resolveCodeFilePath(roomId, room.language),
        room.document.content,
        "utf8",
      );

      this.store.deleteRoom(roomId);
    }
  }

  public applyOperation(
    operation: Operation,
  ): { room: Room; operation: Operation } | undefined {
    const room = this.store.getRoom(operation.roomId);
    if (!room) return;

    let transformed = operation;

    const missingOps = room.document.history.filter(
      (historyOp) =>
        historyOp.revision >= operation.revision &&
        historyOp.userId !== operation.userId,
    );

    for (const prevOp of missingOps) {
      transformed = transform(transformed, prevOp);
    }

    room.document.content = applyOp(room.document.content, transformed);
    room.document.revision++;

    transformed.revision = room.document.revision;

    room.document.history.push(transformed);

    if (room.document.history.length > 500) {
      room.document.history.shift();
    }

    return { room, operation: transformed };
  }
}
