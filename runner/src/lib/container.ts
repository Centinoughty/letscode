import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { PassThrough } from "stream";
import docker from "./docker";

interface LanguageConfig {
  ext: string;
  image: string;
  command: (filePath: string) => string;
}

const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
  python: {
    ext: "py",
    image: "python:3.11-alpine",
    command: (file) => `python ${file}`,
  },
  cpp: {
    ext: "cpp",
    image: "gcc:13",
    command: (file) => `g++ ${file} -o /tmp/a.out && /tmp/a.out`,
  },
};

const CODE_DIR = "/shared/code";
const CONTAINER_DIR = "/tmp";

function createTarStream(filePath: string) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);

  return spawn("tar", ["-cf", "-", "-C", dir, base]);
}

export async function create(language: string, codeId: string) {
  const config = LANGUAGE_CONFIG[language];
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const fileName = `${codeId}.${config.ext}`;
  const hostFilePath = path.join(CODE_DIR, fileName);
  const containerFilePath = `${CONTAINER_DIR}/${fileName}`;

  if (!fs.existsSync(hostFilePath)) {
    throw new Error(`Code file not found: ${hostFilePath}`);
  }

  const cmd = config.command(containerFilePath);

  const container = await docker.createContainer({
    Image: config.image,
    Cmd: ["sh", "-c", cmd],
    WorkingDir: CONTAINER_DIR,
    NetworkDisabled: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
    HostConfig: {
      Memory: 200 * 1024 * 1024,
      CpuPeriod: 100000,
      CpuQuota: 20000,
      AutoRemove: true,
    },
  });

  try {
    const tar = createTarStream(hostFilePath);
    if (!tar.stdout) {
      throw new Error("Failed to create tar output stream");
    }

    let tarStderr = "";
    tar.stderr?.on("data", (chunk) => {
      tarStderr += chunk.toString();
    });

    const uploadPromise = container.putArchive(tar.stdout, {
      path: CONTAINER_DIR,
    });

    const tarPromise = new Promise<void>((resolve, reject) => {
      tar.on("error", reject);
      tar.on("close", (code) => {
        if (code === 0) {
          resolve();
          return;
        }
        reject(new Error(`tar failed with code ${code}: ${tarStderr.trim()}`));
      });
    });

    await Promise.all([uploadPromise, tarPromise]);

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    const out = new PassThrough();
    const err = new PassThrough();

    out.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
    err.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

    const stream = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
    });
    (docker as any).modem.demuxStream(stream, out, err);

    const streamClosed = new Promise<void>((resolve) => {
      stream.on("end", () => resolve());
      stream.on("close", () => resolve());
    });

    try {
      await container.start();
    } catch (err) {
      console.error("Failed to start container:", err);
      throw err;
    }

    await container.wait();
    await streamClosed;

    out.end();
    err.end();

    return {
      stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
      stderr: Buffer.concat(stderrChunks).toString("utf-8"),
    };
  } catch (err) {
    console.error("Container execution failed:", err);
    throw err;
  } finally {
    console.log("done");
  }
}
