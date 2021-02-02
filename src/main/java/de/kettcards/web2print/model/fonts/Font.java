package de.kettcards.web2print.model.fonts;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.util.ArrayList;
import java.util.EnumSet;

public class Font {

    @Getter
    private final String name;

    private final PDFont defaultFont;
    private final PDFont boldFont;
    private final PDFont italicFont;
    private final PDFont boldItalicFont;

    public Font(PDFont defaultFont, PDFont bold, PDFont italicFont, PDFont boldItalicFont) {
        this(null, defaultFont, bold, italicFont, boldItalicFont);
    }

    public Font(String name, PDFont defaultFont, PDFont bold, PDFont italicFont, PDFont boldItalicFont) {
        this.name = name;
        this.defaultFont = defaultFont;
        this.boldFont = bold;
        this.italicFont = italicFont;
        this.boldItalicFont = boldItalicFont;
    }

    public PDFont resolve(EnumSet<FontStyle> style) {
        if (style.contains(FontStyle.BOLD)) {
            if (style.contains(FontStyle.ITALIC)) {
                return boldItalicFont;
            } else {
                return boldFont;
            }
        } else if (style.contains(FontStyle.ITALIC)) {
            return italicFont;
        } else {
            return defaultFont;
        }
    }

    @Slf4j
    public static class Provider {
        @JsonProperty
        @Getter
        private final String name;
        private Face default_face;
        private Face bold_face;
        private Face italic_face;
        private Face bold_italic_face;

        public Provider(String name, Face default_face, Face bold_face, Face italic_face, Face bold_italic_face) {
            this.name = name;
            this.default_face = default_face;
            this.bold_face = bold_face;
            this.italic_face = italic_face;
            this.bold_italic_face = bold_italic_face;
        }

        @JsonGetter("faces")
        public ArrayList<Face> getFaces() {
            var list = new ArrayList<Face>(4);
            list.add(default_face);
            if (bold_face != null) list.add(bold_face);
            if (italic_face != null) list.add(italic_face);
            if (bold_italic_face != null) list.add(bold_italic_face);
            return list;
        }

        @JsonSetter("faces")
        public void setFaces(Face[] faces) {
            for (var face : faces) {
                switch (face.v) {
                    case 0b000:
                        this.default_face = face;
                        break;
                    case 0b001:
                        this.bold_face = face;
                        break;
                    case 0b010:
                        this.italic_face = face;
                        break;
                    case 0b011:
                        this.bold_italic_face = face;
                        break;
                    default:
                        log.warn("tried loading FontFace with invalid value '" + face + "'");
                        break;
                }
            }
        }

        public Font load(PDDocument targetDoc) throws IOException {
            var defaultResource = default_face.underlyingResource;
            var boldResource = bold_face == null ? defaultResource : bold_face.underlyingResource;
            var italicResource = italic_face == null ? defaultResource : italic_face.underlyingResource;
            var boldItalicResource = bold_italic_face == null ? defaultResource : bold_italic_face.underlyingResource;
            return new Font(name,
                    PDType0Font.load(targetDoc, defaultResource.getInputStream()),
                    PDType0Font.load(targetDoc, boldResource.getInputStream()),
                    PDType0Font.load(targetDoc, italicResource.getInputStream()),
                    PDType0Font.load(targetDoc, boldItalicResource.getInputStream())
            );
        }
    }

    @Data
    @AllArgsConstructor
    public static class Face {
        @JsonIgnore
        Resource underlyingResource;

        @JsonProperty
        Integer v;
        @JsonProperty
        String fs;
        @JsonProperty
        Integer fw;
        @JsonProperty
        String s;
    }
}
