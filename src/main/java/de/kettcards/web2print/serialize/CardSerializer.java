package de.kettcards.web2print.serialize;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import de.kettcards.web2print.model.db.Card;
import org.springframework.boot.jackson.JsonComponent;

import java.io.IOException;

@JsonComponent
public class CardSerializer extends JsonSerializer<Card> {

    @Override
    public void serialize(Card value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();

        gen.writeStringField("orderId", value.getOrderId());
        gen.writeStringField("thumbSlug", value.getThumbSlug());
        gen.writeStringField("name", value.getName());
        gen.writeObjectField("cardFormat", value.getCardFormat());
        gen.writeObjectField("texture", value.getTexture());

        gen.writeFieldName("motives");
        gen.writeStartObject();
        String frontSlug = null;
        if (value.getFrontMotive() != null) {
            frontSlug = value.getFrontMotive().getTextureSlug();
        } else if (value.getCardFormat().getDefaultFrontMotive() != null) {
            frontSlug = value.getCardFormat().getDefaultFrontMotive().getTextureSlug();
        }

        if (frontSlug != null)
            gen.writeStringField("front", frontSlug);

        String backSlug = null;
        if (value.getBackMotive() != null) {
            backSlug = value.getBackMotive().getTextureSlug();
        } else if (value.getCardFormat().getDefaultBackMotive() != null) {
            backSlug = value.getCardFormat().getDefaultBackMotive().getTextureSlug();
        }

        if (backSlug != null)
            gen.writeStringField("back", backSlug);

        gen.writeEndObject();

        gen.writeEndObject();
    }

}
