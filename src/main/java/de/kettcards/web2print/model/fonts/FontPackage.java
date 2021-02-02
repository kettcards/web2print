package de.kettcards.web2print.model.fonts;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import de.kettcards.web2print.exceptions.font.FontException;
import de.kettcards.web2print.serialize.FontPackageDeserializer;
import de.kettcards.web2print.serialize.FontPackageSerializer;

import java.util.Arrays;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;

@JsonSerialize(using = FontPackageSerializer.class)
@JsonDeserialize(using = FontPackageDeserializer.class)
public class FontPackage {

    private final String name;

    private final HashSet<FontFace> fontFaces = new HashSet<>();

    public FontPackage(String name, FontFace defaultFontFace, FontFace... fontFaces) throws FontException {
        this(name, defaultFontFace, Arrays.asList(fontFaces));
    }

    public FontPackage(String name, FontFace defaultFontFace, List<FontFace> fontFaces) throws FontException {
        this.name = name;
        //default
        if (defaultFontFace == null)
            throw new FontException("default font style is not defined");
        if (!defaultFontFace.getFontStyle().equals(EnumSet.of(FontStyle.getDefaultFontStyle())))
            throw new FontException("given font face can't be set as default, requires: "
                    + FontStyle.getDefaultFontStyle() + ", but got: " + defaultFontFace.getFontStyle());
        this.fontFaces.add(defaultFontFace);
        //extra
        this.fontFaces.addAll(fontFaces);
        //fill missing
        /*
        for (var style : FontStyle.values()) {
            if (!this.fontFaces.contains(style)) {
                Integer weight = FontStyle.getWeight(style);
                float defaultLineHeight = FontStyle.getDefaultLineHeight();
                //String source = defaultFontFace.getSource();
                var missingFace = new FontFace(style, weight, defaultLineHeight, defaultFontFace.getSource());
                this.fontFaces.add(missingFace);
            }
        }
         */
    }

    public String getName() {
        return name;
    }

    public FontFace getFontFace(EnumSet<FontStyle> fontStyle) {
        for (var face : fontFaces) {
            if (face.getFontStyle().equals(fontStyle))
                return face;
        }
        return null;
    }

    public HashSet<FontFace> getFontFaces() {
        return fontFaces;
    }
}
