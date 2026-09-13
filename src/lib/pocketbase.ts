import PocketBase from 'pocketbase';

export const POCKETBASE_URL = import.meta.env.PUBLIC_POCKETBASE_URL as string | undefined;

export function pocketbase(): PocketBase {
  if (!POCKETBASE_URL) {
    throw new Error('PUBLIC_POCKETBASE_URL is not configured');
  }
  return new PocketBase(POCKETBASE_URL);
}

export function pocketbaseFileUrl(
  pb: PocketBase,
  record: { collectionId: string; id: string },
  filename: string,
): string {
  if (!filename) return '';
  return pb.files.getURL(record, filename);
}