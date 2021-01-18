package de.kettcards.web2print.pdfGen.cardData;

import de.kettcards.web2print.model.fonts.Font;
import de.kettcards.web2print.model.fonts.FontStyle;
import lombok.Data;

import java.util.EnumSet;

@Data
public class TextRunData {

    public static final TextRunData LineBreak = new TextRunData(null, 0, null, null);

    Font font;

    float fontSize;

    EnumSet<FontStyle> attributes;

    String text;

    public TextRunData(Font font, float fontSize, EnumSet<FontStyle> attributes, String text) {
        this.font = font;
        this.fontSize = fontSize;
        this.attributes = attributes;
        this.text = text;
    }

}
