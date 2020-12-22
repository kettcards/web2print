package de.kettcards.web2print.serialize;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import org.springframework.boot.jackson.JsonComponent;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Sort;

import java.io.IOException;

@JsonComponent
public class PageSerializer extends JsonSerializer<PageImpl<?>> {

    @Override
    public void serialize(PageImpl<?> value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();

        gen.writeObjectField("content", value.getContent());

        gen.writeFieldName("page");
        gen.writeStartObject();

        gen.writeNumberField("totalPages", value.getTotalPages());
        gen.writeNumberField("totalElements", value.getTotalElements());
        gen.writeNumberField("numberOfElements", value.getNumberOfElements());


        Sort sort = value.getSort();
        if (!sort.isEmpty()) {
            gen.writeArrayFieldStart("sort");

            for (Sort.Order s : sort) {
                gen.writeStartObject();
                gen.writeStringField("property", s.getProperty());
                gen.writeStringField("directionName", s.getDirection().name());
                gen.writeBooleanField("ignoreCase", s.isIgnoreCase());
                gen.writeEndObject();
            }
            gen.writeEndArray();
        }
        gen.writeEndObject();

        gen.writeEndObject();
    }
}
