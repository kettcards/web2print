package de.kettcards.web2print.serialize;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import de.kettcards.web2print.config.Web2PrintApplicationConfiguration;
import org.springframework.boot.jackson.JsonComponent;

import java.io.IOException;

@JsonComponent
public class ConfigurationResourceSerializer extends JsonSerializer<Web2PrintApplicationConfiguration> {

    @Override
    public void serialize(Web2PrintApplicationConfiguration value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();

        Web2PrintApplicationConfiguration.Link links = value.getLinks();
        gen.writeFieldName("links");
        gen.writeStartObject();
        gen.writeStringField("basePath", links.getBasePath());
        gen.writeStringField("apiUrl", links.getBasePath() + links.getApiPath());

        gen.writeStringField("materialUrl", links.getMaterialUrl());
        gen.writeStringField("thumbnailUrl", links.getThumbnailUrl());
        gen.writeStringField("fontUrl", links.getFontUrl());
        gen.writeStringField("motiveUrl", links.getMotiveUrl());
        gen.writeEndObject();

        gen.writeEndObject();
    }

}
