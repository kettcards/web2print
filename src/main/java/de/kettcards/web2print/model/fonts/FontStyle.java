package de.kettcards.web2print.model.fonts;

import de.kettcards.web2print.exceptions.font.IllegalFontStyleException;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

public enum FontStyle {
    /**
     * normal style
     */
    NORMAL(0 << 0),
    /**
     * bold style
     */
    BOLD(1 << 0),
    /**
     * italic style
     */
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

    private final int value;

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

    /**
     *
     * @param combined combined value
     * @return a set of FontStyle based on the combined value
     */
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

    /**
     *
     * @param styles set to be converted
     * @return the numeric value for the given set
     * @throws IllegalFontStyleException if the given set is empty
     */
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

    /**
     *
     * @return the default font style
     */
    public static FontStyle getDefaultFontStyle() {
        return defaultFontStyle;
    }

    /**
     *
     * @return the default line height
     */
    public static float getDefaultLineHeight() {
        return defaultLineHeight;
    }

    /**
     *
     * @return the numeric value associated to the given font style
     */
    public int getValue() {
        return value;
    }
}
