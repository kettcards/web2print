package de.kettcards.web2print.model.fonts;

import org.apache.fontbox.ttf.TTFParser;
import org.apache.fontbox.ttf.TrueTypeFont;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;

import java.io.IOException;
import java.io.InputStream;
import java.util.EnumSet;
import java.util.Objects;

public class FontFace {

    private final EnumSet<FontStyle> fontStyle;

    private final int fontWeight;

    private final float lineHeight;

    private final String source;

    private TrueTypeFont font;

    public FontFace(EnumSet<FontStyle> fontStyle, int fontWeight, float lineHeight, String source) {
        this(fontStyle, fontWeight, lineHeight, source, null);
    }

    public FontFace(EnumSet<FontStyle> fontStyle, int fontWeight, float lineHeight, String source, TrueTypeFont trueTypeFont) {
        this.fontStyle = fontStyle;
        this.fontWeight = fontWeight;
        this.lineHeight = lineHeight;
        this.source = source;
        this.font = trueTypeFont;
    }

    public boolean isLoaded() {
        return font != null;
    }

    public void load(InputStream inputStream) throws IOException {
        font = new TTFParser().parse(inputStream);
    }

    public PDFont embed(PDDocument pdDocument) throws IOException {
            return PDType0Font.load(pdDocument, font, true);
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof FontFace) {
            return obj.hashCode() == this.hashCode();
        }
        return false;
    }

    @Override
    public int hashCode() {
        return Objects.hash(fontStyle);
    }

    public EnumSet<FontStyle> getFontStyle() {
        return fontStyle;
    }

    public int getFontWeight() {
        return fontWeight;
    }

    public float getLineHeight() {
        return lineHeight;
    }

    public String getSource() {
        return source;
    }

}
