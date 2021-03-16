package de.kettcards.web2print.serialize;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import de.kettcards.web2print.model.fonts.FontPackage;
import de.kettcards.web2print.model.fonts.FontStyle;
import org.springframework.boot.jackson.JsonComponent;

import java.io.IOException;

@JsonComponent
public class FontPackageSerializer extends JsonSerializer<FontPackage> {

    /** todo doc
     *
     * @param value
     * @param gen
     * @param serializers
     * @throws IOException
     */
    @Override
    public void serialize(FontPackage value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();

        gen.writeStringField("name", value.getName());
        gen.writeArrayFieldStart("faces");
        for (var face : value.getFontFaces()) {
            gen.writeStartObject();
            gen.writeNumberField("v", FontStyle.getValues(face.getFontStyle()));
            var fs = "normal";
            if (face.getFontStyle().contains(FontStyle.ITALIC)) {
                fs = "italic";
            }
            gen.writeStringField("fs", fs);
            gen.writeNumberField("fw", face.getFontWeight());
            gen.writeStringField("s", value.getName().toLowerCase() + "/" + face.getSource()); //TODO same problem as in font service .load()
            gen.writeEndObject();
        }
        gen.writeEndArray();

        gen.writeEndObject();
    }

}
