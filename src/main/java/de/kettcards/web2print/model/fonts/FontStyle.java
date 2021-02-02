package de.kettcards.web2print.model.fonts;

import de.kettcards.web2print.exceptions.font.IllegalFontStyleException;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

public enum FontStyle {
    NORMAL(0 << 0),
    BOLD(1 << 0),
    ITALIC(1 << 1);

    private static final float defaultLineHeight = 1.0f;
    private static final FontStyle defaultFontStyle = FontStyle.NORMAL;
    private static final FontStyle defaultFontStyleWeight = defaultFontStyle;
    private static final Map<FontStyle, Integer> defaultFontStyleWeights = new HashMap<>();

    static {
        defaultFontStyleWeights.put(NORMAL, 400);
        defaultFontStyleWeights.put(BOLD, 700);
        defaultFontStyleWeights.put(ITALIC, 400);
    }

    public final int value;

    FontStyle(int value) {
        this.value = value;
    }

    /**
     * @param fontStyle font style
     * @return the corresponding font style weight, if no specific value is defined the default value will be returned
     */
    public static Integer getWeight(FontStyle fontStyle) {
        Integer val = defaultFontStyleWeights.get(fontStyle);
        if (val == null) {
            val = defaultFontStyleWeights.get(defaultFontStyleWeight);
        }
        return val;
    }

    /**
     * @param style style name
     * @return the corresponding enum for the given style name
     * @throws IllegalArgumentException if the given style name is not defined
     */
    public static FontStyle getFontStyle(String style) throws IllegalFontStyleException {
        var ret = EnumSet.noneOf(FontStyle.class);
        for (var fontStyle : FontStyle.values()) {
            if (fontStyle.name().equalsIgnoreCase(style))
                return fontStyle;
        }
        throw new IllegalFontStyleException(style);
    }

    public static EnumSet<FontStyle> getFontStyle(int combined) {
        var ret = EnumSet.noneOf(FontStyle.class);
        if (combined == 0)
            ret.add(FontStyle.NORMAL);
        for (var fontStyle : FontStyle.values()) {
            if ((fontStyle.value & combined) != 0)
                ret.add(fontStyle);
        }
        return ret;
    }

    public static int getValues(EnumSet<FontStyle> styles) throws IllegalFontStyleException {
        boolean wasSet = false;
        int combined = 0;
        for (var style : styles) {
            wasSet = true;
            combined += style.value;
        }
        if (!wasSet)
            throw new IllegalFontStyleException("font style is empty");
        return combined;
    }

    public static FontStyle getDefaultFontStyle() {
        return defaultFontStyle;
    }

    public static float getDefaultLineHeight() {
        return defaultLineHeight;
    }

}
