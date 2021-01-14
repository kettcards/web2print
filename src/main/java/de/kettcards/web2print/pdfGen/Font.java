package de.kettcards.web2print.pdfGen;

import lombok.Value;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;

import java.io.File;
import java.io.IOException;
import java.util.EnumSet;

public class Font {
    private final PDFont _default;
    private final PDFont bold;
    private final PDFont italic;
    private final PDFont bold_italic;

    public Font(PDFont custom, PDFont custom_bold, PDFont custom_italic, PDFont custom_bold_italic) {
        this._default = custom;
        this.bold = custom_bold;
        this.italic = custom_italic;
        this.bold_italic = custom_bold_italic;
    }

    public PDFont resolve(EnumSet<FontStyle> style) {
        if (style.contains(FontStyle.BOLD)) {
            if (style.contains(FontStyle.ITALIC)) {
                return bold_italic;
            } else {
                return bold;
            }
        } else if (style.contains(FontStyle.ITALIC)) {
            return italic;
        } else {
            return _default;
        }
    }

    public static class Provider {
        private final String name;
        public String getName() { return name; }

        private final File default_file;
        private final File bold_file;
        private final File italic_file;
        private final File bold_italic_file;

        public Provider(String name, File default_file, File bold_file, File italic_file, File bold_italic_file) {
            this.name             = name;
            this.default_file     = default_file;
            this.bold_file        = bold_file;
            this.italic_file      = italic_file;
            this.bold_italic_file = bold_italic_file;
        }

        public Font load(PDDocument targetDoc) throws IOException {
            return new Font(
                PDType0Font.load(targetDoc, default_file),
                PDType0Font.load(targetDoc, bold_file),
                PDType0Font.load(targetDoc, italic_file),
                PDType0Font.load(targetDoc, bold_italic_file)
            );
        }
    }
}
