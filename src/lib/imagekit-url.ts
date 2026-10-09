/**
 * Card thumbnails come from ImageKit's URL transformations, so each photo is
 * uploaded once. 640px wide, slightly reduced quality, format picked by
 * ImageKit (WebP/AVIF) for each browser.
 */
export function thumbUrl(url: string) {
  return `${url}${url.includes("?") ? "&" : "?"}tr=w-640,q-72`;
}
