package de.kettcards.web2print.model.font;


import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import de.kettcards.web2print.exceptions.font.FontParsingException;
import de.kettcards.web2print.model.fonts.FontFace;
import de.kettcards.web2print.model.fonts.FontPackage;
import de.kettcards.web2print.model.fonts.FontStyle;
import de.kettcards.web2print.serialize.FontPackageDeserializer;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import java.util.EnumSet;

import static org.junit.jupiter.api.Assertions.assertThrows;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class FontPackageTest {

    private final FontFace nullFace = new FontFace(EnumSet.of(FontStyle.NORMAL), -1, -1, null);
    private ObjectMapper objectMapper;

    @BeforeAll
    public void beforeAll() {
        objectMapper = new ObjectMapper();
        SimpleModule simpleModule = new SimpleModule();
        //simpleModule.addSerializer();
        simpleModule.addDeserializer(FontPackage.class, new FontPackageDeserializer());
        objectMapper.registerModule(simpleModule);
    }

    @Test
    public void emptyFile() {
        assertThrows(JsonMappingException.class, () -> objectMapper.readValue("{ \"fontstyle\" : 3 }", FontPackage.class));
    }

    @Test
    public void invalidFontJson() {
        var j = "{\n" +
                "  \"name\" : \"Cinzel\",\n" +
                "  \"faces\" : [\n" +
                "    {\n" +
                "      \"fontStyle\" : \"NONE\",\n" +
                "      \"source\" : \"static/Cinzel-Regular.ttf\"\n" +
                "    },\n" +
                "    {\n" +
                "      \"fontStyle\" : \"BOLD\",\n" +
                "      \"source\" : \"static/Cinzel-Bold.ttf\"\n" +
                "    },\n" +
                "    {\n" +
                "      \"fontStyle\" : \"black\",\n" +
                "      \"fontWeight\" : 900,\n" +
                "      \"line-height\" : 1,\n" +
                "      \"source\" : \"static/Cinzel-Black.ttf\"\n" +
                "    }\n" +
                "  ]\n" +
                "}";
        assertThrows(FontParsingException.class, () -> objectMapper.readValue(j, FontPackage.class));
    }

}
