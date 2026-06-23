import Docker from "dockerode";
import { env } from "../config/env";

export const docker = new Docker({
  socketPath: env.DOCKER_SOCKET_PATH,
});

export default docker;
