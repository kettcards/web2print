package de.kettcards.web2print.serialize;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import de.kettcards.web2print.config.ApplicationConfiguration;
import org.springframework.boot.jackson.JsonComponent;

import java.io.IOException;

@JsonComponent
public class ConfigurationResourceSerializer extends JsonSerializer<ApplicationConfiguration> {

    @Override
    public void serialize(ApplicationConfiguration value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();

        ApplicationConfiguration.Link links = value.getLinks();
        ApplicationConfiguration.EditorConfiguration config = value.getEditor();
        gen.writeFieldName("links");
        gen.writeStartObject();
        gen.writeStringField("basePath", links.getBasePath());
        gen.writeStringField("apiUrl", links.getBasePath() + links.getApiPath());

        gen.writeStringField("textureUrl", links.getTextureUrl());
        gen.writeStringField("thumbnailUrl", links.getThumbnailUrl());
        gen.writeStringField("fontUrl", links.getFontUrl());
        gen.writeStringField("motiveUrl", links.getMotiveUrl());
        gen.writeStringField("redirectUrl", links.getRedirectUrl());
        gen.writeStringField("orderUrl", links.getOrderUrl());
        gen.writeStringField("impressUrl", links.getImpressUrl());
        gen.writeEndObject();

        gen.writeFieldName("editorConfiguration");
        gen.writeStartObject();

        gen.writeNumberField("maxFileSize", config.getMaxFileSize().toMegabytes());
        gen.writeNumberField("maxRequestSize", config.getMaxRequestSize().toMegabytes());

        gen.writeEndObject();

        gen.writeEndObject();
    }

}
