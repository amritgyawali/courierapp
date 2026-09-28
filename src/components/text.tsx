import { createContext, type Ref, use } from 'react';
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  type StyleProp,
  StyleSheet,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { type Theme, useTheme } from '@/theme';

/**
 * Drop-in replacements for React Native's `Text` and `TextInput` that apply the brand font and
 * text size from the theme. Import these instead of the React Native ones.
 *
 * Custom fonts register one family per weight (e.g. `Poppins_700Bold`), so the style's
 * `fontWeight` is translated into the matching family here, once, instead of in every style.
 */

/** True inside another Text: nested text without its own weight inherits the parent's face. */
const InsideText = createContext(false);

/** React Native's default font size, scaled when a text size other than Default is chosen. */
const BASE_FONT_SIZE = 14;

function themedTextStyle({ fonts, textScale }: Theme, style: StyleProp<TextStyle>, nested: boolean): TextStyle | null {
  const flat: TextStyle = StyleSheet.flatten(style) ?? {};
  const out: TextStyle = {};

  if (!flat.fontFamily && !(nested && flat.fontWeight == null)) {
    const face = fonts.face(flat.fontWeight);
    if (face) {
      out.fontFamily = face;
      // The face already carries the weight; a bold weight on top would be synthesised twice.
      out.fontWeight = 'normal';
    }
  }

  if (textScale !== 1) {
    if (flat.fontSize != null) out.fontSize = flat.fontSize * textScale;
    else if (!nested) out.fontSize = BASE_FONT_SIZE * textScale;
    if (flat.lineHeight != null) out.lineHeight = flat.lineHeight * textScale;
  }

  return Object.keys(out).length > 0 ? out : null;
}

export function Text({ style, ref, ...rest }: TextProps & { ref?: Ref<NativeText> }) {
  const theme = useTheme();
  const nested = use(InsideText);
  const themed = themedTextStyle(theme, style, nested);
  return (
    <InsideText value>
      <NativeText ref={ref} {...rest} style={themed ? [style, themed] : style} />
    </InsideText>
  );
}

export function TextInput({ style, ref, ...rest }: TextInputProps & { ref?: Ref<NativeTextInput> }) {
  const theme = useTheme();
  const themed = themedTextStyle(theme, style, false);
  return <NativeTextInput ref={ref} {...rest} style={themed ? [style, themed] : style} />;
}

export type { TextInputProps, TextProps };
