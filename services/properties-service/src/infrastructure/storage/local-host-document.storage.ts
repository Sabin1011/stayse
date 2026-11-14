
import {
  mkdir,
  readFile,
  unlink,
  writeFile,
} from "node:fs/promises";

import path from "node:path";
import { randomUUID } from "node:crypto";

const STORAGE_DIRECTORY =
  process.env.HOST_DOCUMENT_STORAGE_PATH ??
  "/app/private-documents";

export class LocalHostDocumentStorage {
  async save(
    buffer: Buffer,
    extension: string,
  ): Promise<string> {
    await mkdir(STORAGE_DIRECTORY, {
      recursive: true,
      mode: 0o700,
    });

    const storageKey = `${randomUUID()}.${extension}`;

    const filePath = path.join(
      STORAGE_DIRECTORY,
      storageKey,
    );

    await writeFile(filePath, buffer, {
      flag: "wx",
      mode: 0o600,
    });

    return storageKey;
  }

  async read(storageKey: string): Promise<Buffer> {
    return readFile(this.resolvePath(storageKey));
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = this.resolvePath(storageKey);

    await unlink(filePath).catch(() => undefined);
  }

  private resolvePath(storageKey: string): string {
    if (!/^[a-f0-9-]+\.(pdf|jpg|png)$/i.test(storageKey)) {
      throw new Error("Invalid document storage key");
    }

    return path.join(STORAGE_DIRECTORY, storageKey);
  }
}
