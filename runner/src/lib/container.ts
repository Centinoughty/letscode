import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { PassThrough } from "stream";
import docker from "./docker";

interface LanguageConfig {
  ext: string;
  image: string;
  command: (filePath: string, inputPath: string) => string;
}

const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
  python: {
    ext: "py",
    image: "python:3.11-alpine",
    command: (file, inputPath) => `python ${file} < ${inputPath}`,
  },
  cpp: {
    ext: "cpp",
    image: "gcc:13",
    command: (file, inputPath) =>
      `g++ ${file} -o /tmp/a.out && /tmp/a.out < ${inputPath}`,
  },
  javascript: {
    ext: "js",
    image: "node:22-alpine",
    command: (file, inputPath) => `node ${file} < ${inputPath}`,
  },
  typescript: {
    ext: "ts",
    image: "node:22-alpine",
    command: (file, inputPath) => `npx tsx ${file} < ${inputPath}`,
  },
  java: {
    ext: "java",
    image: "eclipse-temurin:17-jdk-alpine",
    command: (file, inputPath) => {
      const className = path.basename(file, ".java");

      return `
      javac ${file} &&
      java -cp /tmp ${className} < ${inputPath}
    `;
    },
  },
};

const CODE_DIR = "/tmp";
const CONTAINER_DIR = "/tmp";

function createTarStream(workingDir: string, files: string[]) {
  return spawn("tar", ["-cf", "-", "-C", workingDir, ...files]);
}

export async function create(
  language: string,
  codeId: string,
  code: string,
  stdin: string = "",
) {
  const tempId = crypto.randomUUID();
  const workingDir = path.join(CODE_DIR, tempId);

  fs.mkdirSync(workingDir, {
    recursive: true,
  });

  const config = LANGUAGE_CONFIG[language];
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const fileName = `${codeId}.${config.ext}`;
  const inputFileName = `${codeId}-stdin.txt`;

  const hostFilePath = path.join(workingDir, fileName);
  const hostInputPath = path.join(workingDir, inputFileName);

  const containerFilePath = `${CONTAINER_DIR}/${fileName}`;
  const containerInputPath = `${CONTAINER_DIR}/${inputFileName}`;

  fs.writeFileSync(hostFilePath, code, "utf-8");
  fs.writeFileSync(hostInputPath, stdin, "utf-8");

  const cmd = config.command(containerFilePath, containerInputPath);

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
    const tar = createTarStream(workingDir, [fileName, inputFileName]);
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
    try {
      fs.rmSync(path.join(CODE_DIR, tempId), {
        recursive: true,
        force: true,
      });
    } catch (e) {
      console.error("Cleanup failed:", e);
    }
  }
}
