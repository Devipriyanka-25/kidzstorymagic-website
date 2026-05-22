/**
 * Data URL to HTTP URL Converter
 * Delegates to the server-side implementation that performs real persistence/upload.
 */

export async function convertDataUrlToHttpUrl(
  dataUrl,
  host = 'www.kidzstorymagic.org'
) {
  const { convertDataUrlToHttpUrl: serverConverter } = await import(
    '../api/lib/dataUrlToUrlConverter.js'
  );
  return serverConverter(dataUrl, host);
}
