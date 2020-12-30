package de.kettcards.web2print.serialize;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import de.kettcards.web2print.config.Web2PrintApplicationConfiguration;
import de.kettcards.web2print.model.projectons.CardOverview;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jackson.JsonComponent;

import java.io.IOException;

@JsonComponent
public class CardOverviewSerializer extends JsonSerializer<CardOverview> {

    @Autowired
    private Web2PrintApplicationConfiguration configuration;

    @Override
    public void serialize(CardOverview value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();

        gen.writeStringField("name", value.getName());
        gen.writeStringField("orderId", value.getOrderId());
        gen.writeStringField("thumbnail", configuration.getLinks().getThumbnailUrl().concat(value.getThumbSlug()));

        gen.writeEndObject();
    }

}
