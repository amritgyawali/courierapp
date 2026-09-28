import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/** Stored images must stay small: device storage rows are limited to ~2 MB on Android. */
const MAX_BYTES = 350_000;

const base64Bytes = (b64: string) => Math.floor((b64.length * 3) / 4);

export type BrandImageKind = 'logo' | 'icon';

const LIMITS: Record<BrandImageKind, number> = {
  /** Longest side of a wide logo. */
  logo: 600,
  /** App icons are square. */
  icon: 256,
};

/**
 * Lets an admin choose an image from the photo library, scales it down and returns it as a data
 * URI that can be saved with the branding settings. Resolves `null` when the picker is closed.
 * Transparent PNGs stay PNG; photos that are still too large are re-encoded as JPEG.
 */
export async function pickBrandImage(kind: BrandImageKind): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: kind === 'icon',
    aspect: kind === 'icon' ? [1, 1] : undefined,
    quality: 1,
  });
  if (result.canceled || !result.assets?.length) return null;

  const original = await ImageManipulator.manipulate(result.assets[0].uri).renderAsync();
  const longest = Math.max(original.width, original.height);
  const limit = LIMITS[kind];
  const image =
    longest > limit
      ? await ImageManipulator.manipulate(original)
          .resize(original.width >= original.height ? { width: limit } : { height: limit })
          .renderAsync()
      : original;

  const png = await image.saveAsync({ format: SaveFormat.PNG, base64: true });
  if (png.base64 && base64Bytes(png.base64) <= MAX_BYTES) return `data:image/png;base64,${png.base64}`;

  const jpeg = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.82, base64: true });
  if (jpeg.base64 && base64Bytes(jpeg.base64) <= MAX_BYTES) return `data:image/jpeg;base64,${jpeg.base64}`;

  throw new Error('This image is too detailed to store. Try a simpler logo or a smaller file.');
}
