import {
  getReplicateClient,
  resolveDestinationModelVersion,
  resolveModelVersionId,
} from "@/lib/replicate/client";

const FLUX_TRAINER_OWNER = "ostris";
const FLUX_TRAINER_MODEL = "flux-dev-lora-trainer";
type DestinationModelRef = `${string}/${string}`;

type TrainingStatus =
  | "starting"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";

export type FluxLoraTrainingInput = {
  zipUrl: string;
  triggerWord: string;
  destination?: DestinationModelRef;
  destinationOwner?: string;
  destinationName?: string;
  webhook?: string;
  webhookEventsFilter?: Array<"start" | "output" | "logs" | "completed">;
};

export type FluxLoraTrainingSummary = {
  completedModelVersion: string | null;
  destination: string | null;
  error: string | null;
  id: string;
  logs: string | null;
  output: Record<string, unknown> | null;
  startedAt: string | null;
  status: TrainingStatus | string;
  triggerWord: string;
  weightsUrl: string | null;
};

function resolveDestination(
  input: FluxLoraTrainingInput
): DestinationModelRef {
  if (input.destination) {
    return input.destination;
  }

  const owner = input.destinationOwner || process.env.REPLICATE_TRAINING_OWNER;
  const modelName =
    input.destinationName || process.env.REPLICATE_TRAINING_MODEL_NAME;

  if (!owner || !modelName) {
    throw new Error(
      "A destination model is required. Provide destination directly or set REPLICATE_TRAINING_OWNER and REPLICATE_TRAINING_MODEL_NAME."
    );
  }

  return `${owner}/${modelName}` as DestinationModelRef;
}

function normalizeTraining(
  training: Record<string, any>,
  completedModelVersion: string | null,
  triggerWord: string
): FluxLoraTrainingSummary {
  const output = training.output && typeof training.output === "object"
    ? training.output
    : null;

  return {
    completedModelVersion,
    destination: typeof training.destination === "string" ? training.destination : null,
    error: typeof training.error === "string" ? training.error : null,
    id: String(training.id),
    logs: typeof training.logs === "string" ? training.logs : null,
    output,
    startedAt: typeof training.started_at === "string" ? training.started_at : null,
    status: String(training.status),
    triggerWord,
    weightsUrl:
      output && typeof output.weights === "string" ? output.weights : null,
  };
}

export async function startFluxLoraTraining(
  input: FluxLoraTrainingInput
): Promise<FluxLoraTrainingSummary> {
  const replicate = getReplicateClient();
  const trainerVersion = await resolveModelVersionId(
    FLUX_TRAINER_OWNER,
    FLUX_TRAINER_MODEL,
    process.env.REPLICATE_FLUX_TRAINER_VERSION
  );
  const destination = resolveDestination(input);

  const training = await replicate.trainings.create(
    FLUX_TRAINER_OWNER,
    FLUX_TRAINER_MODEL,
    trainerVersion,
    {
      destination,
      input: {
        input_images: input.zipUrl,
        trigger_word: input.triggerWord,
        lora_type: "subject",
      },
      webhook: input.webhook,
      webhook_events_filter: input.webhookEventsFilter,
    }
  );

  return normalizeTraining(training as Record<string, any>, null, input.triggerWord);
}

export async function getFluxLoraTrainingStatus(
  trainingId: string,
  triggerWord = ""
): Promise<FluxLoraTrainingSummary> {
  const replicate = getReplicateClient();
  const training = (await replicate.trainings.get(trainingId)) as Record<
    string,
    any
  >;

  const completedModelVersion =
    String(training.status) === "succeeded" && typeof training.destination === "string"
      ? await resolveDestinationModelVersion(training.destination)
      : null;

  return normalizeTraining(training, completedModelVersion, triggerWord);
}

export async function waitForFluxLoraTraining(
  trainingId: string,
  {
    pollIntervalMs = 15_000,
    timeoutMs = 45 * 60 * 1000,
    triggerWord = "",
  }: {
    pollIntervalMs?: number;
    timeoutMs?: number;
    triggerWord?: string;
  } = {}
): Promise<FluxLoraTrainingSummary> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const summary = await getFluxLoraTrainingStatus(trainingId, triggerWord);

    if (
      summary.status === "succeeded" ||
      summary.status === "failed" ||
      summary.status === "canceled"
    ) {
      return summary;
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(
    `Timed out while waiting for Replicate training ${trainingId} to finish.`
  );
}
