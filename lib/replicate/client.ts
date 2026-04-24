import Replicate from "replicate";

const VERSION_CACHE_TTL_MS = 10 * 60 * 1000;

type CachedVersion = {
  expiresAt: number;
  versionId: string;
};

let replicateClient: Replicate | null = null;
const versionCache = new Map<string, CachedVersion>();

export function getReplicateClient(): Replicate {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    throw new Error(
      "REPLICATE_API_TOKEN is not configured. Add it to your environment before using Replicate services."
    );
  }

  if (!replicateClient) {
    replicateClient = new Replicate({ auth: token });
  }

  return replicateClient;
}

export async function resolveModelVersionId(
  modelOwner: string,
  modelName: string,
  envOverride?: string
): Promise<string> {
  if (envOverride) {
    return envOverride;
  }

  const cacheKey = `${modelOwner}/${modelName}`;
  const cached = versionCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.versionId;
  }

  const replicate = getReplicateClient();
  const model = (await replicate.models.get(modelOwner, modelName)) as {
    latest_version?: { id?: string | null } | null;
  };

  const versionId = model?.latest_version?.id;

  if (!versionId) {
    throw new Error(
      `Replicate model ${cacheKey} does not expose a latest version id. Set an explicit environment override instead.`
    );
  }

  versionCache.set(cacheKey, {
    expiresAt: Date.now() + VERSION_CACHE_TTL_MS,
    versionId,
  });

  return versionId;
}

export async function resolveDestinationModelVersion(
  destination: string
): Promise<string | null> {
  const [owner, name] = destination.split("/");

  if (!owner || !name) {
    return null;
  }

  const replicate = getReplicateClient();
  const model = (await replicate.models.get(owner, name)) as {
    latest_version?: { id?: string | null } | null;
  };

  return model?.latest_version?.id || null;
}
