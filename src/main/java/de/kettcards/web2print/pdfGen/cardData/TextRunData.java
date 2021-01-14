package de.kettcards.web2print.pdfGen.cardData;

import de.kettcards.web2print.pdfGen.Font;
import de.kettcards.web2print.pdfGen.FontStyle;
import lombok.Getter;
import lombok.Value;
import org.apache.pdfbox.contentstream.PDContentStream;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;

import java.io.IOException;
import java.util.EnumSet;
@Getter
public class TextRunData {
    Font  font;
    float fontSize;
    EnumSet<FontStyle> attributes;
    String text;

    public TextRunData(Font font, float fontSize, EnumSet<FontStyle> attributes, String text) {
        this.font       = font;
        this.fontSize   = fontSize;
        this.attributes = attributes;
        this.text       = text;
    }

    public static final TextRunData LineBreak = new TextRunData(null, 0, null, null);
}
