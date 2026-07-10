export type OpType = "insert" | "delete";

export interface BaseOp {
  id: string;
  roomId: string;
  userId: string;
  revision: number;
  type: OpType;
  timestamp: number;
}

export interface InsertOp extends BaseOp {
  type: "insert";
  position: number;
  text: string;
}

export interface DeleteOp extends BaseOp {
  type: "delete";
  position: number;
  length: number;
}

export type Operation = InsertOp | DeleteOp;
