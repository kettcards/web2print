package de.kettcards.web2print.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.kettcards.web2print.testUtils.SanityCheckTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("web2print")
public class ContentControllerTest implements SanityCheckTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void uploadSimpleTextResource() throws Exception {
        String data = "Simple Text here!";
        var fileData =
                new MockMultipartFile("file", "file.txt", MediaType.TEXT_PLAIN_VALUE, data.getBytes());
        String response =
                mockMvc.perform(multipart("/test/content").file(fileData))
                        .andExpect(status().isOk())
                        .andReturn().getResponse().getContentAsString();

        ObjectNode responseNode = objectMapper.readValue(response, ObjectNode.class);

        String dataResult = mockMvc.perform(get("/test/content/" + responseNode.get("contentId").asText()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertEquals(data, dataResult);
    }

}
