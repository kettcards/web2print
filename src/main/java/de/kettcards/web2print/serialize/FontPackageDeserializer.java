package de.kettcards.web2print.serialize;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import de.kettcards.web2print.exceptions.font.FontParsingException;
import de.kettcards.web2print.exceptions.font.IllegalFontWeightException;
import de.kettcards.web2print.model.fonts.FontFace;
import de.kettcards.web2print.model.fonts.FontPackage;
import de.kettcards.web2print.model.fonts.FontStyle;
import org.springframework.boot.jackson.JsonComponent;

import java.io.IOException;
import java.util.EnumSet;
import java.util.LinkedList;

@JsonComponent
public class FontPackageDeserializer extends JsonDeserializer<FontPackage> {

    /** todo doc
     *
     * @param p
     * @param ctxt
     * @return
     * @throws IOException
     */
    @Override
    public FontPackage deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode jsonNode = p.getCodec().readTree(p);

        //packageName
        JsonNode packageNameNode = jsonNode.get("packageName");
        if (packageNameNode == null)
            throw new FontParsingException("Font packageName not specified");
        String packageName = packageNameNode.textValue();
        if (packageName.isBlank())
            throw new FontParsingException("Font packageName can't be blank");

        //faces
        JsonNode facesNode = jsonNode.get("faces");
        if (facesNode == null)
            throw new FontParsingException("Font faces not specified");
        FontFace defaultFontFace = null;
        var fontFaces = new LinkedList<FontFace>();
        for (var fontFaceNode : facesNode) {
            //face supports font styles
            JsonNode fontStyleNode = fontFaceNode.get("fontStyle");
            if (fontStyleNode == null)
                throw new FontParsingException("Font style for face " + fontFaceNode.textValue() + " undefined");

            String rawFontStyles = fontStyleNode.textValue();
            String[] rawFontStyle = rawFontStyles.split(",");
            EnumSet<FontStyle> fontStyleList = EnumSet.noneOf(FontStyle.class);
            for (var rawFont : rawFontStyle) {
                FontStyle fontStyle = FontStyle.getFontStyle(rawFont);
                if (fontStyleList.contains(fontStyle)) //ignore duplicates
                    continue;
                fontStyleList.add(fontStyle);
            }
            if (fontStyleList.isEmpty()) {
                throw new FontParsingException("Font style is empty");
            }
            boolean requireFontWeight = false;
            if (fontStyleList.size() > 1) {
                requireFontWeight = true;
            }

            //weight
            JsonNode fontWeightNode = fontFaceNode.get("fontWeight");
            int fontWeight = 0;
            if (fontWeightNode == null) {
                if (requireFontWeight) {
                    throw new FontParsingException("combined Font style " + rawFontStyles + " requires explicit weight definition - unable to load font: " + packageName);
                } else {
                    FontStyle fontStyle = null;
                    for (var style : fontStyleList) {
                        fontStyle = style;
                    }
                    fontWeight = FontStyle.getWeight(fontStyle);
                }
            } else {
                int weight = fontWeightNode.intValue();
                if ((weight % 100) == 0 || (weight > 0 && weight <= 900)) {
                    fontWeight = weight;
                } else {
                    throw new IllegalFontWeightException(packageName, rawFontStyles, weight);
                }

            }

            //line spacing
            JsonNode lineHeightNode = fontFaceNode.get("line-height");
            float lineHeight = FontStyle.getDefaultLineHeight();
            if (lineHeightNode != null) {
                float v = lineHeightNode.floatValue();
                lineHeight = v;
            }

            //source
            JsonNode sourceNode = fontFaceNode.get("source");
            if (sourceNode == null)
                throw new FontParsingException("Font style source is not defined");

            String source = sourceNode.textValue();

            if (fontStyleList.equals(EnumSet.of(FontStyle.NORMAL))) {
                defaultFontFace = new FontFace(fontStyleList, fontWeight, lineHeight, source);
            } else {
                fontFaces.add(new FontFace(fontStyleList, fontWeight, lineHeight, source));
            }
        }

        //require default font

        //return new FontPackage(packageName, fontFaces);
        return new FontPackage(packageName, defaultFontFace, fontFaces);
    }
}
