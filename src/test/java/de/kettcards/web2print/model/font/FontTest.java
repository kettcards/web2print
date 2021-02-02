package de.kettcards.web2print.model.font;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.kettcards.web2print.model.fonts.FontPackage;
import de.kettcards.web2print.serialize.FontPackageSerializer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class FontTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    public void beforeEach() throws IOException {
        objectMapper = new ObjectMapper();
        var module = new SimpleModule();
        module.addSerializer(FontPackage.class, new FontPackageSerializer());
        objectMapper.registerModule(module);
    }

    @Test
    public void deserializeFont() throws IOException {
        var dummy = FontUtils.loadDummyFontPackage();
        //write
        var result = objectMapper.writeValueAsString(dummy);
        //read, non-configured mapper
        var objectMapper = new ObjectMapper();
        var node = objectMapper.readValue(result, ObjectNode.class);

        assertEquals("dummy", node.get("name").textValue());
        var faces = node.get("faces").get(0);
        assertEquals(3, faces.get("v").intValue());
        assertEquals("normal", faces.get("fs").textValue());
        assertEquals(0, faces.get("fw").intValue());

    }

}
