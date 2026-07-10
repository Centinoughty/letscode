import { Operation } from "./operation";
import { transform } from "./transform";

export function transformPendingQueue(
  remoteOperation: Operation,
  pendingQueue: Operation[],
): Operation {
  let transformedRemote = structuredClone(remoteOperation);

  for (let i = 0; i < pendingQueue.length; i++) {
    const pending = pendingQueue[i];

    transformedRemote = transform(transformedRemote, pending);

    pendingQueue[i] = transform(pending, transformedRemote);
  }

  return transformedRemote;
}
