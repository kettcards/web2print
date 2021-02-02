package de.kettcards.web2print.pdf.textBox;

import de.kettcards.web2print.model.fonts.FontStyle;

import java.util.EnumSet;

/**
 * immutable span tag representation
 */
public class TextSpan {

    private final String fontName;

    private final float fontSize;

    private final EnumSet<FontStyle> fontStyle;

    private final String text;

    public TextSpan(String fontName, float fontSize, EnumSet<FontStyle> fontStyle, String text) {
        this.fontName = fontName;
        this.fontSize = fontSize;
        this.fontStyle = fontStyle;
        this.text = text;
    }

    /**
     *
     * @return the required font for the given text
     */
    public String getFontName() {
        return fontName;
    }

    /**
     *
     * @return the required font size for the given text
     */
    public float getFontSize() {
        return fontSize;
    }

    /**
     * @return the required font style for the given text
     */
    public EnumSet<FontStyle> getFontStyle() {
        return fontStyle;
    }

    /**
     *
     * @return the text content
     */
    public String getText() {
        return text;
    }
}
